import { useSound } from '../audio/useSound'

export function SoundToggle() {
  const isOn = useSound((s) => s.isOn)
  const toggle = useSound((s) => s.toggle)
  return (
    <button
      type="button"
      role="switch"
      aria-checked={isOn}
      aria-label={isOn ? 'Sound on' : 'Sound off'}
      title={isOn ? 'Sound on' : 'Sound off'}
      onClick={toggle}
      className="grid size-9 shrink-0 place-items-center rounded-xl sm:size-10 border border-line bg-white/[0.04] text-slate-300 backdrop-blur-xl transition hover:text-white"
    >
      <span aria-hidden="true" className="flex h-3.5 items-end gap-[3px]">
        {[0.5, 1, 0.7, 0.9].map((h, i) => (
          <span
            key={i}
            className={`w-[3px] rounded-full bg-current ${isOn ? 'animate-pulse' : ''}`}
            style={{ height: `${h * 100}%`, animationDelay: `${i * 120}ms`, opacity: isOn ? 1 : 0.5 }}
          />
        ))}
      </span>
    </button>
  )
}
