import { readSoundPreference, writeSoundPreference } from './preference'

afterEach(() => {
  vi.unstubAllGlobals()
  localStorage.clear()
})

describe('sound preference', () => {
  test('defaults to off', () => {
    expect(readSoundPreference()).toBe(false)
  })

  test('round-trips through localStorage', () => {
    writeSoundPreference(true)
    expect(readSoundPreference()).toBe(true)
    writeSoundPreference(false)
    expect(readSoundPreference()).toBe(false)
  })

  test('survives storage being unavailable', () => {
    vi.stubGlobal('localStorage', {
      getItem() {
        throw new Error('blocked')
      },
      setItem() {
        throw new Error('blocked')
      },
    })
    expect(readSoundPreference()).toBe(false)
    expect(() => writeSoundPreference(true)).not.toThrow()
  })
})

describe('useSound store', () => {
  test('toggles and remembers the choice', async () => {
    const { useSound } = await import('./useSound')
    expect(useSound.getState().isOn).toBe(false)
    useSound.getState().toggle()
    expect(useSound.getState().isOn).toBe(true)
    expect(readSoundPreference()).toBe(true)
    useSound.getState().toggle()
    expect(useSound.getState().isOn).toBe(false)
  })
})
