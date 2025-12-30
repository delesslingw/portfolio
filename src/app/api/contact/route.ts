import { NextResponse } from 'next/server'
// import { Resend } from 'resend'

export const runtime = 'nodejs'

// function isValidEmail(email: string) {
//   return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
// }

export async function POST(req: Request) {
  // const apiKey = process.env.RESEND_API_KEY
  // const from = process.env.CONTACT_FROM_EMAIL
  // const bcc = process.env.CONTACT_BCC_EMAIL
  return NextResponse.json(
    { ok: false, debug: 'route reached' },
    { status: 418 }
  )

  //   // Helpful: tell yourself WHICH env var is missing
  //   if (!apiKey || !from || !bcc) {
  //     console.error('Contact route misconfigured', {
  //       hasApiKey: Boolean(apiKey),
  //       hasFrom: Boolean(from),
  //       hasBcc: Boolean(bcc),
  //     })
  //     return NextResponse.json(
  //       { error: 'Server is not configured.' },
  //       { status: 500 }
  //     )
  //   }

  //   const resend = new Resend(apiKey)

  //   try {
  //     const body = await req.json()

  //     const name = String(body?.name ?? '').trim()
  //     const email = String(body?.email ?? '').trim()
  //     const message = String(body?.message ?? '').trim()

  //     const website = String(body?.website ?? '').trim()
  //     if (website) {
  //       return NextResponse.json({ ok: true }, { status: 200 })
  //     }

  //     if (!name || !email || !message) {
  //       return NextResponse.json(
  //         { error: 'Missing required fields.' },
  //         { status: 400 }
  //       )
  //     }
  //     if (!isValidEmail(email)) {
  //       return NextResponse.json(
  //         { error: 'Invalid email address.' },
  //         { status: 400 }
  //       )
  //     }
  //     if (message.length > 5000) {
  //       return NextResponse.json(
  //         { error: 'Message is too long.' },
  //         { status: 400 }
  //       )
  //     }

  //     const subject = `Thanks for reaching out, ${name}!`

  //     const result = await resend.emails.send({
  //       from,
  //       to: email,
  //       bcc,
  //       replyTo: email,
  //       subject,
  //       text: `Hi ${name},

  // Thanks for your message — I received it and will follow up soon.

  // Your message:
  // --------------------
  // ${message}
  // --------------------

  // — DeLesslin`,
  //     })

  //     if (result.error) {
  //       console.error('Resend error:', result.error)
  //       return NextResponse.json({ error: result.error.message }, { status: 502 })
  //     }

  //     return NextResponse.json({ ok: true }, { status: 200 })
  //     // eslint-disable-next-line @typescript-eslint/no-explicit-any
  //   } catch (err: any) {
  //     // This will show up in Vercel function logs
  //     console.error('Contact route failed:', err)
  //     return NextResponse.json(
  //       { error: err?.message ?? 'Internal Server Error' },
  //       { status: 500 }
  //     )
  //   }
}
