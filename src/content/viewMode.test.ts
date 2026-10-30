import { otherViewMode, parseViewMode, viewModeHref } from './viewMode'

describe('parseViewMode', () => {
  test('defaults to the immersive 3D view', () => {
    expect(parseViewMode('')).toBe('immersive')
    expect(parseViewMode('?foo=bar')).toBe('immersive')
  })

  test('reads ?view=classic, ignoring case', () => {
    expect(parseViewMode('?view=classic')).toBe('classic')
    expect(parseViewMode('?x=1&view=CLASSIC')).toBe('classic')
  })

  test('treats unknown values as immersive', () => {
    expect(parseViewMode('?view=fancy')).toBe('immersive')
  })
})

describe('viewModeHref', () => {
  test('links to each view from the site root', () => {
    expect(viewModeHref('classic')).toBe('./?view=classic')
    expect(viewModeHref('immersive')).toBe('./')
  })

  test('otherViewMode flips between the two', () => {
    expect(otherViewMode('classic')).toBe('immersive')
    expect(otherViewMode('immersive')).toBe('classic')
  })
})
