import { create } from 'zustand'

export type CursorMode = 'default' | 'hover' | 'grab'

interface WorldState {
  /** Index into `cameraStopIds` of the stop nearest the camera. */
  activeStop: number
  focusedProject: number | null
  hoveredProject: number | null
  cursor: CursorMode
  /** Short verb shown inside the cursor ring over a 3D object ("drag", "open"). */
  cursorLabel: string | null
  /** Probability from the surge lab while it is open, so the 3D screen can react. */
  surgeProbability: number | null
  isLoaded: boolean
  setActiveStop: (stop: number) => void
  focusProject: (index: number | null) => void
  hoverProject: (index: number | null) => void
  setCursor: (mode: CursorMode, label?: string | null) => void
  setSurgeProbability: (probability: number | null) => void
  markLoaded: () => void
}

/** State shared between the HTML layer and the 3D world. */
export const useWorld = create<WorldState>()((set) => ({
  activeStop: 0,
  focusedProject: null,
  hoveredProject: null,
  cursor: 'default',
  cursorLabel: null,
  surgeProbability: null,
  isLoaded: false,
  setActiveStop: (stop) => set((state) => (state.activeStop === stop ? state : { activeStop: stop })),
  focusProject: (index) => set({ focusedProject: index }),
  hoverProject: (index) => set({ hoveredProject: index }),
  setCursor: (mode, label = null) => set({ cursor: mode, cursorLabel: mode === 'default' ? null : label }),
  setSurgeProbability: (probability) => set({ surgeProbability: probability }),
  markLoaded: () => set({ isLoaded: true }),
}))
