import { Canvas } from '@react-three/fiber'
import type { RefObject } from 'react'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import { NeuralField } from './NeuralField'

const CAMERA_DISTANCE = 10
const CAMERA_FOV = 50

/** Shown instead of the canvas when WebGL is unavailable. */
function StaticBackdrop() {
  return (
    <div className="h-full w-full bg-[radial-gradient(ellipse_at_70%_40%,rgb(34_211_238/0.18),transparent_55%),radial-gradient(ellipse_at_80%_70%,rgb(167_139_250/0.15),transparent_50%)]" />
  )
}

export default function Scene({ progress }: { progress: RefObject<number> }) {
  const isReducedMotion = usePrefersReducedMotion()

  return (
    <div aria-hidden="true" className="fixed inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, CAMERA_DISTANCE], fov: CAMERA_FOV }}
        dpr={[1, 2]}
        gl={{ antialias: false, powerPreference: 'high-performance' }}
        // Text sits above the canvas, so listen on the body to keep pointer parallax working.
        eventSource={document.body}
        eventPrefix="client"
        fallback={<StaticBackdrop />}
      >
        <NeuralField progress={progress} isReducedMotion={isReducedMotion} />
      </Canvas>
    </div>
  )
}
