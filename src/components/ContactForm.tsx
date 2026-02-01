'use client'

import { useState } from 'react'
import { z } from 'zod'

const ContactSchema = z.object({
  name: z.string().trim().min(1, 'Please enter your name.').max(100),
  email: z.string().trim().email('Please enter a valid email.').max(254),
  message: z.string().trim().min(1, 'Please enter a message.').max(5000),
  website: z.string().optional(), // honeypot
})

type Status = 'idle' | 'sending' | 'sent' | 'error'

export default function ContactForm() {
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('sending')
    setError(null)

    const form = e.currentTarget
    const formData = new FormData(form)

    // Build a plain object from form fields
    const raw = {
      name: String(formData.get('name') ?? ''),
      email: String(formData.get('email') ?? ''),
      message: String(formData.get('message') ?? ''),
      website: String(formData.get('website') ?? ''), // honeypot
    }

    // ✅ Validate the DATA (not the event)
    const parsed = ContactSchema.safeParse(raw)
    if (!parsed.success) {
      setStatus('error')
      const first =
        parsed.error.issues[0]?.message ?? 'Please check your inputs.'
      setError(first)
      return
    }

    // If honeypot is filled, silently "succeed" (matches server behavior)
    if (parsed.data.website) {
      setStatus('sent')
      form.reset()
      return
    }
    console.log('Submitting payload:', parsed.data)

    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parsed.data),
    })

    if (!res.ok) {
      const text = await res.text().catch(() => '')
      setStatus('error')
      setError(text || 'Something went wrong.')
      return
    }

    setStatus('sent')
    form.reset()
  }

  return (
    <form onSubmit={onSubmit} className='space-y-4 max-w-[700] min-h-[50vh]'>
      <label className='block text-white'>
        <span>Name</span>
        <input
          name='name'
          required
          className='w-full border p-2'
          maxLength={100}
        />
      </label>

      <label className='block text-white'>
        <span>Email</span>
        <input
          name='email'
          type='email'
          required
          className='w-full border p-2'
          maxLength={254}
        />
      </label>

      <label className='block text-white'>
        <span>Message</span>
        <textarea
          name='message'
          required
          rows={6}
          className='w-full border p-2'
          maxLength={5000}
        />
      </label>

      {/* Honeypot: hide from humans, bots may fill */}
      <input
        name='website'
        tabIndex={-1}
        autoComplete='off'
        className='hidden'
        aria-hidden='true'
      />
      <div className='flex flex-row gap-3 items-center'>
        <button
          type='submit'
          disabled={status === 'sending'}
          className='border px-4 py-2 text-white cursor-pointer'
        >
          {status === 'sending' ? 'Sending...' : 'Send'}
        </button>

        {status === 'sent' && (
          <p className='text-white text-'>Thanks — message sent.</p>
        )}
        {status === 'error' && <p className='text-red-600'>{error}</p>}
      </div>
    </form>
  )
}
