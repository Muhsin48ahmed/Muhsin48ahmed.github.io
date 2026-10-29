import { soundscape } from './soundscape'

/** Minimal stand-in for the Web Audio API: records what the soundscape asks for. */
function fakeAudioContext() {
  const param = () => ({
    value: 0,
    setValueAtTime: vi.fn(),
    linearRampToValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
    cancelScheduledValues: vi.fn(),
  })
  const node = () => {
    const n: Record<string, unknown> = { connect: vi.fn(() => n), start: vi.fn(), stop: vi.fn() }
    return n
  }
  const created = { oscillators: 0, gains: 0 }
  class FakeContext {
    currentTime = 0
    destination = node()
    resume = vi.fn(async () => {})
    createGain() {
      created.gains++
      return { ...node(), gain: param() }
    }
    createOscillator() {
      created.oscillators++
      return { ...node(), type: 'sine', frequency: param() }
    }
    createBiquadFilter() {
      return { ...node(), type: 'lowpass', frequency: param(), Q: param() }
    }
  }
  return { FakeContext, created }
}

afterEach(() => vi.unstubAllGlobals())

describe('soundscape', () => {
  test('is a safe no-op without the Web Audio API', () => {
    vi.stubGlobal('AudioContext', undefined)
    expect(() => {
      soundscape.start()
      soundscape.blip('hover')
      soundscape.stop()
    }).not.toThrow()
  })

  test('builds the hum on start and plays blips only while running', () => {
    const { FakeContext, created } = fakeAudioContext()
    vi.stubGlobal('AudioContext', FakeContext)
    soundscape.start()
    const afterStart = created.oscillators
    expect(afterStart).toBeGreaterThanOrEqual(3) // hum voices + LFO
    soundscape.blip('open')
    expect(created.oscillators).toBe(afterStart + 1)
    soundscape.stop()
    soundscape.blip('click')
    expect(created.oscillators).toBe(afterStart + 1)
  })
})
