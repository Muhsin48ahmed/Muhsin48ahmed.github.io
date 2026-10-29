import { useFrame } from '@react-three/fiber'
import { useMemo, useRef, useState } from 'react'
import { AdditiveBlending, Color, MathUtils, ShaderMaterial, type Group } from 'three'
import { Astronaut } from '../Astronaut'
import { isFromUi } from '../helpers'
import { PORTAL } from '../layout'
import { useWorld } from '../store'
import { CYAN, PINK, VIOLET } from '../theme'
import { useZoneActive } from '../useZoneActive'

const RADIUS = 2.6

const swirl = {
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
  `,
  fragmentShader: /* glsl */ `
    uniform float uTime;
    uniform float uHover;
    uniform vec3 uA;
    uniform vec3 uB;
    uniform vec3 uC;
    varying vec2 vUv;
    void main() {
      vec2 p = vUv * 2.0 - 1.0;
      float r = length(p);
      if (r > 1.0) discard;
      float a = atan(p.y, p.x);
      float speed = 1.5 + uHover * 4.0;
      float arms = sin(a * 5.0 + r * 14.0 - uTime * speed) * 0.5 + 0.5;
      float rings = sin(r * 28.0 - uTime * speed * 1.5) * 0.5 + 0.5;
      vec3 color = mix(mix(uA, uB, r), uC, arms * 0.55);
      float glow = (1.0 - r) * 0.7 + arms * 0.45 * smoothstep(1.0, 0.15, r) + rings * 0.08;
      float alpha = smoothstep(1.0, 0.82, r) * glow;
      gl_FragColor = vec4(color * (1.3 + uHover * 1.2), alpha);
    }
  `,
}

/** Contact zone: a swirling portal (click to email) watched over by the astronaut. */
export function Portal({ stop, email, isReducedMotion }: { stop: number; email: string; isReducedMotion: boolean }) {
  const isActive = useZoneActive([stop])
  const setCursor = useWorld((s) => s.setCursor)
  const [isHovered, setIsHovered] = useState(false)
  const rings = useRef<Group>(null)
  const material = useMemo(
    () =>
      new ShaderMaterial({
        ...swirl,
        uniforms: {
          uTime: { value: 0 },
          uHover: { value: 0 },
          uA: { value: new Color(CYAN) },
          uB: { value: new Color(VIOLET) },
          uC: { value: new Color(PINK) },
        },
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
      }),
    [],
  )

  useFrame((state, delta) => {
    if (!isActive) return
    const t = isReducedMotion ? 0 : state.clock.elapsedTime
    material.uniforms.uTime!.value = t
    material.uniforms.uHover!.value = MathUtils.damp(material.uniforms.uHover!.value as number, isHovered ? 1 : 0, 5, Math.min(delta, 0.1))
    rings.current?.children.forEach((ring, i) => {
      ring.rotation.z = t * (0.3 + i * 0.2) * (i % 2 ? -1 : 1)
    })
  })

  return (
    <group visible={isActive}>
      <group position={PORTAL}>
        <mesh
          material={material}
          onPointerOver={(e) => {
            if (isFromUi(e.nativeEvent)) return
            setIsHovered(true)
            setCursor('hover')
          }}
          onPointerOut={() => {
            setIsHovered(false)
            setCursor('default')
          }}
          onClick={(e) => {
            if (!isFromUi(e.nativeEvent)) window.location.href = `mailto:${email}`
          }}
        >
          <circleGeometry args={[RADIUS, 96]} />
        </mesh>
        <group ref={rings}>
          {[
            { r: RADIUS, tube: 0.07, color: CYAN, tilt: 0 },
            { r: RADIUS + 0.35, tube: 0.02, color: VIOLET, tilt: 0.25 },
            { r: RADIUS + 0.6, tube: 0.012, color: PINK, tilt: -0.3 },
          ].map(({ r, tube, color, tilt }) => (
            <mesh key={r} rotation={[tilt, tilt * 0.5, 0]}>
              <torusGeometry args={[r, tube, 12, 160, Math.PI * 1.85]} />
              <meshBasicMaterial color={new Color(color).multiplyScalar(2.2)} toneMapped={false} />
            </mesh>
          ))}
        </group>
        <pointLight intensity={30} distance={14} color={VIOLET} position={[0, 0, 2]} />
      </group>
      <Astronaut
        position={[PORTAL[0] - 1.9, PORTAL[1] - 1.7, PORTAL[2] + 3.4]}
        rotationY={0.25}
        action={isHovered ? 'Wave' : 'Idle_Neutral'}
        isReducedMotion={isReducedMotion}
      />
    </group>
  )
}
