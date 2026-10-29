import { useWorld } from './store'

const initial = useWorld.getState()
afterEach(() => useWorld.setState(initial, true))

describe('world store', () => {
  test('starts at the first stop with nothing focused', () => {
    const state = useWorld.getState()
    expect(state.activeStop).toBe(0)
    expect(state.focusedProject).toBeNull()
    expect(state.cursor).toBe('default')
    expect(state.isLoaded).toBe(false)
  })

  test('focuses and clears a project', () => {
    useWorld.getState().focusProject(2)
    expect(useWorld.getState().focusedProject).toBe(2)
    useWorld.getState().focusProject(null)
    expect(useWorld.getState().focusedProject).toBeNull()
  })

  test('tracks the hovered project, cursor, stop and load state', () => {
    const { hoverProject, setCursor, setActiveStop, markLoaded } = useWorld.getState()
    hoverProject(1)
    setCursor('grab')
    setActiveStop(3)
    markLoaded()
    expect(useWorld.getState()).toMatchObject({ hoveredProject: 1, cursor: 'grab', activeStop: 3, isLoaded: true })
  })

  test('skips the update when the active stop has not changed', () => {
    const before = useWorld.getState()
    before.setActiveStop(0)
    expect(useWorld.getState()).toBe(before)
  })
})
