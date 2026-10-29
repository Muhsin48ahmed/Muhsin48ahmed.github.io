import { useId, useState, type FormEvent } from 'react'
import { buildMailto, submitContact, validateContact, type ContactErrors, type ContactFields } from './contactFormLogic'

type Status = 'idle' | 'sending' | 'sent' | 'error'

const EMPTY: ContactFields = { name: '', email: '', message: '' }

interface ContactFormProps {
  to: string
  /** Formspree form ID; when empty the form opens an email draft instead. */
  formId: string
}

export function ContactForm({ to, formId }: ContactFormProps) {
  const id = useId()
  const [fields, setFields] = useState(EMPTY)
  const [errors, setErrors] = useState<ContactErrors>({})
  const [status, setStatus] = useState<Status>('idle')
  const [failure, setFailure] = useState('')

  const update = (key: keyof ContactFields) => (e: { target: { value: string } }) =>
    setFields((f) => ({ ...f, [key]: e.target.value }))

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const found = validateContact(fields)
    setErrors(found)
    if (Object.keys(found).length > 0) return
    if (!formId) {
      window.location.assign(buildMailto(to, fields))
      return
    }
    setStatus('sending')
    try {
      await submitContact(formId, fields)
      setStatus('sent')
      setFields(EMPTY)
    } catch (error) {
      setFailure(error instanceof Error ? error.message : 'Something went wrong.')
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return (
      <p className="panel p-6 text-slate-300">
        <span className="font-display text-xl font-bold text-white">Thanks — message received.</span>
        <br />
        I’ll get back to you at the address you gave.
      </p>
    )
  }

  const field = (key: keyof ContactFields, label: string, input: React.ReactNode) => (
    <div>
      <label htmlFor={`${id}-${key}`} className="mb-1 block text-xs text-slate-400">
        {label}
      </label>
      {input}
      {errors[key] && (
        <p role="alert" className="mt-1 text-xs text-neon-pink">
          {errors[key]}
        </p>
      )}
    </div>
  )
  const inputClass =
    'w-full rounded-xl border border-line bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-neon-cyan focus:outline-none'

  return (
    <form onSubmit={onSubmit} noValidate className="panel space-y-4 p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        {field('name', 'Name', <input id={`${id}-name`} value={fields.name} onChange={update('name')} className={inputClass} autoComplete="name" />)}
        {field(
          'email',
          'Email',
          <input id={`${id}-email`} type="email" value={fields.email} onChange={update('email')} className={inputClass} autoComplete="email" />,
        )}
      </div>
      {field(
        'message',
        'Message',
        <textarea id={`${id}-message`} rows={4} value={fields.message} onChange={update('message')} className={inputClass} />,
      )}
      {status === 'error' && (
        <p role="alert" className="text-xs text-neon-pink">
          {failure}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" data-magnetic disabled={status === 'sending'} className="btn bg-white text-ink hover:bg-neon-cyan disabled:opacity-60">
          {status === 'sending' ? 'Sending…' : formId ? 'Send message' : 'Send via email app'}
        </button>
        {!formId && <span className="font-mono text-[11px] text-slate-500">opens your email app with the message filled in</span>}
      </div>
    </form>
  )
}
