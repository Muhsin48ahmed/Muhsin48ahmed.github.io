import { SECTIONS, cameraStopIds, sectionForStop } from './sections'

describe('sectionForStop', () => {
  test('maps every camera stop back to its page section', () => {
    const ids = cameraStopIds(3)
    const expected = ids.map((id) => (id.startsWith('journey') ? 'journey' : id))
    expect(ids.map((_, stop) => sectionForStop(stop, 3))).toEqual(expected)
  })

  test('clamps stops past the end to the last section', () => {
    expect(sectionForStop(99, 2)).toBe(SECTIONS[SECTIONS.length - 1]!.id)
  })
})
