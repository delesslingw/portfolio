// src/app/qr/[slug]/route.ts
import colors from '@/lib/colors'
import { forceLightBackground } from '@/lib/forceLightBackground'
import { getLinkForSlug } from '@/lib/linkStore'
import { NextResponse } from 'next/server'
import path from 'node:path'
import QRCode from 'qrcode'
import sharp from 'sharp'
import TextToSVG from 'text-to-svg'

export const runtime = 'nodejs' // sharp needs node (not edge)

/**
 * NOTE (required for Vercel):
 * - Install: npm i text-to-svg
 * - Add a TTF font you have rights to ship:
 *   public/fonts/Inter-Bold.ttf   (or change FONT_PATH below)
 */

const FONT_PATH = path.join(
  process.cwd(),
  'public',
  'fonts',
  'Lexend-VariableFont_wght.ttf',
)

// Cache the font renderer across warm invocations
let _tts: ReturnType<typeof TextToSVG.loadSync> | null = null

function getTTS() {
  if (_tts) return _tts
  _tts = TextToSVG.loadSync(FONT_PATH) // <-- path string, not Buffer
  return _tts
}

function validateColorParam(hex: string | null) {
  if (hex == null) return false
  const cleaned = hex.trim().replace(/^#/, '')
  // Source - https://stackoverflow.com/a/8027444
  // Posted by Royi Namir, modified by community. See post 'Timeline' for change history
  // Retrieved 2026-01-31, License - CC BY-SA 4.0
  const reg = /^([0-9a-f]{3}){1,2}$/i
  if (!reg.test(cleaned)) return false
  return `#${cleaned}`
}

function fallbackUrl(slug: string) {
  const base = process.env.LINKS_FALLBACK_BASE || 'https://delesslin.studio'
  const u = new URL(base)
  u.searchParams.set('slug', slug)
  return u.toString()
}

function escapeXml(s: string) {
  return s.replace(/[<>&"]/g, (c) => {
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
}

/**
 * Generates a pill badge SVG where the brand text is rendered as PATHS (not <text>),
 * so it works reliably on Vercel even when system fonts are missing.
 *
 * - Right-aligned text inside the pill
 * - Fill color configurable
 */
function makeBrandSvg(brandRaw: string, height: number, pillColor: string) {
  const tts = getTTS()
  const text = escapeXml(brandRaw)

  // Typography / sizing
  const fontSize = Math.round(height * 0.7)
  const paddingX = Math.round(height * 0.5)
  const paddingY = Math.round(height * 0.18)

  // Measure accurately in the bundled font
  const metrics = tts.getMetrics(text, { fontSize })

  // Badge dimensions
  const width = Math.ceil(metrics.width + paddingX * 2)
  const pillH = Math.ceil(height + paddingY * 2)
  const rx = Math.round(pillH / 2)

  // Right-align: anchor the *end* of the text at (width - paddingX)
  // Y is baseline; this places it visually centered.
  const textX = width - paddingX
  const textBaselineY = Math.round(pillH / 2 + fontSize * 0.35)

  const textPath = tts.getPath(text, {
    x: textX,
    y: textBaselineY,
    fontSize,
    anchor: 'right',
    attributes: { fill: '#111111' },
  })

  return Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg"
         width="${width}"
         height="${pillH}"
         viewBox="0 0 ${width} ${pillH}">
      <rect x="0" y="0"
            width="${width}" height="${pillH}"
            rx="${rx}" ry="${rx}"
            fill="${pillColor}" />
      ${textPath}
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

  // Optional override: /qr/foo?brand=DELESSLIN
  const brand = (
    url.searchParams.get('brand') ||
    process.env.QR_BRAND_TEXT ||
    'DELESSLIN'
  )
    .trim()
    .toUpperCase()
    .slice(0, 16) // allow longer now that we measure text properly

  // Optional color override: /qr/foo?color=ffffff
  const color = forceLightBackground(
    validateColorParam(url.searchParams.get('color')) ||
      colors[Math.floor(Math.random() * colors.length)],
    87,
    97,
  )

  // Encode short URL by default
  const shortUrl = new URL(req.url)
  shortUrl.pathname = `/${slug}`
  shortUrl.search = ''

  const qrText = target === 'long' ? destination : shortUrl.toString()

  // Generate QR
  const pngBuffer = await QRCode.toBuffer(qrText, {
    type: 'png',
    errorCorrectionLevel: 'H',
    margin: 2,
    scale: 8,
    color: {
      dark: '#111111',
      light: color,
    },
  })

  const qr = sharp(pngBuffer)
  const meta = await qr.metadata()
  const qrWidth = meta.width ?? 0

  // Badge height tuned for bottom-right branding
  const badgeHeight = Math.max(32, Math.round(qrWidth * 0.09))

  // Make the pill background match the QR light color for cohesion
  const badgeSvg = makeBrandSvg(brand, badgeHeight, color)

  const branded = await qr
    .composite([
      {
        input: badgeSvg,
        gravity: 'southeast', // bottom-right
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
