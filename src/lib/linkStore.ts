// lib/linkStore.ts
//
// This module is responsible for:
// 1. Authenticating with the Google Sheets API using a service account
// 2. Fetching structured short-link records from a Google Sheet
// 3. Caching those records in memory to avoid excessive API calls
// 4. Providing lookup helpers for individual slugs and full lists
//
// This file is server-only and must never be imported into client code.

import { google } from "googleapis";

/**
 * A structured representation of a row in the sheet.
 *
 * You can expand this safely in the future
 * (e.g. image, category, createdAt, etc.)
 */
export type LinkRecord = {
    slug: string;
    url: string;
    title?: string;
    description?: string;
    public?: boolean;
};

/**
 * In-memory map:
 *   slug (lowercase string) → LinkRecord
 */
type LinkMap = Map<string, LinkRecord>;

/**
 * Warm-instance cache.
 *
 * IMPORTANT:
 * - Exists only for the lifetime of a single server instance.
 * - In serverless environments, this is best-effort.
 * - CDN caching protects you at scale.
 */
let cache: { map: LinkMap; expiresAt: number } | null = null;

/**
 * Authenticate using Google Service Account.
 */
function getAuth() {
    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    let key = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;

    if (!email || !key) {
        throw new Error("Missing Google service account env vars");
    }

    // Normalize multiline private key
    key = key.includes("\\n") ? key.replace(/\\n/g, "\n") : key;

    return new google.auth.JWT({
        email,
        key,
        scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });
}

/**
 * Fetch sheet data and build the slug → LinkRecord map.
 */
async function buildMap(): Promise<LinkMap> {
    const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
    const range = process.env.GOOGLE_SHEETS_RANGE || "Links!A:E";

    if (!spreadsheetId) {
        throw new Error("Missing GOOGLE_SHEETS_ID");
    }

    const sheets = google.sheets({
        version: "v4",
        auth: getAuth(),
    });

    const resp = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
    });

    const rows = resp.data.values || [];
    const map: LinkMap = new Map();

    /**
     * Expected columns:
     *
     * A: slug
     * B: url
     * C: title
     * D: description
     * E: public (TRUE/FALSE)
     */
    for (const row of rows) {
        const [s, url, title, description, publicFlag] = row as [
            string | undefined,
            string | undefined,
            string | undefined,
            string | undefined,
            string | undefined,
        ];

        if (!s || !url) continue;

        const slug = s.trim().toLowerCase();
        if (!slug || slug === "slug") continue;

        map.set(slug, {
            slug,
            url: url.trim(),
            title: title?.trim(),
            description: description?.trim(),
            public: publicFlag?.toLowerCase() === "true" || publicFlag === "1",
        });
    }

    return map;
}

/**
 * Ensure cache is warm.
 */
async function ensureCache(): Promise<LinkMap> {
    const now = Date.now();

    if (cache && cache.expiresAt > now) {
        return cache.map;
    }

    const map = await buildMap();

    cache = {
        map,
        expiresAt: now + 60_000, // 60 seconds
    };

    return map;
}

/**
 * Look up a single slug.
 *
 * @param slug normalized slug
 * @returns LinkRecord or null
 */
export async function getLinkForSlug(slug: string): Promise<LinkRecord | null> {
    const map = await ensureCache();
    return map.get(slug) ?? null;
}

/**
 * Return all links.
 *
 * Useful for building:
 * - /links index page
 * - linktree-style public listing
 */
export async function getAllLinks(): Promise<LinkRecord[]> {
    const map = await ensureCache();
    return Array.from(map.values());
}
