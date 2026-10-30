import { defineConfig, devices } from '@playwright/test'

const PORT = 4174
const isCI = Boolean(process.env.CI)

/** WebGL in headless Chrome needs the software renderer. */
const SWIFTSHADER = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']

export default defineConfig({
  testDir: 'e2e',
  timeout: 60_000,
  expect: { timeout: 15_000 },
  fullyParallel: true,
  // Each worker renders the 3D world on the CPU (SwiftShader). In parallel they starve each other and
  // smooth scrolling slows past the timeouts, so run one test at a time.
  workers: 1,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  reporter: isCI ? [['github'], ['list']] : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    // Locally reuse the installed Chrome instead of downloading Playwright's browsers.
    channel: isCI ? undefined : 'chrome',
    launchOptions: { args: SWIFTSHADER },
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], channel: isCI ? undefined : 'chrome', viewport: { width: 1440, height: 900 } } },
    { name: 'mobile', use: { ...devices['Pixel 7'], channel: isCI ? undefined : 'chrome' } },
  ],
  webServer: {
    // A fake Formspree id so the form posts (the request is intercepted in the tests).
    command: `npm run build && npm run preview -- --port ${PORT} --strictPort`,
    env: { VITE_FORMSPREE_ID: 'e2e-form' },
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !isCI,
    timeout: 180_000,
  },
})
