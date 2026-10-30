import { getViewMode, otherViewMode, viewModeHref } from '../content/viewMode'

const LABEL = { classic: 'Classic view', immersive: '3D view' } as const

/** Link to the other way of viewing the site. */
export function ViewSwitch({ className = '' }: { className?: string }) {
  const target = otherViewMode(getViewMode())
  return (
    <a href={viewModeHref(target)} className={className}>
      {LABEL[target]}
    </a>
  )
}
