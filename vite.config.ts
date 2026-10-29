import { defineConfig, type Plugin } from 'vitest/config'
import { loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { siteMeta } from './src/content/site'
import { buildHeadTags } from './src/seo/meta'

/** Injects link-preview and SEO tags into index.html at build time. */
function seoTags(siteUrl: string): Plugin {
  if (!siteUrl) console.warn('[seo] VITE_SITE_URL is not set: Open Graph image will use a relative path.')
  return {
    name: 'seo-tags',
    transformIndexHtml: (html) => html.replace('<!-- seo-tags -->', buildHeadTags(siteMeta(siteUrl))),
  }
}

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss(), seoTags(loadEnv(mode, process.cwd(), 'VITE_').VITE_SITE_URL ?? '')],
  // Both big chunks are lazy-loaded after the page text: World (three.js) and SkillOrbs (Rapier WASM).
  build: { chunkSizeWarningLimit: 2500 },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      // WebGL components need a real GPU context; they are verified in the browser instead.
      exclude: ['src/**/*.test.{ts,tsx}', 'src/test/**', 'src/main.tsx', 'src/world/**/*.tsx', 'src/world/theme.ts', 'src/world/useZoneActive.ts'],
      thresholds: { lines: 80, functions: 80, branches: 80, statements: 80 },
    },
  },
}))
