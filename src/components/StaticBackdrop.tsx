/** Shown instead of the 3D world when WebGL is unavailable or the scene crashes. */
export function StaticBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_75%_35%,rgb(34_211_238/0.16),transparent_55%),radial-gradient(ellipse_at_85%_75%,rgb(139_92_246/0.16),transparent_50%)]"
    />
  )
}
