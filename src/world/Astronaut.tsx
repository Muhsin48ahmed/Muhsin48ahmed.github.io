import { useAnimations, useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { Box3, Vector3, type Group } from 'three'
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js'
import type { Vec3 } from './network'

const MODEL_URL = '/models/astronaut.glb'
const FADE = 0.4

export type AstronautAction = 'Wave' | 'Idle' | 'Idle_Neutral' | 'Interact'

interface AstronautProps {
  position: Vec3
  rotationY?: number
  height?: number
  action: AstronautAction
  isReducedMotion: boolean
}

/** CC0 astronaut by Quaternius (poly.pizza/m/3hC2i0CTuO), floating in zero-g. */
export function Astronaut({ position, rotationY = 0, height = 1.8, action, isReducedMotion }: AstronautProps) {
  const { scene, animations } = useGLTF(MODEL_URL)
  const model = useMemo(() => clone(scene), [scene])
  const root = useRef<Group>(null)
  const { actions } = useAnimations(animations, root)

  const scale = useMemo(() => {
    // The armature carries the real scale, so world matrices must be current before measuring.
    model.updateMatrixWorld(true)
    const size = new Box3().setFromObject(model, true).getSize(new Vector3())
    return size.y > 0 ? height / size.y : 1
  }, [model, height])

  useEffect(() => {
    const current = actions[`CharacterArmature|${action}`]
    current?.reset().fadeIn(FADE).play()
    return () => {
      current?.fadeOut(FADE)
    }
  }, [actions, action])

  useFrame((state) => {
    if (!root.current || isReducedMotion) return
    const t = state.clock.elapsedTime
    root.current.position.y = position[1] + Math.sin(t * 0.8) * 0.15
    root.current.rotation.z = Math.sin(t * 0.5) * 0.06
  })

  return (
    <group ref={root} position={position} rotation={[0, rotationY, 0]} scale={scale}>
      <primitive object={model} />
      {/* Rim light so the dark suit reads against the background. */}
      <pointLight position={[0.9, 1.7, 1.4]} intensity={5} distance={4} color="#a5f3fc" />
    </group>
  )
}

useGLTF.preload(MODEL_URL)
