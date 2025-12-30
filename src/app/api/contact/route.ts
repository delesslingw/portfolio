import { NextResponse } from 'next/server'
import { Resend } from 'resend'

export const runtime = 'nodejs'

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function POST(req: Request) {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.CONTACT_FROM_EMAIL
  const bcc = process.env.CONTACT_BCC_EMAIL

  // TEMP: show config presence (not values)
  if (!apiKey || !from || !bcc) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Server misconfigured',
        debug: {
          hasApiKey: Boolean(apiKey),
          hasFrom: Boolean(from),
          hasBcc: Boolean(bcc),
        },
      },
      { status: 500 }
    )
  }

  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Body was not valid JSON' },
      { status: 400 }
    )
  }

  const name = String(body?.name ?? '').trim()
  const email = String(body?.email ?? '').trim()
  const message = String(body?.message ?? '').trim()
  const website = String(body?.website ?? '').trim()

  // Honeypot
  if (website) {
    return NextResponse.json({ ok: true }, { status: 200 })
  }

  // TEMP: echo what server received (safe)
  if (!name || !email || !message) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Validation failed',
        debug: {
          nameLen: name.length,
          emailLen: email.length,
          messageLen: message.length,
        },
      },
      { status: 400 }
    )
  }

  if (!isValidEmail(email)) {
    return NextResponse.json(
      { ok: false, error: 'Invalid email address' },
      { status: 400 }
    )
  }

  const resend = new Resend(apiKey)

  try {
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
      return NextResponse.json(
        { ok: false, error: 'Resend error', debug: result.error },
        { status: 502 }
      )
    }

    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Unhandled exception',
        debug: String(err?.message ?? err),
      },
      { status: 500 }
    )
  }
}
