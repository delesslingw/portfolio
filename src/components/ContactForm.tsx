'use client'

import { useState } from 'react'

export default function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>(
    'idle'
  )
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('sending')
    setError(null)

    const form = e.currentTarget
    const formData = new FormData(form)

    const payload = {
      name: String(formData.get('name') ?? ''),
      email: String(formData.get('email') ?? ''),
      message: String(formData.get('message') ?? ''),
      website: String(formData.get('website') ?? ''), // honeypot
    }

    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setStatus('error')
      setError(data?.error ?? 'Something went wrong.')
      return
    }

    setStatus('sent')
    form.reset()
  }

  return (
    <form onSubmit={onSubmit} className='space-y-4'>
      <label className='block text-white opacity-80'>
        <span>Name</span>
        <input name='name' required className='w-full border p-2' />
      </label>

      <label className='block text-white opacity-80'>
        <span>Email</span>
        <input
          name='email'
          type='email'
          required
          className='w-full border p-2'
        />
      </label>

      <label className='block text-white opacity-80'>
        <span>Message</span>
        <textarea
          name='message'
          required
          rows={6}
          className='w-full border p-2'
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

      <button
        type='submit'
        disabled={status === 'sending'}
        className='border px-4 py-2 text-white opacity-80'
      >
        {status === 'sending' ? 'Sending...' : 'Send'}
      </button>

      {status === 'sent' && <p>Thanks — message sent.</p>}
      {status === 'error' && <p className='text-red-600'>{error}</p>}
    </form>
  )
}
