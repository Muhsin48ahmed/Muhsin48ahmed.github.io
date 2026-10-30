// Shrinks the CC0 astronaut for the web: keeps only the animations the site plays, prunes what they
// no longer reference, and meshopt-compresses the rest (drei's useGLTF decodes it locally, no CDN).
// Usage: node scripts/optimize-astronaut.mjs
import { NodeIO } from '@gltf-transform/core'
import { ALL_EXTENSIONS } from '@gltf-transform/extensions'
import { dedup, meshopt, prune, resample } from '@gltf-transform/functions'
import { MeshoptEncoder } from 'meshoptimizer'
import { statSync } from 'node:fs'

const SOURCE = 'scripts/assets/astronaut.source.glb'
const OUTPUT = 'public/models/astronaut.glb'
/** Must match AstronautAction in src/world/Astronaut.tsx. */
const KEEP = new Set(['Wave', 'Idle', 'Idle_Neutral'].map((name) => `CharacterArmature|${name}`))

await MeshoptEncoder.ready
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.encoder': MeshoptEncoder })
const doc = await io.read(SOURCE)

for (const animation of doc.getRoot().listAnimations()) {
  if (!KEEP.has(animation.getName())) animation.dispose()
}
const kept = doc.getRoot().listAnimations().map((a) => a.getName())
if (kept.length !== KEEP.size) throw new Error(`Expected ${KEEP.size} animations, kept: ${kept.join(', ')}`)

await doc.transform(prune(), dedup(), resample(), meshopt({ encoder: MeshoptEncoder, level: 'medium' }))
await io.write(OUTPUT, doc)

const kb = (path) => Math.round(statSync(path).size / 1024)
console.log(`kept ${kept.join(', ')}\n${SOURCE}: ${kb(SOURCE)} KB → ${OUTPUT}: ${kb(OUTPUT)} KB`)
