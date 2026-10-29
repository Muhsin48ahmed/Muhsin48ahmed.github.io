import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { AdditiveBlending, Color, MathUtils, Object3D, type Group, type InstancedMesh, type MeshBasicMaterial } from 'three'
import { createRng } from './random'
import { CYAN, VIOLET } from './theme'
import { motion } from './warp'

const COUNT = 220
const TUBE_RADIUS = 9
const TUBE_INNER = 1.6
const DEPTH = 40
const MAX_LENGTH = 7
const STREAK_SPEED = 1.1

/** Light streaks that rush past the camera while it flies between zones; invisible when it is still. */
export function WarpStreaks() {
  const group = useRef<Group>(null)
  const mesh = useRef<InstancedMesh>(null)
  const material = useRef<MeshBasicMaterial>(null)
  const dummy = useMemo(() => new Object3D(), [])
  const streaks = useMemo(() => {
    const rng = createRng(31)
    return Array.from({ length: COUNT }, () => {
      const angle = rng() * Math.PI * 2
      const radius = TUBE_INNER + Math.sqrt(rng()) * (TUBE_RADIUS - TUBE_INNER)
      return { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius, z: -rng() * DEPTH, seed: rng() }
    })
  }, [])
  const colors = useMemo(() => [new Color(CYAN).multiplyScalar(2), new Color(VIOLET).multiplyScalar(2), new Color('#ffffff').multiplyScalar(1.5)], [])

  useFrame((state, delta) => {
    if (!group.current || !mesh.current || !material.current) return
    const warp = motion.warp
    material.current.opacity = warp * 0.9
    group.current.visible = warp > 0.01
    if (!group.current.visible) return

    group.current.position.copy(state.camera.position)
    group.current.quaternion.copy(state.camera.quaternion)
    const dt = Math.min(delta, 0.1)
    streaks.forEach((s, i) => {
      // Streaks fly toward the camera (+z in camera space) and wrap around behind the far end.
      s.z += (motion.speed * STREAK_SPEED + 4) * dt
      if (s.z > 2) s.z -= DEPTH
      dummy.position.set(s.x, s.y, s.z)
      dummy.scale.set(0.03 + s.seed * 0.03, 0.03 + s.seed * 0.03, MathUtils.lerp(0.3, MAX_LENGTH, warp) * (0.5 + s.seed))
      dummy.updateMatrix()
      mesh.current!.setMatrixAt(i, dummy.matrix)
    })
    mesh.current.instanceMatrix.needsUpdate = true
  })

  return (
    <group ref={group} visible={false}>
      <instancedMesh
        ref={(m) => {
          mesh.current = m
          m?.instanceColor === null && streaks.forEach((s, i) => m.setColorAt(i, colors[Math.floor(s.seed * colors.length)]!))
        }}
        args={[undefined, undefined, COUNT]}
        frustumCulled={false}
      >
        <boxGeometry />
        <meshBasicMaterial ref={material} transparent opacity={0} blending={AdditiveBlending} depthWrite={false} toneMapped={false} />
      </instancedMesh>
    </group>
  )
}
