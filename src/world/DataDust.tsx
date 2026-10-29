import { useFrame } from '@react-three/fiber'
import { useMemo } from 'react'
import { AdditiveBlending, BufferAttribute, BufferGeometry, Color, ShaderMaterial } from 'three'
import { createRng } from './random'
import { CYAN, VIOLET } from './theme'

const SPREAD_X = 26
const SPREAD_Y = 12
const NEAR_Z = 16
const FAR_Z = -190

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;
  attribute float aRandom;
  varying float vRandom;
  void main() {
    vec3 p = position;
    p.y += sin(uTime * 0.25 + aRandom * 30.0) * 0.4;
    p.x += cos(uTime * 0.2 + aRandom * 20.0) * 0.4;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = (14.0 + aRandom * 22.0) * uPixelRatio / -mv.z;
    vRandom = aRandom;
  }
`

const fragmentShader = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  varying float vRandom;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    gl_FragColor = vec4(mix(uColorA, uColorB, vRandom), smoothstep(0.5, 0.0, d) * 0.55);
  }
`

/** Drifting specks along the whole flight path — they give the camera a sense of speed. */
export function DataDust({ count, isReducedMotion }: { count: number; isReducedMotion: boolean }) {
  const geometry = useMemo(() => {
    const rng = createRng(11)
    const positions = Float32Array.from({ length: count * 3 }, (_, i) => {
      const axis = i % 3
      if (axis === 0) return (rng() * 2 - 1) * SPREAD_X
      if (axis === 1) return (rng() * 2 - 1) * SPREAD_Y
      return NEAR_Z + rng() * (FAR_Z - NEAR_Z)
    })
    const g = new BufferGeometry()
    g.setAttribute('position', new BufferAttribute(positions, 3))
    g.setAttribute('aRandom', new BufferAttribute(Float32Array.from({ length: count }, rng), 1))
    return g
  }, [count])

  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
          uTime: { value: 0 },
          uPixelRatio: { value: 1 },
          uColorA: { value: new Color(CYAN) },
          uColorB: { value: new Color(VIOLET) },
        },
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
      }),
    [],
  )

  useFrame((state) => {
    material.uniforms.uTime!.value = isReducedMotion ? 0 : state.clock.elapsedTime
    material.uniforms.uPixelRatio!.value = state.gl.getPixelRatio()
  })

  return <points geometry={geometry} material={material} frustumCulled={false} />
}
