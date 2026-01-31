// src/proxy.ts
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Match "/kudzu.png"
  const match = pathname.match(/^\/([a-z0-9-_]+)\.png$/i)

  if (match) {
    const slug = match[1].toLowerCase()
    const url = req.nextUrl.clone()

    // Internally rewrite to the stable route
    url.pathname = `/qr/${slug}`

    return NextResponse.rewrite(url)
  }

  return NextResponse.next()
}

// Avoid touching Next internals and known static assets
export const config = {
  matcher: ['/((?!_next|favicon.ico|robots.txt|sitemap.xml).*)'],
}
