import { useEffect, useState } from 'react'
import { useWorld } from '../world/store'
import { SURGE_ZONES, estimateSurge, type SurgeZone } from '../world/surgeModel'

const HOURS = 23
const formatHour = (h: number) => `${String(h).padStart(2, '0')}:00`

/** Interactive explorer of the capstone's findings: pick conditions, see the estimated surge likelihood. */
export function SurgeLab() {
  const [hour, setHour] = useState(19)
  const [isRaining, setIsRaining] = useState(false)
  const [zone, setZone] = useState<SurgeZone>('inner')
  const setSurgeProbability = useWorld((s) => s.setSurgeProbability)
  const { probability, drivers } = estimateSurge({ hour, isRaining, zone })

  useEffect(() => {
    setSurgeProbability(probability)
  }, [probability, setSurgeProbability])
  useEffect(() => () => setSurgeProbability(null), [setSurgeProbability])

  return (
    <section aria-label="Surge lab" className="mt-6 rounded-2xl border border-neon-cyan/30 bg-neon-cyan/5 p-4">
      <p className="eyebrow">Surge lab · try it</p>
      <div className="mt-3 flex items-end justify-between gap-4">
        <p role="status" aria-live="polite" className="font-display text-5xl font-bold text-white tabular-nums">
          {Math.round(probability * 100)}%
          <span className="mt-1 block font-mono text-[11px] font-normal tracking-wide text-slate-400">chance a trip is surge-priced</span>
        </p>
        <ul className="space-y-0.5 text-right font-mono text-[11px] text-slate-400">
          {drivers.map((d) => (
            <li key={d.label}>
              {d.label} <span className={d.lift > 1 ? 'text-neon-pink' : d.lift < 1 ? 'text-neon-cyan' : 'text-slate-600'}>×{d.lift.toFixed(2)}</span>
            </li>
          ))}
        </ul>
      </div>

      <label className="mt-4 block text-xs text-slate-400">
        Hour of day <span className="float-right font-mono text-white">{formatHour(hour)}</span>
        <input
          type="range"
          min={0}
          max={HOURS}
          step={1}
          value={hour}
          onChange={(e) => setHour(Number(e.target.value))}
          className="surge-range mt-2 w-full"
        />
      </label>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          role="switch"
          aria-checked={isRaining}
          aria-label="Rain"
          onClick={() => setIsRaining((v) => !v)}
          className={`chip transition ${isRaining ? 'border-neon-cyan text-white' : ''}`}
        >
          {isRaining ? '🌧 raining' : '☀ dry'}
        </button>
        <label className="text-xs text-slate-400">
          Zone{' '}
          <select
            value={zone}
            onChange={(e) => setZone(e.target.value as SurgeZone)}
            className="chip ml-1 cursor-pointer appearance-none bg-ink/60 pr-6 text-white"
          >
            {(Object.keys(SURGE_ZONES) as SurgeZone[]).map((key) => (
              <option key={key} value={key}>
                {SURGE_ZONES[key].label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <p className="mt-4 text-[11px] leading-relaxed text-slate-500">
        Estimated from the capstone’s published summary statistics over 3.7M trips (peak windows, rain, pickup clusters), not the
        trained XGBoost model.
      </p>
    </section>
  )
}
