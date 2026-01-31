// src/app/qr/[slug]/route.ts
import { getLinkForSlug } from '@/lib/linkStore'
import { NextResponse } from 'next/server'
import QRCode from 'qrcode'

function fallbackUrl(slug: string) {
  const base = process.env.LINKS_FALLBACK_BASE || 'https://delesslin.studio'
  const u = new URL(base)
  u.searchParams.set('slug', slug)
  return u.toString()
}

type Params = { slug: string }
type Ctx =
  | { params: Params | Promise<Params> }
  | Promise<{ params: Params | Promise<Params> }>

export async function GET(req: Request, ctx: Ctx) {
  const ctxResolved = (await Promise.resolve(ctx)) as {
    params: Params | Promise<Params>
  }
  const params = await Promise.resolve(ctxResolved.params)

  const slug = (params.slug || '').trim().toLowerCase()

  if (!/^[a-z0-9-_]+$/.test(slug)) {
    return NextResponse.redirect(fallbackUrl(slug || 'invalid'), 302)
  }

  const destination = await getLinkForSlug(slug)
  if (!destination) {
    return NextResponse.redirect(fallbackUrl(slug), 302)
  }

  const url = new URL(req.url)
  const target = (url.searchParams.get('target') || 'short').toLowerCase()

  // Encode short URL by default
  const shortUrl = new URL(req.url)
  shortUrl.pathname = `/${slug}` // IMPORTANT: public short url
  shortUrl.search = ''

  const qrText = target === 'long' ? destination : shortUrl.toString()

  const pngBuffer = await QRCode.toBuffer(qrText, {
    type: 'png',
    errorCorrectionLevel: 'M',
    margin: 2,
    scale: 8,
  })

  return new NextResponse(new Uint8Array(pngBuffer), {
    status: 200,
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=86400',
      'Content-Disposition': `inline; filename="${slug}.png"`,
    },
  })
}
