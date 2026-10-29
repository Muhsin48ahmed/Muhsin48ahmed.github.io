import { useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef, type RefObject } from 'react'
import { AdditiveBlending, BufferAttribute, BufferGeometry, LineBasicMaterial, MathUtils, type Group } from 'three'
import { shapeWeights } from './morph'
import { SHAPE_ATTRIBUTES, SHAPE_COUNT, createParticleMaterial } from './particleMaterial'
import { createRng } from './random'
import {
  NETWORK_LAYERS,
  clusterShape,
  networkEdges,
  networkNodes,
  networkShape,
  sphereShape,
  surfaceShape,
  timeSeriesShape,
} from './shapes'

const SEED = 7
const DESKTOP_POINTS = 7000
const MOBILE_POINTS = 3000
const MOBILE_BREAKPOINT_PX = 768

/** Order matches SECTIONS: about → clusters, experience → time series, projects → loss surface, contact → sphere. */
const MORPH_TARGETS = [clusterShape, timeSeriesShape, surfaceShape, sphereShape]
/** Extra x-rotation per shape, e.g. tip the loss surface toward the camera. */
const TILT_BY_SHAPE = [0, 0, 0, 0.55, 0.2]

const EDGE_OPACITY = 0.14
const PROGRESS_SMOOTHING = 4
const ROTATION_DAMPING = 3
const POINTER_INFLUENCE = 0.35
const SWAY_AMPLITUDE = 0.35
const SWAY_SPEED = 0.15
const WIDE_VIEWPORT_UNITS = 10
const SCENE_OFFSET_RATIO = 0.2
/** On narrow screens the text fills the width, so drop the scene into the space below it. */
const NARROW_OFFSET_Y_RATIO = -0.33
const REFERENCE_WIDTH_UNITS = 11
const MIN_SCALE = 0.55

function buildParticleGeometry(count: number): BufferGeometry {
  const { positions, layers } = networkShape(count, SEED)
  const rng = createRng(SEED - 1)
  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new BufferAttribute(positions, 3))
  MORPH_TARGETS.forEach((shape, i) =>
    geometry.setAttribute(SHAPE_ATTRIBUTES[i]!, new BufferAttribute(shape(count, SEED + i + 1), 3)),
  )
  geometry.setAttribute('aLayer', new BufferAttribute(layers, 1))
  geometry.setAttribute('aRandom', new BufferAttribute(Float32Array.from({ length: count }, rng), 1))
  return geometry
}

function buildEdgeGeometry(): BufferGeometry {
  const nodes = networkNodes(NETWORK_LAYERS)
  const positions = networkEdges(NETWORK_LAYERS).flatMap(([a, b]) => [...nodes[a]!, ...nodes[b]!])
  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3))
  return geometry
}

interface NeuralFieldProps {
  progress: RefObject<number>
  isReducedMotion: boolean
}

export function NeuralField({ progress, isReducedMotion }: NeuralFieldProps) {
  const group = useRef<Group>(null)
  const smoothedProgress = useRef(progress.current)
  const viewportWidth = useThree((state) => state.viewport.width)
  const viewportHeight = useThree((state) => state.viewport.height)

  const count = useMemo(() => (window.innerWidth < MOBILE_BREAKPOINT_PX ? MOBILE_POINTS : DESKTOP_POINTS), [])
  const particles = useMemo(() => buildParticleGeometry(count), [count])
  const material = useMemo(createParticleMaterial, [])
  const edges = useMemo(buildEdgeGeometry, [])
  const edgeMaterial = useMemo(
    () =>
      new LineBasicMaterial({
        color: '#22d3ee',
        transparent: true,
        opacity: EDGE_OPACITY,
        blending: AdditiveBlending,
        depthWrite: false,
      }),
    [],
  )

  const isWide = viewportWidth > WIDE_VIEWPORT_UNITS
  const offsetX = isWide ? viewportWidth * SCENE_OFFSET_RATIO : 0
  const offsetY = isWide ? 0 : viewportHeight * NARROW_OFFSET_Y_RATIO
  const scale = MathUtils.clamp(viewportWidth / REFERENCE_WIDTH_UNITS, MIN_SCALE, 1)

  useFrame((state, delta) => {
    if (!group.current) return
    const time = isReducedMotion ? 0 : state.clock.elapsedTime

    smoothedProgress.current = MathUtils.damp(smoothedProgress.current, progress.current, PROGRESS_SMOOTHING, delta)
    const weights = shapeWeights(smoothedProgress.current, SHAPE_COUNT)

    material.uniforms.uWeights!.value = weights
    material.uniforms.uTime!.value = time
    material.uniforms.uPixelRatio!.value = state.gl.getPixelRatio()
    edgeMaterial.opacity = EDGE_OPACITY * weights[0]!

    const tilt = weights.reduce((sum, w, i) => sum + w * TILT_BY_SHAPE[i]!, 0)
    const sway = Math.sin(time * SWAY_SPEED) * SWAY_AMPLITUDE
    const { rotation } = group.current
    rotation.y = MathUtils.damp(rotation.y, sway + state.pointer.x * POINTER_INFLUENCE, ROTATION_DAMPING, delta)
    rotation.x = MathUtils.damp(rotation.x, tilt - state.pointer.y * POINTER_INFLUENCE * 0.5, ROTATION_DAMPING, delta)
  })

  return (
    <group ref={group} position={[offsetX, offsetY, 0]} scale={scale}>
      <points geometry={particles} material={material} frustumCulled={false} />
      <lineSegments geometry={edges} material={edgeMaterial} />
    </group>
  )
}
