import { Edges, Float, Grid, RoundedBox, Text, useTexture } from '@react-three/drei'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { Suspense, useMemo, useRef } from 'react'
import { AdditiveBlending, Color, MathUtils, ShaderMaterial, SRGBColorSpace, type Group, type Mesh } from 'three'
import type { Chart, Project } from '../../content/types'
import { useEventually } from '../../hooks/useEventually'
import { isFromUi } from '../helpers'
import { PROJECT_VIEWPOINT, SCREEN_HEIGHT, SCREEN_WIDTH, type ScreenPlacement } from '../layout'
import { useWorld } from '../store'
import { CYAN, DISPLAY_FONT, GLOW, LIME, MONO_FONT, PINK } from '../theme'
import { useZoneActive } from '../useZoneActive'

const WIDTH = SCREEN_WIDTH
const HEIGHT = SCREEN_HEIGHT
const PAD = 0.28
const MAX_TILT = 0.18
/** Right half of the screen, where a project's chart sits beside the title and footer text. */
const CHART_BOX = { width: 1.85, height: 1.5, x: WIDTH / 2 - PAD - 0.925, y: -0.05 }
/** Text column width to the left of the chart. */
const TEXT_WIDTH = WIDTH - PAD * 2 - CHART_BOX.width - 0.2
/** Keeps the (mostly white) figures under the bloom threshold and tints them to the hologram. */
const CHART_TINT = '#9cc9d1'

const scanlineShader = {
  uniforms: { uTime: { value: 0 }, uHot: { value: 0 }, uColor: { value: new Color(CYAN) } },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
  `,
  fragmentShader: /* glsl */ `
    uniform float uTime;
    uniform float uHot;
    uniform vec3 uColor;
    varying vec2 vUv;
    void main() {
      float lines = step(0.5, fract(vUv.y * 140.0)) * 0.035;
      float sweep = smoothstep(0.0, 0.04, 0.04 - abs(fract(uTime * 0.18) - vUv.y)) * 0.25;
      float edge = smoothstep(0.0, 0.15, vUv.x) * smoothstep(1.0, 0.85, vUv.x);
      gl_FragColor = vec4(uColor, (lines + sweep) * edge * (0.6 + uHot));
    }
  `,
}

/** The project's first figure, fitted inside the chart box and tinted to sit behind the scanlines. */
function ChartPlane({ chart }: { chart: Chart }) {
  const texture = useTexture(chart.src)
  texture.colorSpace = SRGBColorSpace
  const image = texture.image as { width: number; height: number } | undefined
  const aspect = image && image.height ? image.width / image.height : 2
  const width = Math.min(CHART_BOX.width, CHART_BOX.height * aspect)
  const height = width / aspect
  return (
    <mesh position={[CHART_BOX.x, CHART_BOX.y, 0.055]}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial map={texture} color={CHART_TINT} transparent opacity={0.95} toneMapped={false} />
    </mesh>
  )
}

/** Ring that replaces the surge screen's chart while the lab is open, filling with the estimated probability. */
function SurgeGauge() {
  const probability = useWorld((s) => s.surgeProbability)
  const ring = useRef<Mesh>(null)
  const color = useMemo(() => new Color(), [])
  useFrame((state, delta) => {
    if (!ring.current || probability === null) return
    const pulse = 1 + Math.sin(state.clock.elapsedTime * (2 + probability * 6)) * 0.06 * probability
    ring.current.scale.setScalar(MathUtils.damp(ring.current.scale.x, pulse, 8, Math.min(delta, 0.1)))
  })
  if (probability === null) return null
  color.set(CYAN).lerp(new Color(PINK), probability).multiplyScalar(GLOW)
  return (
    <group position={[CHART_BOX.x, CHART_BOX.y, 0.08]}>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.55, 0.015, 8, 64]} />
        <meshBasicMaterial color="#334155" toneMapped={false} />
      </mesh>
      <mesh ref={ring} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.55, 0.06, 12, 96, Math.PI * 2 * probability]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      <Text font={DISPLAY_FONT} fontSize={0.34} color="white" anchorX="center" anchorY="middle">
        {`${Math.round(probability * 100)}%`}
      </Text>
      <Text font={MONO_FONT} fontSize={0.09} color={CYAN} anchorX="center" anchorY="top" position={[0, -0.66, 0]}>
        surge lab · live
      </Text>
    </group>
  )
}

interface ScreenProps {
  project: Project
  index: number
  placement: ScreenPlacement
  /** Chart textures load only once the camera approaches the projects zone. */
  shouldLoadCharts: boolean
}

function Screen({ project, index, placement, shouldLoadCharts }: ScreenProps) {
  const tilt = useRef<Group>(null)
  const pointerUv = useRef<{ x: number; y: number } | null>(null)
  const scan = useMemo(() => new ShaderMaterial({ ...scanlineShader, uniforms: { ...scanlineShader.uniforms, uTime: { value: 0 }, uHot: { value: 0 } }, transparent: true, depthWrite: false, blending: AdditiveBlending }), [])
  const isHot = useWorld((s) => s.hoveredProject === index || s.focusedProject === index)
  const isDimmed = useWorld((s) => s.focusedProject !== null && s.focusedProject !== index)
  const isLabOpen = useWorld((s) => project.lab === 'surge' && s.surgeProbability !== null)
  const { hoverProject, focusProject, setCursor } = useWorld.getState()

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.1)
    scan.uniforms.uTime!.value = state.clock.elapsedTime + index
    scan.uniforms.uHot!.value = MathUtils.damp(scan.uniforms.uHot!.value as number, isHot ? 1 : 0, 6, dt)
    if (!tilt.current) return
    const uv = pointerUv.current
    tilt.current.rotation.y = MathUtils.damp(tilt.current.rotation.y, uv ? (uv.x - 0.5) * MAX_TILT * 2 : 0, 6, dt)
    tilt.current.rotation.x = MathUtils.damp(tilt.current.rotation.x, uv ? -(uv.y - 0.5) * MAX_TILT * 2 : 0, 6, dt)
    const s = MathUtils.damp(tilt.current.scale.x, isHot ? 1.06 : 1, 6, dt)
    tilt.current.scale.setScalar(s)
  })

  const onMove = (e: ThreeEvent<PointerEvent>) => {
    if (isFromUi(e.nativeEvent) || !e.uv) return
    pointerUv.current = { x: e.uv.x, y: e.uv.y }
    hoverProject(index)
    setCursor('hover', 'open')
  }
  const left = -WIDTH / 2 + PAD
  const accent = isHot ? PINK : CYAN

  return (
    <group position={placement.position} rotation={[0, placement.rotationY, 0]}>
      <Float speed={1.4} rotationIntensity={0.08} floatIntensity={0.35}>
        <group ref={tilt}>
          <RoundedBox
            args={[WIDTH, HEIGHT, 0.08]}
            radius={0.08}
            smoothness={4}
            onPointerMove={onMove}
            onPointerOut={() => {
              pointerUv.current = null
              hoverProject(null)
              setCursor('default')
            }}
            onClick={(e) => {
              if (isFromUi(e.nativeEvent)) return
              e.stopPropagation()
              focusProject(index)
            }}
          >
            <meshPhysicalMaterial color="#081022" transparent opacity={isDimmed ? 0.35 : 0.82} roughness={0.2} metalness={0.4} />
            <Edges color={new Color(accent).multiplyScalar(isHot ? GLOW : 1.2)} />
          </RoundedBox>
          {shouldLoadCharts && project.charts?.[0] && !isLabOpen && (
            <Suspense fallback={null}>
              <ChartPlane chart={project.charts[0]} />
            </Suspense>
          )}
          <mesh position={[0, 0, 0.06]} material={scan}>
            <planeGeometry args={[WIDTH, HEIGHT]} />
          </mesh>
          {project.lab === 'surge' && <SurgeGauge />}
          <group position={[0, 0, 0.07]}>
            <Text font={MONO_FONT} fontSize={0.11} color={CYAN} anchorX="left" anchorY="top" position={[left, HEIGHT / 2 - PAD, 0]}>
              {`${String(index + 1).padStart(2, '0')} · ${project.category.toUpperCase()}`}
            </Text>
            <Text
              font={DISPLAY_FONT}
              fontSize={project.charts?.length ? 0.25 : 0.3}
              color="white"
              anchorX="left"
              anchorY="top"
              maxWidth={project.charts?.length ? TEXT_WIDTH : WIDTH - PAD * 2}
              lineHeight={1.05}
              position={[left, HEIGHT / 2 - PAD - 0.25, 0]}
            >
              {project.title}
            </Text>
            <Text font={MONO_FONT} fontSize={0.15} color={LIME} anchorX="left" anchorY="bottom" position={[left, -HEIGHT / 2 + PAD + 0.32, 0]}>
              {project.impact}
            </Text>
            <Text
              font={MONO_FONT}
              fontSize={0.095}
              color="#94a3b8"
              anchorX="left"
              anchorY="bottom"
              maxWidth={project.charts?.length ? TEXT_WIDTH : WIDTH - PAD * 2}
              position={[left, -HEIGHT / 2 + PAD, 0]}
            >
              {project.stack.slice(0, project.charts?.length ? 3 : 5).join('  ·  ')}
            </Text>
            <Text font={MONO_FONT} fontSize={0.09} color={accent} anchorX="right" anchorY="bottom" position={[-left, -HEIGHT / 2 + PAD + 0.36, 0]}>
              {isHot ? 'open ↗' : ''}
            </Text>
          </group>
        </group>
      </Float>
    </group>
  )
}

/** Projects zone: floating holographic screens on an arc. Hover to tilt, click to fly in. */
export function HoloScreens({ stop, projects, placements }: { stop: number; projects: Project[]; placements: ScreenPlacement[] }) {
  const isActive = useZoneActive([stop])
  const shouldLoadCharts = useEventually(isActive)
  return (
    <group visible={isActive}>
      {projects.map((project, i) => (
        <Screen key={project.title} project={project} index={i} placement={placements[i]!} shouldLoadCharts={shouldLoadCharts} />
      ))}
      <Grid
        position={[PROJECT_VIEWPOINT[0], PROJECT_VIEWPOINT[1] - 2.4, PROJECT_VIEWPOINT[2] - 6]}
        args={[40, 40]}
        cellSize={0.8}
        cellColor="#16203b"
        sectionSize={4}
        sectionColor="#3b2a6b"
        fadeDistance={22}
        fadeStrength={2}
      />
    </group>
  )
}
