import { createRng, gaussian } from './random'

/**
 * Point-cloud targets the particle field morphs between, one per page section.
 * Every generator returns `count * 3` coordinates so the shapes line up point-for-point.
 */

export type Vec3 = readonly [number, number, number]
type Rng = () => number

export const NETWORK_LAYERS = [4, 7, 9, 7, 3] as const

const LAYER_SPACING = 2
const NODE_FRACTION = 0.45
const NODE_SPREAD = 0.09
const EDGE_SPREAD = 0.02

export function networkNodes(layers: readonly number[]): Vec3[] {
  const offset = (layers.length - 1) / 2
  return layers.flatMap((size, layer) => {
    const x = (layer - offset) * LAYER_SPACING
    const radius = size === 1 ? 0 : 0.5 + 0.18 * size
    return Array.from({ length: size }, (_, j): Vec3 => {
      const angle = (2 * Math.PI * j) / size + layer * 0.3
      return [x, radius * Math.cos(angle), radius * Math.sin(angle)]
    })
  })
}

function layerStarts(layers: readonly number[]): number[] {
  return layers.map((_, i) => layers.slice(0, i).reduce((s, n) => s + n, 0))
}

/** Index pairs fully connecting each layer to the next. */
export function networkEdges(layers: readonly number[]): Array<[number, number]> {
  const starts = layerStarts(layers)
  return layers.slice(0, -1).flatMap((size, layer) => {
    const nextSize = layers[layer + 1]!
    return Array.from({ length: size * nextSize }, (_, k): [number, number] => [
      starts[layer]! + Math.floor(k / nextSize),
      starts[layer + 1]! + (k % nextSize),
    ])
  })
}

function nodeLayers(layers: readonly number[]): number[] {
  return layers.flatMap((size, layer) => Array<number>(size).fill(layer))
}

const pick = <T,>(rng: Rng, items: readonly T[]): T => items[Math.floor(rng() * items.length)]!

/**
 * Neurons as small glowing clouds plus particles flowing along the synapses.
 * `layers` holds each point's (fractional) depth in the network, used for the activation pulse.
 */
export function networkShape(count: number, seed: number) {
  const rng = createRng(seed)
  const nodes = networkNodes(NETWORK_LAYERS)
  const edges = networkEdges(NETWORK_LAYERS)
  const depth = nodeLayers(NETWORK_LAYERS)
  const positions = new Float32Array(count * 3)
  const layers = new Float32Array(count)

  for (let i = 0; i < count; i++) {
    let point: Vec3
    let spread: number
    if (rng() < NODE_FRACTION) {
      const node = Math.floor(rng() * nodes.length)
      point = nodes[node]!
      spread = NODE_SPREAD
      layers[i] = depth[node]!
    } else {
      const [from, to] = pick(rng, edges)
      const t = rng()
      const a = nodes[from]!
      const b = nodes[to]!
      point = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]
      spread = EDGE_SPREAD
      layers[i] = depth[from]! + t
    }
    positions.set(point.map((c) => c + gaussian(rng) * spread), i * 3)
  }
  return { positions, layers }
}

const CLUSTERS: ReadonlyArray<{ center: Vec3; spread: number }> = [
  { center: [-2.2, 1.1, 0], spread: 0.55 },
  { center: [2.1, 1.3, -0.8], spread: 0.45 },
  { center: [0, -1.5, 0.8], spread: 0.6 },
  { center: [0.6, 0.3, -2], spread: 0.35 },
]
const CLUSTER_NOISE_FRACTION = 0.06
const CLUSTER_NOISE_EXTENT = 3.5

/** Gaussian blobs — a clustering / embedding scatter plot. */
export function clusterShape(count: number, seed: number): Float32Array {
  const rng = createRng(seed)
  const positions = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    if (rng() < CLUSTER_NOISE_FRACTION) {
      positions.set([0, 0, 0].map(() => (rng() * 2 - 1) * CLUSTER_NOISE_EXTENT), i * 3)
      continue
    }
    const { center, spread } = pick(rng, CLUSTERS)
    positions.set(center.map((c) => c + gaussian(rng) * spread), i * 3)
  }
  return positions
}

const SERIES_COUNT = 3
const SERIES_EXTENT = 5

/** Stacked noisy signals — a multivariate time series. */
export function timeSeriesShape(count: number, seed: number): Float32Array {
  const rng = createRng(seed)
  const positions = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const series = i % SERIES_COUNT
    const lane = series - (SERIES_COUNT - 1) / 2
    const x = (rng() * 2 - 1) * SERIES_EXTENT
    const y =
      lane * 1.1 +
      0.7 * Math.sin(1.1 * x + series * 1.7) +
      0.3 * Math.sin(3.3 * x + series) +
      gaussian(rng) * 0.05
    const z = lane * 1.3 + gaussian(rng) * 0.05
    positions.set([x, y, z], i * 3)
  }
  return positions
}

/** A bumpy bowl with two basins — a model's loss landscape. */
export function lossSurfaceHeight(x: number, z: number): number {
  const bowl = 0.06 * (x * x + z * z)
  const globalMin = 1.4 * Math.exp(-((x - 1.2) ** 2 + (z + 0.8) ** 2) / 1.2)
  const localMin = 0.9 * Math.exp(-((x + 1.8) ** 2 + (z - 1.5) ** 2) / 0.8)
  const ripples = 0.25 * Math.sin(1.7 * x) * Math.cos(1.3 * z)
  return bowl - globalMin - localMin + ripples - 1
}

const SURFACE_EXTENT = 4
const SURFACE_GRID_LINES = 18

/** Points along grid lines of the loss surface, so it reads as a wireframe mesh. */
export function surfaceShape(count: number, seed: number): Float32Array {
  const rng = createRng(seed)
  const positions = new Float32Array(count * 3)
  const step = (2 * SURFACE_EXTENT) / (SURFACE_GRID_LINES - 1)
  for (let i = 0; i < count; i++) {
    const fixed = -SURFACE_EXTENT + Math.floor(rng() * SURFACE_GRID_LINES) * step
    const free = (rng() * 2 - 1) * SURFACE_EXTENT
    const [x, z] = i % 2 === 0 ? [fixed, free] : [free, fixed]
    positions.set([x, lossSurfaceHeight(x, z), z], i * 3)
  }
  return positions
}

const SPHERE_RADIUS = 2.5
const SPHERE_SHELL_FRACTION = 0.8
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5))

/** A Fibonacci-sphere shell with a sparse core — a globe for "get in touch". */
export function sphereShape(count: number, seed: number): Float32Array {
  const rng = createRng(seed)
  const positions = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const onShell = rng() < SPHERE_SHELL_FRACTION
    const radius = onShell
      ? SPHERE_RADIUS + (rng() - 0.5) * 0.1
      : SPHERE_RADIUS * Math.cbrt(rng()) * 0.9
    const y = 1 - (2 * (i + 0.5)) / count
    const ring = Math.sqrt(1 - y * y)
    const theta = GOLDEN_ANGLE * i
    positions.set([radius * ring * Math.cos(theta), radius * y, radius * ring * Math.sin(theta)], i * 3)
  }
  return positions
}
