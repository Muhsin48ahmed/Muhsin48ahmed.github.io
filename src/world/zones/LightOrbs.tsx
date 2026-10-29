import { Float, Text } from '@react-three/drei'
import { useMemo } from 'react'
import { Color } from 'three'
import type { SkillGroup } from '../../content/types'
import { isFromUi, orbLayout } from '../helpers'
import { ORB_ARENA } from '../layout'
import { useWorld } from '../store'
import { ACCENTS, DISPLAY_FONT } from '../theme'
import { useZoneActive } from '../useZoneActive'

/** Physics-free stand-in for SkillOrbs on low-power devices: the same orbs, gently floating. */
export function LightOrbs({ stop, skillGroups }: { stop: number; skillGroups: SkillGroup[] }) {
  const isActive = useZoneActive([stop])
  const setCursor = useWorld((s) => s.setCursor)
  const orbs = useMemo(() => orbLayout(skillGroups, 21), [skillGroups])

  return (
    <group position={ORB_ARENA} visible={isActive}>
      {orbs.map((spec) => {
        const color = ACCENTS[spec.group % ACCENTS.length]!
        return (
          <Float key={spec.label} speed={1.2 + spec.radius} rotationIntensity={0.2} floatIntensity={0.8}>
            <group position={spec.offset}>
              <mesh
                onPointerOver={(e) => !isFromUi(e.nativeEvent) && setCursor('hover', spec.label)}
                onPointerOut={() => setCursor('default')}
              >
                <sphereGeometry args={[spec.radius, 32, 32]} />
                <meshStandardMaterial color={color} emissive={new Color(color)} emissiveIntensity={0.2} roughness={0.3} />
              </mesh>
              <Text
                font={DISPLAY_FONT}
                fontSize={Math.min(0.2, (spec.radius * 1.5) / Math.max(spec.label.length, 4))}
                position={[0, 0, spec.radius + 0.01]}
                color="#04050a"
                anchorX="center"
                anchorY="middle"
              >
                {spec.label}
              </Text>
            </group>
          </Float>
        )
      })}
      <pointLight position={[-3, 4, 5]} intensity={40} color="#ffffff" />
    </group>
  )
}
