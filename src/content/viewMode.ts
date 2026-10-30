/**
 * Two ways to read the site: the immersive 3D world (default) and a fast classic page with the same content.
 * The choice lives in the URL (?view=classic) so it can be shared and works without JavaScript state.
 */
export type ViewMode = 'immersive' | 'classic'

export function parseViewMode(search: string): ViewMode {
  return new URLSearchParams(search).get('view')?.toLowerCase() === 'classic' ? 'classic' : 'immersive'
}

export const otherViewMode = (mode: ViewMode): ViewMode => (mode === 'classic' ? 'immersive' : 'classic')

export const viewModeHref = (mode: ViewMode) => (mode === 'classic' ? './?view=classic' : './')

/** The view for this page load. The URL only changes on navigation, so reading it per render is safe. */
export const getViewMode = (): ViewMode => (typeof window === 'undefined' ? 'immersive' : parseViewMode(window.location.search))
