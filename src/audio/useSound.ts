import { create } from 'zustand'
import { readSoundPreference, writeSoundPreference } from './preference'
import { soundscape } from './soundscape'

interface SoundState {
  isOn: boolean
  toggle: () => void
}

/** Opt-in ambient sound. `toggle` runs inside the click handler, which is the user gesture audio needs. */
export const useSound = create<SoundState>()((set, get) => ({
  isOn: false,
  toggle: () => {
    const isOn = !get().isOn
    if (isOn) soundscape.start()
    else soundscape.stop()
    writeSoundPreference(isOn)
    set({ isOn })
  },
}))

/** A remembered "on" still needs a gesture before audio can start, so only the preference is restored here. */
export const wasSoundOn = readSoundPreference
