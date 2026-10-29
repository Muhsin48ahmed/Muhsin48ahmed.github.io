import { Environment, Lightformer } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { Suspense, lazy, useEffect, useMemo, type RefObject } from 'react'
import { StaticBackdrop } from '../components/StaticBackdrop'
import type { Portfolio } from '../content/types'
import { Astronaut } from './Astronaut'
import { CameraRig } from './CameraRig'
import { DataDust } from './DataDust'
import { Effects } from './Effects'
import { zoneStops } from './helpers'
import { HERO_CORE, cameraKeyframes, projectFocusPose, screenPlacements } from './layout'
import { useWorld } from './store'
import { INK } from './theme'
import { DataCity } from './zones/DataCity'
import { HoloScreens } from './zones/HoloScreens'
import { NeuralCore } from './zones/NeuralCore'
import { Portal } from './zones/Portal'

// Physics (Rapier WASM) is the heaviest dependency and only the About zone needs it.
const SkillOrbs = lazy(() => import('./zones/SkillOrbs').then((m) => ({ default: m.SkillOrbs })))

const MOBILE_QUERY = '(max-width: 767px)'
const FOG_NEAR = 14
const FOG_FAR = 44

interface WorldProps {
  progress: RefObject<number>
  portfolio: Portfolio
  isReducedMotion: boolean
}

/** Fires once everything inside the Suspense boundary (models, fonts, physics) is ready. */
function SignalLoaded() {
  const markLoaded = useWorld((s) => s.markLoaded)
  useEffect(markLoaded, [markLoaded])
  return null
}

export default function World({ progress, portfolio, isReducedMotion }: WorldProps) {
  const isMobile = useMemo(() => window.matchMedia?.(MOBILE_QUERY).matches ?? false, [])
  const { journey, projects, skillGroups, profile } = portfolio
  const stops = useMemo(() => zoneStops(journey.length), [journey.length])
  const keyframes = useMemo(() => cameraKeyframes(journey.length), [journey.length])
  const placements = useMemo(() => screenPlacements(projects.length), [projects.length])
  const focusPoses = useMemo(() => placements.map(projectFocusPose), [placements])

  return (
    <div aria-hidden="true" className="fixed inset-0 -z-10">
      <Canvas
        camera={{ fov: 45, near: 0.1, far: 120, position: keyframes[0]!.eye as [number, number, number] }}
        dpr={isMobile ? [1, 1.5] : [1, 2]}
        gl={{ antialias: false, powerPreference: 'high-performance' }}
        // Text sits above the canvas, so listen on the body to keep pointer interaction working.
        eventSource={document.body}
        eventPrefix="client"
        fallback={<StaticBackdrop />}
      >
        <color attach="background" args={[INK]} />
        <fog attach="fog" args={[INK, FOG_NEAR, FOG_FAR]} />
        <ambientLight intensity={0.3} />
        <directionalLight position={[6, 10, 8]} intensity={1.4} />
        <Environment resolution={128} frames={1}>
          <Lightformer form="rect" intensity={3} position={[0, 5, 5]} scale={[10, 3, 1]} color="#8b5cf6" />
          <Lightformer form="rect" intensity={2} position={[-6, 0, 3]} scale={[3, 8, 1]} color="#22d3ee" />
          <Lightformer form="ring" intensity={2} position={[5, -2, 4]} scale={4} color="#e879f9" />
        </Environment>

        <CameraRig progress={progress} keyframes={keyframes} focusPoses={focusPoses} isReducedMotion={isReducedMotion} />
        <DataDust count={isMobile ? 1200 : 2600} isReducedMotion={isReducedMotion} />

        {/* One boundary per zone, so a slow asset never holds back the rest of the world. */}
        <Suspense fallback={null}>
          <NeuralCore stop={stops.hero} isReducedMotion={isReducedMotion} />
          <SignalLoaded />
        </Suspense>
        <Suspense fallback={null}>
          <Astronaut
            position={[HERO_CORE[0] - 0.4, HERO_CORE[1] - 2.1, HERO_CORE[2] + 4.6]}
            rotationY={0.35}
            height={1.6}
            action="Wave"
            isReducedMotion={isReducedMotion}
          />
        </Suspense>
        <Suspense fallback={null}>
          <SkillOrbs stop={stops.about} skillGroups={skillGroups} />
        </Suspense>
        <Suspense fallback={null}>
          <DataCity stops={stops.journey} journey={journey} />
        </Suspense>
        <Suspense fallback={null}>
          <HoloScreens stop={stops.projects} projects={projects} placements={placements} />
        </Suspense>
        <Suspense fallback={null}>
          <Portal stop={stops.contact} email={profile.email} isReducedMotion={isReducedMotion} />
        </Suspense>

        <Effects isMobile={isMobile} />
      </Canvas>
    </div>
  )
}
