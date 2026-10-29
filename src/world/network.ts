/** Layout of the neural network at the heart of the hero scene. */

export type Vec3 = readonly [number, number, number]

export const NETWORK_LAYERS = [4, 7, 9, 7, 3] as const

const LAYER_SPACING = 2

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

export function nodeLayers(layers: readonly number[]): number[] {
  return layers.flatMap((size, layer) => Array<number>(size).fill(layer))
}
