// src/app/qr/[slug]/route.ts
import colors from '@/lib/colors'
import { getLinkForSlug } from '@/lib/linkStore'
import { NextResponse } from 'next/server'
import QRCode from 'qrcode'
import sharp from 'sharp'

export const runtime = 'nodejs' // sharp needs node (not edge)
function validateColorParam(hex: string | null) {
  if (hex == null) return false
  // Source - https://stackoverflow.com/a/8027444
  // Posted by Royi Namir, modified by community. See post 'Timeline' for change history
  // Retrieved 2026-01-31, License - CC BY-SA 4.0
  var reg = /^#([0-9a-f]{3}){1,2}$/i
  if (!reg.test('#ABC')) return false
  return `#${hex}`
}
function fallbackUrl(slug: string) {
  const base = process.env.LINKS_FALLBACK_BASE || 'https://delesslin.studio'
  const u = new URL(base)
  u.searchParams.set('slug', slug)
  return u.toString()
}

function makeBrandSvg(text: string, height: number, color?: string) {
  const fontSize = Math.round(height * 0.55)

  // Conservative width estimate:
  // 0.7em per character + generous padding
  const charWidth = fontSize * 0.7
  const paddingX = Math.round(height * 0.7)
  const width = Math.ceil(charWidth * text.length + paddingX * 0.5)

  const rx = Math.round(height / 2)

  const safe = text.replace(/[<>&"]/g, (c) => {
    switch (c) {
      case '<':
        return '&lt;'
      case '>':
        return '&gt;'
      case '&':
        return '&amp;'
      case '"':
        return '&quot;'
      default:
        return c
    }
  })

  return Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg"
         width="${width}"
         height="${height}"
         viewBox="0 0 ${width} ${height}">
      <rect
        x="0" y="0"
        width="${width}" height="${height}"
        rx="${rx}" ry="${rx}"
        fill="${color}"
      />
      <text
        x="50%" y="50%"
        dominant-baseline="middle"
        text-anchor="middle"
        font-family="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial"
        font-size="${fontSize}"
        font-weight="700"
        fill="#111111"
      >${safe}</text>
    </svg>
  `)
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

  // Optional override: /qr/foo?brand=DGW
  const brand = (
    url.searchParams.get('brand') ||
    process.env.QR_BRAND_TEXT ||
    'DELESSLIN'
  )
    .trim()
    .toUpperCase()
    .slice(0, 9) // keep it short

  // Optional color override: /qr/foo?color=ffffff
  const color =
    validateColorParam(url.searchParams.get('color')) ||
    colors[Math.floor(Math.random() * colors.length)]

  // Encode short URL by default
  const shortUrl = new URL(req.url)
  shortUrl.pathname = `/${slug}`
  shortUrl.search = ''

  const qrText = target === 'long' ? destination : shortUrl.toString()

  // Generate QR
  const pngBuffer = await QRCode.toBuffer(qrText, {
    type: 'png',
    errorCorrectionLevel: 'H', // important when placing a center mark
    margin: 2,
    scale: 8,
    color: {
      dark: '#111111',
      light: color,
    },
  })

  const qr = sharp(pngBuffer)
  const meta = await qr.metadata()
  const width = meta.width ?? 0

  // Badge height ~10–12% of QR width works well for text
  const badgeHeight = Math.max(36, Math.round(width * 0.11))

  const badgeSvg = makeBrandSvg(brand, badgeHeight, color)

  const branded = await qr
    .composite([
      {
        input: badgeSvg,
        gravity: 'southeast', // bottom-right
        top: undefined,
        left: undefined,
      },
    ])
    .png()
    .toBuffer()

  return new NextResponse(new Uint8Array(branded), {
    status: 200,
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=86400',
      'Content-Disposition': `inline; filename="${slug}.png"`,
    },
  })
}
