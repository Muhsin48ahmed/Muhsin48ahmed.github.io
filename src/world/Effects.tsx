import { Bloom, ChromaticAberration, EffectComposer, Noise, Vignette } from '@react-three/postprocessing'
import { Vector2 } from 'three'

const ABERRATION = new Vector2(0.0005, 0.0006)

/** Cinematic post-processing: bloom on emissive materials, film grain, vignette. Lighter on phones. */
export function Effects({ isMobile }: { isMobile: boolean }) {
  return (
    <EffectComposer multisampling={0}>
      <Bloom mipmapBlur intensity={isMobile ? 0.8 : 1.1} luminanceThreshold={0.6} luminanceSmoothing={0.25} />
      <ChromaticAberration offset={ABERRATION} radialModulation={false} modulationOffset={0} />
      <Noise opacity={0.035} premultiply />
      <Vignette darkness={0.7} offset={0.3} />
    </EffectComposer>
  )
}
