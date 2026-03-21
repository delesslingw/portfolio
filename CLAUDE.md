# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal portfolio and utility website for Delesslin. Deployed on Vercel. Uses Graphite for stacked PRs.

## Commands

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run lint             # ESLint — run before submitting (required for Vercel build)
npm run new:project      # Scaffold new project markdown + public assets
npm run delete:project   # Remove project markdown + public assets
npm run new:song         # Scaffold new song markdown + public assets
npm run delete:song      # Remove song markdown + public assets
```

### Graphite workflow (stacked PRs)
```bash
npm run lint             # Must pass before submitting
gt create -am "your commit message"
gt submit
gt sync
```

## Architecture

### Content Model

All content is **markdown files with YAML frontmatter** in `content/`:

- `content/projects/*.md` — loaded by `src/lib/projects.ts` via `getAllProjects()`
- `content/songs/*.md` — loaded by `src/lib/songs.ts` via `getAllSongs()` / `getSongBySlug(slug)`

Frontmatter fields reference assets via `mediaRoot` (e.g. `/projects/slug/`) pointing into `public/`.

### Routing

This is a **Next.js App Router** project. Key routes:

| Route | File | Purpose |
|---|---|---|
| `/` | `src/app/page.tsx` | Homepage with hero, boid canvas, projects, contact |
| `/links` | `src/app/links/page.tsx` | Public short links from Google Sheets |
| `/music` | `src/app/music/page.tsx` | Song listing |
| `/music/[slug]` | `src/app/music/[slug]/page.tsx` | Song page with player + streaming links |
| `/cv` | `src/app/cv/page.tsx` | CV page (stub — coming soon) |
| `/qr/[slug]` | `src/app/qr/[slug]/route.ts` | Server-side QR code PNG generation |
| `/[slug]` | `src/app/[slug]/route.ts` | Short URL redirect via Google Sheets |
| `/{slug}.png` | `src/proxy.ts` (middleware) | Rewrites to `/qr/{slug}` |
| `/api/contact` | `src/app/api/contact/route.ts` | Contact form → Resend email |

### External Services

- **Google Sheets** (`src/lib/linkStore.ts`) — short link store; authenticated via service account; 60-second in-memory cache. Columns: A=slug, B=url, C=title, D=description, E=public.
- **Resend** (`src/app/api/contact/`) — transactional email for contact form; uses React Email templates.
- **DistroKid** (`src/lib/distrokid.ts`) — scrapes streaming service links (Spotify, Apple Music, etc.) from DistroKid landing pages using cheerio; 24-hour revalidation cache.

### Environment Variables

Copy `example.env` to `.env`. Required vars:
```
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY=   # Multiline key — newlines escaped as \n
GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_SHEETS_ID=
GOOGLE_SHEETS_RANGE=Links!A:E         # Default range
RESEND_API_KEY=
CONTACT_FROM_EMAIL=
CONTACT_BCC_EMAIL=
```

Optional QR customization:
```
QR_BRAND_TEXT=DELESSLIN
LINKS_FALLBACK_BASE=https://delesslin.studio
```

### Key Components

- **`BoidCanvas` / `RepellantBoidCanvas`** — p5.js boid flocking simulation used as animated background on homepage and `/links`.
- **`MusicPlayer`** — Audio playback with Web Audio API `AnalyserNode` feeding a p5.js spectrum visualizer (`visualizerSketch.ts`).
- **`MotionTitle`** — Framer Motion animated title; fixed top-left, links home.
- **`Nav`** — Two nav variants: `NavButtons` (bottom-right on homepage hero) and `HamburgerNav` (sticky top-right, appears after scrolling past hero).
- **`Project`** — Renders a single project with image carousel, markdown content, and optional audio controls.

### Styling

Tailwind CSS v4 with PostCSS. Use `cn()` from `src/lib/utils.ts` (clsx + tailwind-merge) for conditional class composition. Colors for project borders / link backgrounds come from `src/lib/colors.ts`.

### QR Code Generation

`/qr/[slug]/route.ts` validates the slug against Google Sheets, generates a QR PNG via the `qrcode` library, composites a branded pill badge using `text-to-svg` + `sharp`, and caches for 5 minutes. Background colors are clamped to light values via `src/lib/forceLightBackground.ts`.
