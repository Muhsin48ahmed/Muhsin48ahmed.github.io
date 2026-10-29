import {
  NETWORK_LAYERS,
  clusterShape,
  lossSurfaceHeight,
  networkEdges,
  networkNodes,
  networkShape,
  sphereShape,
  surfaceShape,
  timeSeriesShape,
} from './shapes'

const COUNT = 2000
const SEED = 1

const isFiniteArray = (arr: Float32Array) => arr.every((v) => Number.isFinite(v))

const maxAbs = (arr: Float32Array) => arr.reduce((m, v) => Math.max(m, Math.abs(v)), 0)

describe('networkNodes', () => {
  test('creates one node per neuron', () => {
    const nodes = networkNodes(NETWORK_LAYERS)
    const total = NETWORK_LAYERS.reduce((s, n) => s + n, 0)
    expect(nodes).toHaveLength(total)
  })

  test('places each layer at its own x position, left to right', () => {
    const nodes = networkNodes([2, 3])
    expect(nodes[0]![0]).toBe(nodes[1]![0])
    expect(nodes[2]![0]).toBeGreaterThan(nodes[0]![0])
  })
})

describe('networkEdges', () => {
  test('fully connects each pair of adjacent layers', () => {
    const edges = networkEdges([2, 3, 1])
    expect(edges).toHaveLength(2 * 3 + 3 * 1)
  })

  test('only connects consecutive layers', () => {
    const edges = networkEdges([2, 3, 1])
    // layer 0 = nodes 0-1, layer 1 = nodes 2-4, layer 2 = node 5
    expect(edges).toContainEqual([0, 2])
    expect(edges).toContainEqual([4, 5])
    expect(edges).not.toContainEqual([0, 5])
  })
})

describe('networkShape', () => {
  test('returns positions and a layer value per point', () => {
    const { positions, layers } = networkShape(COUNT, SEED)
    expect(positions).toHaveLength(COUNT * 3)
    expect(layers).toHaveLength(COUNT)
    expect(isFiniteArray(positions)).toBe(true)
  })

  test('layer values stay within the network depth', () => {
    const { layers } = networkShape(COUNT, SEED)
    const maxLayer = NETWORK_LAYERS.length - 1
    expect(layers.every((l) => l >= 0 && l <= maxLayer)).toBe(true)
  })

  test('is deterministic for a given seed', () => {
    expect(networkShape(100, 5).positions).toEqual(networkShape(100, 5).positions)
  })
})

describe.each([
  ['clusterShape', clusterShape],
  ['timeSeriesShape', timeSeriesShape],
  ['surfaceShape', surfaceShape],
  ['sphereShape', sphereShape],
])('%s', (_name, shape) => {
  test('returns 3 finite coordinates per point', () => {
    const positions = shape(COUNT, SEED)
    expect(positions).toHaveLength(COUNT * 3)
    expect(isFiniteArray(positions)).toBe(true)
  })

  test('stays within the visible scene bounds', () => {
    expect(maxAbs(shape(COUNT, SEED))).toBeLessThan(7)
  })

  test('is deterministic for a given seed', () => {
    expect(shape(100, 9)).toEqual(shape(100, 9))
  })
})

describe('surfaceShape', () => {
  test('places points on the loss surface', () => {
    const positions = surfaceShape(200, SEED)
    for (let i = 0; i < 200; i++) {
      const x = positions[i * 3]!
      const y = positions[i * 3 + 1]!
      const z = positions[i * 3 + 2]!
      expect(y).toBeCloseTo(lossSurfaceHeight(x, z), 4)
    }
  })
})

describe('sphereShape', () => {
  test('keeps every point inside the sphere radius', () => {
    const positions = sphereShape(COUNT, SEED)
    for (let i = 0; i < COUNT; i++) {
      const r = Math.hypot(positions[i * 3]!, positions[i * 3 + 1]!, positions[i * 3 + 2]!)
      expect(r).toBeLessThanOrEqual(2.6 + 1e-6)
    }
  })
})
