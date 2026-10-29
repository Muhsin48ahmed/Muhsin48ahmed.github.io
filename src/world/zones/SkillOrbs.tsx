import { Text } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { BallCollider, Physics, RigidBody, type RapierCollider, type RapierRigidBody } from '@react-three/rapier'
import { useEffect, useMemo, useRef } from 'react'
import { Color, Plane, Vector3 } from 'three'
import type { SkillGroup } from '../../content/types'
import { isFromUi, orbLayout, type OrbSpec } from '../helpers'
import { ORB_ARENA } from '../layout'
import { useWorld } from '../store'
import { ACCENTS, DISPLAY_FONT } from '../theme'
import { useZoneActive } from '../useZoneActive'

const ATTRACTION = 0.9
const DRAG_STIFFNESS = 14
const CURSOR_RADIUS = 0.9
/** Max distance the cursor body moves per frame — a kinematic teleport would hit the orbs at absurd speed. */
const CURSOR_MAX_STEP = 0.6
const MAX_ORB_SPEED = 24

/**
 * StrictMode remounts the physics world in development; a ref can briefly hold a freed body,
 * and writing to it corrupts the new world's WASM memory. Only touch bodies that are still live.
 */
const isLive = (body: RapierRigidBody | null): body is RapierRigidBody => Boolean(body?.isValid())
const ARENA = new Vector3(...ORB_ARENA)
const ARENA_PLANE = new Plane(new Vector3(0, 0, 1), -ORB_ARENA[2])

interface OrbProps {
  spec: OrbSpec
  onGrab: (body: RapierRigidBody) => void
}

function Orb({ spec, onGrab }: OrbProps) {
  const body = useRef<RapierRigidBody>(null)
  const setCursor = useWorld((s) => s.setCursor)
  const color = ACCENTS[spec.group % ACCENTS.length]!
  const start = useMemo(() => ARENA.clone().add(new Vector3(...spec.offset)), [spec.offset])

  useFrame((_, delta) => {
    const rb = body.current
    if (!isLive(rb)) return
    const p = rb.translation()
    if (!Number.isFinite(p.x + p.y + p.z)) {
      rb.setTranslation(start, true)
      rb.setLinvel({ x: 0, y: 0, z: 0 }, true)
      return
    }
    const v = rb.linvel()
    const speed = Math.hypot(v.x, v.y, v.z)
    if (speed > MAX_ORB_SPEED) {
      const k = MAX_ORB_SPEED / speed
      rb.setLinvel({ x: v.x * k, y: v.y * k, z: v.z * k }, true)
    }
    const pull = ARENA.clone().sub(new Vector3(p.x, p.y, p.z)).multiplyScalar(ATTRACTION * rb.mass() * Math.min(delta, 0.05))
    rb.applyImpulse(pull, true)
  })

  return (
    // Explicit collider: auto-generated ones would also wrap the label text.
    <RigidBody ref={body} colliders={false} position={start.toArray()} linearDamping={1.4} angularDamping={1} lockRotations>
      <BallCollider args={[spec.radius]} restitution={0.6} />
      <mesh
        onPointerOver={(e) => !isFromUi(e.nativeEvent) && setCursor('hover')}
        onPointerOut={() => setCursor('default')}
        onPointerDown={(e) => {
          if (isFromUi(e.nativeEvent) || !isLive(body.current)) return
          e.stopPropagation()
          onGrab(body.current)
        }}
      >
        <sphereGeometry args={[spec.radius, 48, 48]} />
        <meshPhysicalMaterial
          color={color}
          emissive={new Color(color)}
          emissiveIntensity={0.18}
          roughness={0.15}
          metalness={0.1}
          clearcoat={1}
          clearcoatRoughness={0.1}
        />
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
    </RigidBody>
  )
}

/** Follows the pointer on the arena plane and pushes orbs out of the way. */
function CursorBody({ grabbed }: { grabbed: React.RefObject<RapierRigidBody | null> }) {
  const body = useRef<RapierRigidBody>(null)
  const collider = useRef<RapierCollider>(null)
  const point = useMemo(() => new Vector3(), [])
  const step = useMemo(() => new Vector3(), [])

  useFrame((state) => {
    if (!isLive(body.current)) return
    state.raycaster.setFromCamera(state.pointer, state.camera)
    if (!state.raycaster.ray.intersectPlane(ARENA_PLANE, point)) return

    const held = isLive(grabbed.current) ? grabbed.current : null
    // Don't knock the orb you're holding.
    collider.current?.setEnabled(!held)
    if (held) {
      const p = held.translation()
      held.setLinvel({ x: (point.x - p.x) * DRAG_STIFFNESS, y: (point.y - p.y) * DRAG_STIFFNESS, z: (ORB_ARENA[2] - p.z) * 4 }, true)
    }

    const current = body.current.translation()
    step.set(point.x - current.x, point.y - current.y, point.z - current.z).clampLength(0, CURSOR_MAX_STEP)
    body.current.setNextKinematicTranslation({ x: current.x + step.x, y: current.y + step.y, z: current.z + step.z })
  })

  return (
    <RigidBody ref={body} type="kinematicPosition" colliders={false} position={ORB_ARENA as unknown as [number, number, number]}>
      <BallCollider ref={collider} args={[CURSOR_RADIUS]} />
    </RigidBody>
  )
}

/** About zone: one glossy orb per skill. Hover to push them, drag to grab, release to throw. */
export function SkillOrbs({ stop, skillGroups }: { stop: number; skillGroups: SkillGroup[] }) {
  const isActive = useZoneActive([stop])
  const setCursor = useWorld((s) => s.setCursor)
  const orbs = useMemo(() => orbLayout(skillGroups, 21), [skillGroups])
  const grabbed = useRef<RapierRigidBody | null>(null)

  useEffect(() => {
    const release = () => {
      if (!grabbed.current) return
      grabbed.current = null
      document.documentElement.classList.remove('is-dragging')
      setCursor('default')
    }
    window.addEventListener('pointerup', release)
    return () => window.removeEventListener('pointerup', release)
  }, [setCursor])

  return (
    <group visible={isActive}>
      <Physics gravity={[0, 0, 0]} paused={!isActive}>
        {orbs.map((spec) => (
          <Orb
            key={spec.label}
            spec={spec}
            onGrab={(body) => {
              grabbed.current = body
              document.documentElement.classList.add('is-dragging')
              setCursor('grab')
            }}
          />
        ))}
        <CursorBody grabbed={grabbed} />
      </Physics>
      <pointLight position={[ORB_ARENA[0] - 3, ORB_ARENA[1] + 4, ORB_ARENA[2] + 5]} intensity={40} color="#ffffff" />
    </group>
  )
}
