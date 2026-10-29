import { AdditiveBlending } from 'three'
import { SHAPE_COUNT, createParticleMaterial } from './particleMaterial'

describe('createParticleMaterial', () => {
  test('starts fully on the first shape', () => {
    const material = createParticleMaterial()
    expect(material.uniforms.uWeights!.value).toEqual([1, ...Array(SHAPE_COUNT - 1).fill(0)])
  })

  test('declares one weight uniform per shape in the vertex shader', () => {
    const material = createParticleMaterial()
    expect(material.vertexShader).toContain(`uniform float uWeights[${SHAPE_COUNT}]`)
  })

  test('renders as glowing, non-occluding points', () => {
    const material = createParticleMaterial()
    expect(material.blending).toBe(AdditiveBlending)
    expect(material.depthWrite).toBe(false)
    expect(material.transparent).toBe(true)
  })
})
