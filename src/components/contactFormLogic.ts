export interface ContactFields {
  name: string
  email: string
  message: string
}

export type ContactErrors = Partial<Record<keyof ContactFields, string>>

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_MESSAGE = 10
const SEND_FAILED = 'Your message could not be sent. Please email me directly instead.'

export function validateContact(fields: ContactFields): ContactErrors {
  const errors: ContactErrors = {}
  if (!fields.name.trim()) errors.name = 'Please tell me your name.'
  if (!EMAIL.test(fields.email.trim())) errors.email = 'That email address doesn’t look right.'
  if (fields.message.trim().length < MIN_MESSAGE) errors.message = `A few more words, please (at least ${MIN_MESSAGE} characters).`
  return errors
}

/** Fallback when no form service is configured: open the visitor's email app with the message filled in. */
export function buildMailto(to: string, fields: ContactFields): string {
  const subject = `Portfolio message from ${fields.name.trim()}`
  const body = `${fields.message.trim()}\n\n— ${fields.name.trim()} (${fields.email.trim()})`
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

export async function submitContact(formId: string, fields: ContactFields, fetchFn: typeof fetch = fetch): Promise<void> {
  let response: Response
  try {
    response = await fetchFn(`https://formspree.io/f/${formId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ name: fields.name.trim(), email: fields.email.trim(), message: fields.message.trim() }),
    })
  } catch (error) {
    console.error('Contact form network error', error)
    throw new Error(SEND_FAILED)
  }
  if (!response.ok) {
    console.error('Contact form rejected', response.status, await response.text().catch(() => ''))
    throw new Error(SEND_FAILED)
  }
}
