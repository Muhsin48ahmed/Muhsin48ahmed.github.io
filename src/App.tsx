import { Suspense, lazy, useEffect, useMemo } from 'react'
import { useSoundEvents } from './audio/useSoundEvents'
import { About } from './components/About'
import { Contact } from './components/Contact'
import { Cursor } from './components/Cursor'
import { ErrorBoundary } from './components/ErrorBoundary'
import { Hero } from './components/Hero'
import { Journey } from './components/Journey'
import { Loader } from './components/Loader'
import { Nav } from './components/Nav'
import { ProjectModal } from './components/ProjectModal'
import { Projects } from './components/Projects'
import { StaticBackdrop } from './components/StaticBackdrop'
import { ZoneRail } from './components/ZoneRail'
import { portfolio } from './content/portfolio'
import { cameraStopIds } from './content/sections'
import { getViewMode } from './content/viewMode'
import { useActiveStopSync } from './hooks/useActiveStopSync'
import { useLenis } from './hooks/useLenis'
import { useMagnetic } from './hooks/useMagnetic'
import { usePrefersReducedMotion } from './hooks/usePrefersReducedMotion'
import { useReveal } from './hooks/useReveal'
import { useStopProgress } from './hooks/useStopProgress'
import { useWorld } from './world/store'

// three.js is the bulk of the bundle; load it after the text so content paints first.
const World = lazy(() => import('./world/World'))

export default function App() {
  const { profile, stats, skillGroups, journey, projects, awards } = portfolio
  const stopIds = useMemo(() => cameraStopIds(journey.length), [journey.length])
  const isClassic = getViewMode() === 'classic'
  const progress = useStopProgress(stopIds)
  const isReducedMotion = usePrefersReducedMotion()
  useLenis(!isReducedMotion)
  useReveal()
  useMagnetic()
  useSoundEvents()
  useActiveStopSync(progress, stopIds.length, isClassic)

  useEffect(() => {
    document.documentElement.dataset.view = isClassic ? 'classic' : 'immersive'
    // Nothing to wait for without the 3D world: start the intro animation straight away.
    if (isClassic) useWorld.getState().markLoaded()
  }, [isClassic])

  return (
    <>
      {isClassic ? (
        <StaticBackdrop />
      ) : (
        <>
          <ErrorBoundary fallback={<StaticBackdrop />}>
            <Suspense fallback={null}>
              <World progress={progress} portfolio={portfolio} isReducedMotion={isReducedMotion} />
            </Suspense>
          </ErrorBoundary>
          {/* Darkens the world behind the text column so copy stays readable. */}
          <div
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 -z-[5] bg-gradient-to-b from-ink/70 via-ink/30 to-transparent lg:bg-gradient-to-r lg:from-ink/80 lg:via-ink/20 lg:to-transparent"
          />
          <Loader />
        </>
      )}
      <Cursor />
      <Nav name={profile.name} journeyCount={journey.length} />
      <ZoneRail journeyCount={journey.length} />
      <main>
        <Hero profile={profile} stats={stats} />
        <About profile={profile} skillGroups={skillGroups} awards={awards} />
        <Journey items={journey} />
        <Projects items={projects} />
        <Contact profile={profile} />
      </main>
      {!isClassic && <ProjectModal projects={projects} />}
    </>
  )
}
