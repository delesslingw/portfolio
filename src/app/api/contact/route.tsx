import { NextResponse } from 'next/server'
import { Resend } from 'resend'

export const runtime = 'nodejs' // Resend works best in Node runtime

const resend = new Resend(process.env.RESEND_API_KEY)

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const name = String(body?.name ?? '').trim()
    const email = String(body?.email ?? '').trim()
    const message = String(body?.message ?? '').trim()

    // Honeypot: include a hidden "website" input on the client
    const website = String(body?.website ?? '').trim()
    if (website) {
      // Silently succeed to avoid tipping off bots
      return NextResponse.json({ ok: true }, { status: 200 })
    }

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Missing required fields.' },
        { status: 400 }
      )
    }
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email address.' },
        { status: 400 }
      )
    }
    if (message.length > 5000) {
      return NextResponse.json(
        { error: 'Message is too long.' },
        { status: 400 }
      )
    }

    const from = process.env.CONTACT_FROM_EMAIL
    const bcc = process.env.CONTACT_BCC_EMAIL

    if (!process.env.RESEND_API_KEY || !from || !bcc) {
      return NextResponse.json(
        { error: 'Server is not configured.' },
        { status: 500 }
      )
    }

    // Send one email: to submitter, BCC you
    const subject = `Thanks for reaching out, ${name}!`

    const result = await resend.emails.send({
      from,
      to: email,
      bcc,
      replyTo: email,
      subject,
      text: `Hi ${name},

Thanks for your message — I received it and will follow up soon.

Your message:
--------------------
${message}
--------------------

— DeLesslin`,
    })

    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 502 })
    }

    return NextResponse.json({ ok: true }, { status: 200 })
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }
}
