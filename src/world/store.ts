import { create } from 'zustand'

export type CursorMode = 'default' | 'hover' | 'grab'

interface WorldState {
  /** Index into `cameraStopIds` of the stop nearest the camera. */
  activeStop: number
  focusedProject: number | null
  hoveredProject: number | null
  cursor: CursorMode
  isLoaded: boolean
  setActiveStop: (stop: number) => void
  focusProject: (index: number | null) => void
  hoverProject: (index: number | null) => void
  setCursor: (mode: CursorMode) => void
  markLoaded: () => void
}

/** State shared between the HTML layer and the 3D world. */
export const useWorld = create<WorldState>()((set) => ({
  activeStop: 0,
  focusedProject: null,
  hoveredProject: null,
  cursor: 'default',
  isLoaded: false,
  setActiveStop: (stop) => set((state) => (state.activeStop === stop ? state : { activeStop: stop })),
  focusProject: (index) => set({ focusedProject: index }),
  hoverProject: (index) => set({ hoveredProject: index }),
  setCursor: (mode) => set({ cursor: mode }),
  markLoaded: () => set({ isLoaded: true }),
}))
