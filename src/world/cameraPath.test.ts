import { framingShift, poseAt, type Pose } from './cameraPath'

const keyframes: Pose[] = [
  { eye: [0, 0, 10], focus: [0, 0, 0] },
  { eye: [0, 0, -10], focus: [0, 0, -20] },
  { eye: [10, 0, -30], focus: [10, 0, -40] },
]

describe('poseAt', () => {
  test('holds the first pose at the top of the page', () => {
    expect(poseAt(keyframes, 0.5)).toEqual({ ...keyframes[0], framing: 1 })
  })

  test('holds a pose while its stop fills the screen', () => {
    expect(poseAt(keyframes, 1.5)).toEqual({ ...keyframes[1], framing: 1 })
  })

  test('is halfway between two poses at the boundary between stops', () => {
    const pose = poseAt(keyframes, 2)
    expect(pose.eye[0]).toBeCloseTo(5)
    expect(pose.eye[2]).toBeCloseTo(-20)
    expect(pose.focus[2]).toBeCloseTo(-30)
  })

  test('holds the last pose past the end', () => {
    expect(poseAt(keyframes, 99)).toEqual({ ...keyframes[2], framing: 1 })
  })

  test('blends the framing weight, defaulting to 1 (offset framing)', () => {
    const centred: Pose[] = [keyframes[0]!, { ...keyframes[1]!, framing: 0 }]
    expect(poseAt(centred, 0.5).framing).toBe(1)
    expect(poseAt(centred, 1.5).framing).toBe(0)
    expect(poseAt(centred, 1).framing).toBeCloseTo(0.5)
  })

  test('throws when there are no keyframes', () => {
    expect(() => poseAt([], 0)).toThrow(/keyframe/)
  })
})

describe('framingShift', () => {
  test('pushes the subject to the right on wide screens (text sits on the left)', () => {
    const shift = framingShift(16 / 9)
    expect(shift.x).toBeLessThan(0)
    expect(shift.y).toBe(0)
    expect(shift.zoom).toBe(1)
  })

  test('pushes the subject down and pulls the camera back on tall screens', () => {
    const shift = framingShift(9 / 19)
    expect(shift.x).toBe(0)
    expect(shift.y).toBeGreaterThan(0)
    expect(shift.zoom).toBeGreaterThan(1)
  })
})
