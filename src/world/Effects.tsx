import { Bloom, ChromaticAberration, EffectComposer, Noise, Vignette } from '@react-three/postprocessing'
import { useFrame } from '@react-three/fiber'
import { useMemo } from 'react'
import { Vector2 } from 'three'
import { useQuality } from './quality'
import { motion } from './warp'

const ABERRATION_REST = 0.0005
/** Extra colour fringing at full warp. */
const ABERRATION_WARP = 0.004

/** Cinematic post-processing: bloom on emissive materials, film grain, vignette, warp-driven aberration. */
export function Effects({ isMobile }: { isMobile: boolean }) {
  const isEnabled = useQuality((s) => s.settings.effects)
  const offset = useMemo(() => new Vector2(ABERRATION_REST, ABERRATION_REST * 1.2), [])

  useFrame(() => {
    const amount = ABERRATION_REST + motion.warp * ABERRATION_WARP
    offset.set(amount, amount * 1.2)
  })

  if (!isEnabled) return null
  return (
    <EffectComposer multisampling={0}>
      <Bloom mipmapBlur intensity={isMobile ? 0.8 : 1.1} luminanceThreshold={0.6} luminanceSmoothing={0.25} />
      <ChromaticAberration offset={offset} radialModulation={false} modulationOffset={0} />
      <Noise opacity={0.035} premultiply />
      <Vignette darkness={0.7} offset={0.3} />
    </EffectComposer>
  )
}
