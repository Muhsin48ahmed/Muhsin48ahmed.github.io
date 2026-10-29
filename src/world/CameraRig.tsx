import { useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef, type RefObject } from 'react'
import { MathUtils, Vector3 } from 'three'
import { framingShift, poseAt, type Pose } from './cameraPath'
import { useWorld } from './store'

const SCROLL_DAMPING = 3.2
const FOCUS_DAMPING = 2.6
const PARALLAX_X = 0.6
const PARALLAX_Y = 0.35
const WORLD_UP = new Vector3(0, 1, 0)

interface CameraRigProps {
  progress: RefObject<number>
  keyframes: Pose[]
  /** Close-up pose per project screen, used while that project is open. */
  focusPoses: Pose[]
  isReducedMotion: boolean
}

const damp3 = (v: Vector3, [x, y, z]: readonly number[], lambda: number, dt: number) =>
  v.set(MathUtils.damp(v.x, x!, lambda, dt), MathUtils.damp(v.y, y!, lambda, dt), MathUtils.damp(v.z, z!, lambda, dt))

/** Flies the camera along the keyframes as the page scrolls, with pointer parallax. */
export function CameraRig({ progress, keyframes, focusPoses, isReducedMotion }: CameraRigProps) {
  const camera = useThree((s) => s.camera)
  const eye = useRef(new Vector3(...keyframes[0]!.eye))
  const focus = useRef(new Vector3(...keyframes[0]!.focus))
  const framing = useRef(1)
  const scratch = useMemo(() => ({ forward: new Vector3(), right: new Vector3(), up: new Vector3(), look: new Vector3() }), [])
  const setActiveStop = useWorld((s) => s.setActiveStop)

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.1)
    const focused = useWorld.getState().focusedProject
    const focusPose = focused === null ? undefined : focusPoses[focused]
    const target = focusPose ? { framing: 1, ...focusPose } : poseAt(keyframes, progress.current)
    const lambda = focusPose ? FOCUS_DAMPING : SCROLL_DAMPING

    setActiveStop(Math.round(MathUtils.clamp(progress.current - 0.5, 0, keyframes.length - 1)))

    damp3(eye.current, target.eye, lambda, dt)
    damp3(focus.current, target.focus, lambda, dt)
    framing.current = MathUtils.damp(framing.current, target.framing ?? 1, lambda, dt)

    const shift = framingShift(state.size.width / state.size.height)
    const parallax = isReducedMotion ? 0 : 1
    const { forward, right, up, look } = scratch
    // Back off along the line of sight on narrow screens.
    look.subVectors(eye.current, focus.current).multiplyScalar(shift.zoom).add(focus.current)
    camera.position.set(
      look.x + state.pointer.x * PARALLAX_X * parallax,
      look.y + state.pointer.y * PARALLAX_Y * parallax,
      look.z,
    )

    // Aim beside the subject so it clears the text column (right on wide screens, lower on tall ones).
    const distance = eye.current.distanceTo(focus.current)
    forward.subVectors(focus.current, eye.current).normalize()
    right.crossVectors(forward, WORLD_UP).normalize()
    up.crossVectors(right, forward)
    look
      .copy(focus.current)
      .addScaledVector(right, shift.x * distance * framing.current)
      .addScaledVector(up, shift.y * distance * framing.current)
    camera.lookAt(look)
  })

  return null
}
