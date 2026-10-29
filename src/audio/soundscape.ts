/** Synthesised ambience: a low hum plus short blips for hover, click and open. No audio files, no network. */

export type BlipKind = 'hover' | 'click' | 'open'

const HUM_GAIN = 0.07
const FADE_IN_S = 1.6
const FADE_OUT_S = 0.8
const BLIP_GAIN = 0.045

const BLIPS: Record<BlipKind, { from: number; to: number; seconds: number; type: OscillatorType }> = {
  hover: { from: 880, to: 1320, seconds: 0.07, type: 'sine' },
  click: { from: 520, to: 260, seconds: 0.12, type: 'triangle' },
  open: { from: 330, to: 990, seconds: 0.32, type: 'sine' },
}

class Soundscape {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private humGain: GainNode | null = null
  private isRunning = false

  private ensure(): AudioContext | null {
    if (this.ctx) return this.ctx
    if (typeof AudioContext === 'undefined') return null
    this.ctx = new AudioContext()
    this.master = this.ctx.createGain()
    this.master.gain.value = 1
    this.master.connect(this.ctx.destination)
    return this.ctx
  }

  /** Must be called from a user gesture (the toggle click) so the browser allows audio. */
  start(): void {
    const ctx = this.ensure()
    if (!ctx || !this.master) return
    void ctx.resume()
    if (!this.humGain) this.humGain = this.buildHum(ctx, this.master)
    this.humGain.gain.cancelScheduledValues(ctx.currentTime)
    this.humGain.gain.linearRampToValueAtTime(HUM_GAIN, ctx.currentTime + FADE_IN_S)
    this.isRunning = true
  }

  stop(): void {
    if (!this.ctx || !this.humGain) return
    this.humGain.gain.cancelScheduledValues(this.ctx.currentTime)
    this.humGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + FADE_OUT_S)
    this.isRunning = false
  }

  blip(kind: BlipKind): void {
    if (!this.isRunning || !this.ctx || !this.master) return
    const { from, to, seconds, type } = BLIPS[kind]
    const now = this.ctx.currentTime
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(from, now)
    osc.frequency.exponentialRampToValueAtTime(to, now + seconds)
    gain.gain.setValueAtTime(BLIP_GAIN, now)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + seconds)
    osc.connect(gain).connect(this.master)
    osc.start(now)
    osc.stop(now + seconds + 0.02)
  }

  /** Two detuned sines beat slowly against each other under a low-pass filter that breathes. */
  private buildHum(ctx: AudioContext, out: AudioNode): GainNode {
    const gain = ctx.createGain()
    gain.gain.value = 0
    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 320
    filter.Q.value = 0.7
    const lfo = ctx.createOscillator()
    const lfoDepth = ctx.createGain()
    lfo.frequency.value = 0.08
    lfoDepth.gain.value = 120
    lfo.connect(lfoDepth).connect(filter.frequency)
    lfo.start()
    for (const [freq, type, level] of [
      [55, 'sine', 0.6],
      [55.6, 'sine', 0.5],
      [110, 'triangle', 0.12],
    ] as const) {
      const osc = ctx.createOscillator()
      const g = ctx.createGain()
      osc.type = type
      osc.frequency.value = freq
      g.gain.value = level
      osc.connect(g).connect(filter)
      osc.start()
    }
    filter.connect(gain).connect(out)
    return gain
  }
}

export const soundscape = new Soundscape()
