# 3D Portfolio

A data-science portfolio built around a single interactive particle field. As you scroll, about 7,000 particles
morph between five shapes, one for each section:

| Section    | Shape                                                    |
| ---------- | -------------------------------------------------------- |
| Hero       | Feed-forward neural network with activation pulses       |
| About      | Skill-embedding clusters                                 |
| Experience | Multivariate time series                                 |
| Projects   | Loss landscape                                           |
| Contact    | Globe                                                    |

Stack: React 19, React Three Fiber, three.js, Tailwind CSS 4, Vite, Vitest.

## Run

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # unit + component tests
npm run coverage   # coverage report (80% threshold)
npm run build      # production build in dist/
```

## Make it yours

- **Content:** all copy lives in `src/content/portfolio.ts` and is placeholder for now. Replace the bio, roles,
  projects, email and social links.
- **Résumé:** drop your PDF at `public/resume.pdf`, or remove `resumeUrl` to hide the button.
- **Colours and fonts:** use the `@theme` tokens in `src/index.css`. Particle colours are in
  `src/scene/particleMaterial.ts`.
- **Shapes:** the generators are in `src/scene/shapes.ts`. Each one returns `count * 3` coordinates, and their
  order must match `SECTIONS` in `src/content/sections.ts`.

## How it works

- `useSectionProgress` turns scroll position into a fractional section index and stores it in a ref, so
  scrolling never re-renders React.
- `shapeWeights` turns that index into blend weights. The vertex shader mixes all five shape attributes on the
  GPU, so the CPU does no per-particle work.
- The scene is lazy-loaded after the text. It respects `prefers-reduced-motion` and falls back to a static
  gradient when WebGL isn't available.

## Deploy

`npm run build` produces a static `dist/` folder. You can host it on Vercel, Netlify, Cloudflare Pages or
GitHub Pages without any configuration.
