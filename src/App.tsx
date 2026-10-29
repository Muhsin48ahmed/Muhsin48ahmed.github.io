import { Suspense, lazy, useMemo } from 'react'
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
import { portfolio } from './content/portfolio'
import { cameraStopIds } from './content/sections'
import { useLenis } from './hooks/useLenis'
import { usePrefersReducedMotion } from './hooks/usePrefersReducedMotion'
import { useReveal } from './hooks/useReveal'
import { useStopProgress } from './hooks/useStopProgress'

// three.js is the bulk of the bundle; load it after the text so content paints first.
const World = lazy(() => import('./world/World'))

export default function App() {
  const { profile, stats, skillGroups, journey, projects, awards } = portfolio
  const stopIds = useMemo(() => cameraStopIds(journey.length), [journey.length])
  const progress = useStopProgress(stopIds)
  const isReducedMotion = usePrefersReducedMotion()
  useLenis(!isReducedMotion)
  useReveal()

  return (
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
      <Cursor />
      <Nav name={profile.name} />
      <main>
        <Hero profile={profile} stats={stats} />
        <About profile={profile} skillGroups={skillGroups} awards={awards} />
        <Journey items={journey} />
        <Projects items={projects} />
        <Contact profile={profile} />
      </main>
      <ProjectModal projects={projects} />
    </>
  )
}
