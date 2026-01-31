// lib/linkStore.ts
//
// This module is responsible for:
// 1. Authenticating with the Google Sheets API using a service account
// 2. Fetching a table of short-link mappings (slug → URL) from a Google Sheet
// 3. Caching those mappings in memory to avoid excessive API calls
// 4. Providing a single lookup function: getLinkForSlug(slug)
//
// This file is intentionally server-only. It should never be imported
// into client-side code.

import { google } from 'googleapis'

/**
 * A simple in-memory map of:
 *   slug (lowercase string) → destination URL
 *
 * Example:
 *   "kudzu" → "https://drive.google.com/drive/folders/..."
 */
type LinkMap = Map<string, string>

/**
 * Warm-instance cache.
 *
 * - `map` holds the slug → URL mappings
 * - `expiresAt` is a timestamp (ms since epoch) after which
 *   the cache is considered stale
 *
 * IMPORTANT:
 * - This cache exists only for the lifetime of a single server instance.
 * - In serverless environments (like Vercel), this is a best-effort
 *   optimization, not a guarantee.
 * - CDN caching (via Cache-Control headers in route handlers)
 *   is what actually protects you at scale.
 */
let cache: { map: LinkMap; expiresAt: number } | null = null

/**
 * Creates and returns an authenticated Google JWT client
 * for accessing the Google Sheets API.
 *
 * Authentication uses a Google *service account*, not OAuth user consent.
 * This is appropriate because:
 * - Access is server-to-server
 * - The sheet is shared explicitly with the service account
 *
 * Environment variables required:
 * - GOOGLE_SERVICE_ACCOUNT_EMAIL
 * - GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
 */
function getAuth() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  let key = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY

  if (!email || !key) {
    throw new Error('Missing Google service account env vars')
  }

  /**
   * Vercel (and many CI systems) store multiline secrets
   * with escaped newlines (`\n` instead of actual line breaks).
   *
   * The Google JWT client requires the real PEM format,
   * so we normalize the key here.
   */
  key = key.replace(/\\n/g, '\n')

  return new google.auth.JWT({
    email,
    key,
    scopes: [
      // Read-only access is sufficient and safer
      'https://www.googleapis.com/auth/spreadsheets.readonly',
    ],
  })
}

/**
 * Look up the destination URL for a given slug.
 *
 * Behavior:
 * - Slugs are expected to already be normalized (trimmed + lowercased)
 * - If the value is cached and still fresh, return it immediately
 * - Otherwise:
 *   - Fetch the sheet from Google
 *   - Build a slug → URL map
 *   - Cache it for a short time
 *   - Return the requested value
 *
 * @param slug - short identifier (e.g. "kudzu")
 * @returns the destination URL, or null if not found
 */
export async function getLinkForSlug(slug: string): Promise<string | null> {
  const now = Date.now()

  /**
   * Fast path: return from in-memory cache if available
   * and not expired.
   */
  if (cache && cache.expiresAt > now) {
    return cache.map.get(slug) ?? null
  }

  /**
   * Configuration for the Google Sheet.
   *
   * GOOGLE_SHEETS_ID:
   *   The spreadsheet ID (from the URL of the sheet)
   *
   * GOOGLE_SHEETS_RANGE:
   *   Optional. Defaults to "Links!A:B"
   *   This assumes:
   *     Column A = slug
   *     Column B = destination URL
   */
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID
  const range = process.env.GOOGLE_SHEETS_RANGE || 'Links!A:B'

  if (!spreadsheetId) {
    throw new Error('Missing GOOGLE_SHEETS_ID')
  }

  /**
   * Initialize the Sheets API client with authenticated access.
   */
  const sheets = google.sheets({
    version: 'v4',
    auth: getAuth(),
  })

  /**
   * Fetch the raw cell values from the sheet.
   * This returns rows as arrays of strings.
   */
  const resp = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
  })

  const rows = resp.data.values || []
  const map: LinkMap = new Map()

  /**
   * Convert rows into a Map.
   *
   * Expected sheet structure:
   *   slug | link
   *
   * Notes:
   * - Empty rows are ignored
   * - Header row ("slug") is skipped
   * - Slugs are normalized to lowercase
   */
  for (const row of rows) {
    const [s, url] = row as [string | undefined, string | undefined]

    if (!s || !url) continue

    const key = s.trim().toLowerCase()
    if (!key || key === 'slug') continue

    map.set(key, url.trim())
  }

  /**
   * Store the freshly built map in memory.
   *
   * Cache duration:
   * - 60 seconds is a compromise:
   *   - short enough to allow near-real-time updates from Sheets
   *   - long enough to avoid repeated API calls under light traffic
   */
  cache = {
    map,
    expiresAt: now + 60_000,
  }

  /**
   * Return the requested slug's destination,
   * or null if it does not exist.
   */
  return map.get(slug) ?? null
}
