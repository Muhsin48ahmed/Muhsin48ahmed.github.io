# 3D Portfolio — Muhsin Ahmed

An interactive, scroll-driven 3D portfolio. As you scroll, the camera flies through one continuous world,
with a zone for each section:

| Section  | Zone                                                                                  |
| -------- | ------------------------------------------------------------------------------------- |
| Hero     | **Neural core.** A 3D network with signals propagating; click it to fire a burst. A waving astronaut. |
| About    | **Skill field.** Glossy physics orbs, one per skill. Hover to push them, drag to grab and throw. |
| Journey  | **Data city.** A bar-chart skyline that grows in, with one glowing tower per career milestone. |
| Projects | **Holo deck.** Floating holographic screens. Hover to tilt them; click one to fly in and open its details. |
| Contact  | **The portal.** A swirling shader portal (click to email) with the astronaut floating beside it. |

Polish: bloom, film grain, chromatic aberration, vignette, Lenis inertia scrolling, scroll reveals, a custom
cursor and an intro loader.

Stack: React 19, React Three Fiber, drei, @react-three/postprocessing, @react-three/rapier (physics), Tailwind CSS 4,
Vite, Vitest.

## Run

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # unit + component tests
npm run coverage   # coverage report (80% threshold)
npm run build      # production build in dist/
npm run preview    # serve the production build
```

## Make it yours

- **Content:** all copy is in `src/content/portfolio.ts`, and the 3D world reads from it too. Adding a journey
  milestone adds a tower and a camera stop; adding a project adds a screen.
- **Résumé button:** put a PDF in `public/` and set `resumeUrl: '/resume.pdf'` on the profile.
- **Colours and fonts:** use the `@theme` tokens in `src/index.css` and the 3D palette in `src/world/theme.ts`.
- **Camera path:** see `cameraKeyframes` in `src/world/layout.ts`. It has one pose per stop, in the same order as
  `cameraStopIds`.

## How it works

- `useStopProgress` turns the scroll position into a fractional stop index, stored in a ref so scrolling never
  re-renders React.
- `poseAt` blends the camera keyframes with a hold-then-glide easing. `CameraRig` damps toward the blended pose,
  adds pointer parallax and frames the subject beside the text column (or below it on phones).
- A small zustand store (`src/world/store.ts`) shares state between the HTML layer and the 3D world: the focused
  project, the hover state, the cursor mode and the active stop. Zones away from the camera skip rendering.
- three.js loads lazily after the text, and Rapier loads lazily with the About zone. The site respects
  `prefers-reduced-motion` and falls back to a static gradient without WebGL.

## Credits

- Astronaut model by [Quaternius](https://poly.pizza/m/3hC2i0CTuO), CC0 (public domain).
- Fonts: Inter, Space Grotesk, JetBrains Mono (self-hosted via Fontsource, SIL OFL).

## Deploy

`npm run build` produces a static `dist/` folder. You can host it on Vercel, Netlify, Cloudflare Pages or
GitHub Pages without any configuration.
