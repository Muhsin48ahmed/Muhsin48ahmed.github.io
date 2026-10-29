import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
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
})
