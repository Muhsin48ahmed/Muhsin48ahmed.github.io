import { Billboard, Edges, Grid, Line, Text } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { AdditiveBlending, Color, MathUtils, Object3D, type Group, type InstancedMesh } from 'three'
import type { Milestone } from '../../content/types'
import { CITY_CENTER, milestoneHeight, milestoneSites } from '../layout'
import type { Vec3 } from '../network'
import { createRng } from '../random'
import { useWorld } from '../store'
import { CYAN, DISPLAY_FONT, GLOW, MONO_FONT, VIOLET } from '../theme'
import { useZoneActive } from '../useZoneActive'

const GRID_X = 26
const GRID_Z = 22
const CELL = 1.5
const CLEARANCE = 2.6 // keep blocks off the timeline path
const RISE_SPEED = 2.2

interface Block {
  position: Vec3
  height: number
  color: Color
}

function distanceToPath(x: number, z: number, sites: readonly Vec3[]): number {
  return sites.slice(1).reduce((best, b, i) => {
    const a = sites[i]!
    const [dx, dz] = [b[0] - a[0], b[2] - a[2]]
    const t = MathUtils.clamp(((x - a[0]) * dx + (z - a[2]) * dz) / (dx * dx + dz * dz), 0, 1)
    return Math.min(best, Math.hypot(x - (a[0] + dx * t), z - (a[2] + dz * t)))
  }, Infinity)
}

function buildBlocks(sites: readonly Vec3[]): Block[] {
  const rng = createRng(17)
  const blocks: Block[] = []
  for (let gx = 0; gx < GRID_X; gx++) {
    for (let gz = 0; gz < GRID_Z; gz++) {
      const x = CITY_CENTER[0] + (gx - GRID_X / 2) * CELL
      const z = CITY_CENTER[2] + (gz - GRID_Z / 2) * CELL
      if (sites.length > 1 && distanceToPath(x, z, sites) < CLEARANCE) continue
      if (rng() < 0.25) continue
      const wave = Math.abs(Math.sin(x * 0.3) * Math.cos(z * 0.22))
      const height = 0.3 + wave * 2.4 + rng() * 1.1
      blocks.push({ position: [x, CITY_CENTER[1], z], height, color: new Color(rng() < 0.5 ? CYAN : VIOLET) })
    }
  }
  return blocks
}

/** A field of bar-chart buildings that grow when the camera arrives. */
function Skyline({ sites, isActive }: { sites: readonly Vec3[]; isActive: boolean }) {
  const blocks = useMemo(() => buildBlocks(sites), [sites])
  const bodies = useRef<InstancedMesh>(null)
  const caps = useRef<InstancedMesh>(null)
  const growth = useRef(0)
  const dummy = useMemo(() => new Object3D(), [])

  useFrame((_, delta) => {
    if (!bodies.current || !caps.current) return
    const target = isActive ? 1 : 0
    if (Math.abs(growth.current - target) < 0.001) return
    growth.current = MathUtils.damp(growth.current, target, RISE_SPEED, Math.min(delta, 0.1))
    blocks.forEach((block, i) => {
      const h = Math.max(block.height * growth.current, 0.001)
      dummy.position.set(block.position[0], block.position[1] + h / 2, block.position[2])
      dummy.scale.set(CELL * 0.72, h, CELL * 0.72)
      dummy.updateMatrix()
      bodies.current!.setMatrixAt(i, dummy.matrix)
      dummy.position.y = block.position[1] + h + 0.02
      dummy.scale.set(CELL * 0.72, 0.04, CELL * 0.72)
      dummy.updateMatrix()
      caps.current!.setMatrixAt(i, dummy.matrix)
    })
    bodies.current.instanceMatrix.needsUpdate = true
    caps.current.instanceMatrix.needsUpdate = true
  })

  return (
    <>
      <instancedMesh ref={bodies} args={[undefined, undefined, blocks.length]}>
        <boxGeometry />
        <meshStandardMaterial color="#121a36" emissive="#0c1430" metalness={0.6} roughness={0.4} />
      </instancedMesh>
      <instancedMesh
        ref={(mesh) => {
          caps.current = mesh
          mesh?.instanceColor === null && blocks.forEach((b, i) => mesh.setColorAt(i, b.color.clone().multiplyScalar(1.4)))
        }}
        args={[undefined, undefined, blocks.length]}
      >
        <boxGeometry />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
    </>
  )
}

function MilestoneTower({ milestone, site, height, isCurrent }: { milestone: Milestone; site: Vec3; height: number; isCurrent: boolean }) {
  const beam = useRef<Group>(null)
  const color = milestone.kind === 'work' ? CYAN : VIOLET

  useFrame((state, delta) => {
    if (!beam.current) return
    const target = isCurrent ? 1 : 0.35
    const s = MathUtils.damp(beam.current.scale.x, target, 4, Math.min(delta, 0.1))
    beam.current.scale.set(s, 1, s)
    beam.current.rotation.y = state.clock.elapsedTime * 0.5
  })

  return (
    <group position={site}>
      <mesh position={[0, height / 2, 0]}>
        <boxGeometry args={[1.6, height, 1.6]} />
        <meshStandardMaterial color="#070b18" metalness={0.8} roughness={0.25} emissive={color} emissiveIntensity={isCurrent ? 0.25 : 0.06} />
        <Edges color={new Color(color).multiplyScalar(GLOW)} threshold={15} />
      </mesh>
      <group ref={beam} position={[0, height + 6, 0]}>
        <mesh>
          <cylinderGeometry args={[0.35, 0.8, 12, 24, 1, true]} />
          <meshBasicMaterial color={color} transparent opacity={0.12} blending={AdditiveBlending} depthWrite={false} toneMapped={false} />
        </mesh>
      </group>
      <Billboard position={[0, height + 1.3, 0]}>
        <Text font={MONO_FONT} fontSize={0.32} color={color} anchorY="bottom" position={[0, 0.55, 0]}>
          {milestone.period}
        </Text>
        <Text font={DISPLAY_FONT} fontSize={0.48} color="white" anchorY="top" maxWidth={7} textAlign="center" position={[0, 0.45, 0]}>
          {milestone.org}
        </Text>
      </Billboard>
    </group>
  )
}

/** Journey zone: the career as a city skyline, one glowing tower per milestone joined by a timeline. */
export function DataCity({ stops, journey }: { stops: number[]; journey: Milestone[] }) {
  const isActive = useZoneActive(stops)
  const activeStop = useWorld((s) => s.activeStop)
  const sites = useMemo(() => milestoneSites(journey.length), [journey.length])
  const path = useMemo(() => sites.map(([x, y, z]) => [x, y + 0.05, z] as [number, number, number]), [sites])
  const line = useRef<{ material: { dashOffset: number } } | null>(null)

  useFrame((_, delta) => {
    if (line.current) line.current.material.dashOffset -= delta * 0.8
  })

  return (
    <group visible={isActive}>
      <Grid
        position={[CITY_CENTER[0], CITY_CENTER[1] + 0.01, CITY_CENTER[2]]}
        args={[60, 60]}
        cellSize={CELL}
        cellThickness={0.6}
        cellColor="#1b2440"
        sectionSize={CELL * 4}
        sectionThickness={1}
        sectionColor="#2b3a66"
        fadeDistance={45}
        fadeStrength={1.5}
      />
      <Skyline sites={sites} isActive={isActive} />
      {sites.length > 1 && (
        <Line
          ref={line as never}
          points={path}
          color={new Color(CYAN).multiplyScalar(GLOW)}
          lineWidth={3}
          dashed
          dashSize={0.6}
          gapSize={0.3}
          toneMapped={false}
        />
      )}
      {journey.map((milestone, i) => (
        <MilestoneTower
          key={`${milestone.org}-${milestone.period}`}
          milestone={milestone}
          site={sites[i]!}
          height={milestoneHeight(i, journey.length)}
          isCurrent={activeStop === stops[i]}
        />
      ))}
      <pointLight position={[CITY_CENTER[0], CITY_CENTER[1] + 10, CITY_CENTER[2] + 6]} intensity={80} color={VIOLET} distance={40} />
    </group>
  )
}
