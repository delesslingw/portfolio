// app/[slug]/route.ts
//
// This route handles requests of the form:
//
//   https://links.delesslin.studio/<slug>
//
// Its responsibilities are:
// 1. Validate and normalize the incoming slug
// 2. Look up the destination URL from Google Sheets (via linkStore)
// 3. Redirect the requester to the destination URL
// 4. If the slug is invalid or unknown, redirect to a fallback page
//
// This route intentionally does NOT render HTML. It only issues redirects.

import { getLinkForSlug } from '@/lib/linkStore'
import { NextResponse } from 'next/server'

/**
 * Builds a fallback URL on the main site when a slug is invalid or missing.
 *
 * The fallback URL includes the original slug as a query parameter
 * so the destination page can display a helpful message like:
 *
 *   "Sorry, there is no link for /kudzu"
 *
 * Environment variable:
 * - LINKS_FALLBACK_BASE (e.g. https://delesslin.studio/links/not-found)
 *
 * @param slug - the slug that failed resolution
 * @returns a fully-qualified URL string
 */
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
/**
 * GET handler for the dynamic slug route.
 *
 * This function is invoked for any request that matches
 * the folder structure: app/[slug]/route.ts
 *
 * @param req - the incoming Request object
 * @param params.slug - the dynamic path segment from the URL
 */
export async function GET(req: Request, ctx: Ctx) {
  const ctxResolved = (await Promise.resolve(ctx)) as {
    params: Params | Promise<Params>
  }

  // Unwrap params whether Next gives them to us sync or async
  const params = await Promise.resolve(ctxResolved.params)
  /**
   * Normalize the slug:
   * - ensure it exists
   * - trim whitespace
   * - force lowercase for consistent lookups
   */
  const slug = (params.slug || '').trim().toLowerCase()

  /**
   * Basic slug hardening.
   *
   * This prevents:
   * - path traversal attempts
   * - accidental punctuation
   * - unexpected Unicode
   *
   * Allowed characters:
   * - lowercase letters
   * - numbers
   * - hyphen (-)
   * - underscore (_)
   */
  if (!/^[a-z0-9-_]+$/.test(slug)) {
    return NextResponse.redirect(fallbackUrl(slug || 'invalid'), 302)
  }

  /**
   * Look up the destination URL from the link store.
   *
   * This may:
   * - return immediately from memory cache
   * - or fetch and cache data from Google Sheets
   */
  const destination = await getLinkForSlug(slug)

  /**
   * If the slug is not found, redirect to the fallback page
   * on the main site.
   */
  if (!destination) {
    return NextResponse.redirect(fallbackUrl(slug), 302)
  }

  /**
   * Redirect to the resolved destination.
   *
   * 302 is intentional:
   * - browsers do not permanently cache it
   * - destinations can be updated in Sheets later
   */
  const res = NextResponse.redirect(destination, 302)

  /**
   * CDN caching:
   * - s-maxage=300 → cache for 5 minutes at the edge
   * - stale-while-revalidate=86400 → serve stale content
   *   while revalidating in the background
   *
   * This protects:
   * - your serverless function
   * - the Google Sheets API
   * during bursts (e.g., a room full of people scanning a QR code).
   */
  res.headers.set(
    'Cache-Control',
    'public, s-maxage=300, stale-while-revalidate=86400',
  )

  return res
}
