const KEY = 'portfolio.sound'

/** Sound is opt-in; the choice is remembered per browser. Storage can be blocked, so every access is guarded. */
export function readSoundPreference(): boolean {
  try {
    return localStorage.getItem(KEY) === 'on'
  } catch {
    return false
  }
}

export function writeSoundPreference(isOn: boolean): void {
  try {
    localStorage.setItem(KEY, isOn ? 'on' : 'off')
  } catch {
    // Private mode or blocked storage: the toggle still works for this visit.
  }
}
