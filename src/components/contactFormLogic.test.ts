import { buildMailto, submitContact, validateContact, type ContactFields } from './contactFormLogic'

const valid: ContactFields = { name: 'Ada', email: 'ada@example.com', message: 'Hello there, nice site.' }

describe('validateContact', () => {
  test('accepts a complete message', () => {
    expect(validateContact(valid)).toEqual({})
  })

  test('reports each missing or malformed field', () => {
    const errors = validateContact({ name: ' ', email: 'nope', message: 'hi' })
    expect(errors.name).toBeDefined()
    expect(errors.email).toBeDefined()
    expect(errors.message).toBeDefined()
  })
})

describe('buildMailto', () => {
  test('encodes the message into a mailto link', () => {
    const href = buildMailto('me@example.com', valid)
    expect(href.startsWith('mailto:me@example.com?')).toBe(true)
    expect(decodeURIComponent(href)).toContain('Hello there, nice site.')
    expect(decodeURIComponent(href)).toContain('ada@example.com')
  })
})

describe('submitContact', () => {
  test('posts JSON to Formspree and resolves on success', async () => {
    const fetchMock = vi.fn(async () => new Response('{}', { status: 200 }))
    await expect(submitContact('abc123', valid, fetchMock as unknown as typeof fetch)).resolves.toBeUndefined()
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe('https://formspree.io/f/abc123')
    expect(init.method).toBe('POST')
    expect(JSON.parse(init.body as string)).toMatchObject({ email: 'ada@example.com' })
  })

  test('rejects with a readable message on a failed response', async () => {
    const fetchMock = vi.fn(async () => new Response('{"error":"nope"}', { status: 422 }))
    await expect(submitContact('abc123', valid, fetchMock as unknown as typeof fetch)).rejects.toThrow(/could not be sent/i)
  })

  test('rejects when the network is down', async () => {
    const fetchMock = vi.fn(async () => {
      throw new TypeError('Failed to fetch')
    })
    await expect(submitContact('abc123', valid, fetchMock as unknown as typeof fetch)).rejects.toThrow(/could not be sent/i)
  })
})
