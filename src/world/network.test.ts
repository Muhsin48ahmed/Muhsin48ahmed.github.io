import { NETWORK_LAYERS, networkEdges, networkNodes, nodeLayers } from './network'

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

describe('nodeLayers', () => {
  test('labels each node with its layer index', () => {
    expect(nodeLayers([2, 1])).toEqual([0, 0, 1])
  })
})
