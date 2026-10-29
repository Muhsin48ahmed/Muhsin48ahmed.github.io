import { Suspense, lazy } from 'react'
import { About } from './components/About'
import { Contact } from './components/Contact'
import { ErrorBoundary } from './components/ErrorBoundary'
import { Experience } from './components/Experience'
import { Hero } from './components/Hero'
import { Nav } from './components/Nav'
import { Projects } from './components/Projects'
import { portfolio } from './content/portfolio'
import { SECTION_IDS } from './content/sections'
import { useSectionProgress } from './hooks/useSectionProgress'

// three.js is the bulk of the bundle; load it after the text so content paints first.
const Scene = lazy(() => import('./scene/Scene'))

export default function App() {
  const progress = useSectionProgress(SECTION_IDS)
  const { profile, stats, skillGroups, experience, projects } = portfolio

  return (
    <>
      <ErrorBoundary fallback={null}>
        <Suspense fallback={null}>
          <Scene progress={progress} />
        </Suspense>
      </ErrorBoundary>
      {/* Darkens the scene behind the text column so copy stays readable. */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-[5] bg-ink/30 lg:bg-transparent lg:bg-gradient-to-r lg:from-ink/85 lg:via-ink/30 lg:to-transparent"
      />
      <Nav name={profile.name} />
      <main>
        <Hero profile={profile} stats={stats} />
        <About profile={profile} skillGroups={skillGroups} />
        <Experience items={experience} />
        <Projects items={projects} />
        <Contact profile={profile} />
      </main>
    </>
  )
}
