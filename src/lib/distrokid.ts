import * as cheerio from 'cheerio'
import 'server-only'

export type StreamingServiceLink = {
  service: string
  url: string
  iconUrl: string
}

function extractServiceName(iconSrc: string): string {
  const filename = iconSrc.split('/').pop()?.split('?')[0] ?? ''
  const name = filename.replace(/\.(png|jpg|jpeg|svg|webp)$/i, '').toLowerCase()

  const aliases: Record<string, string> = {
    applemusic: 'Apple Music',
    itunes: 'iTunes',
    spotify: 'Spotify',
    amazonmusic: 'Amazon Music',
    youtube: 'YouTube Music',
    youtubemusic: 'YouTube Music',
    tidal: 'Tidal',
    deezer: 'Deezer',
    pandora: 'Pandora',
    iheartradio: 'iHeart Radio',
    soundcloud: 'SoundCloud',
  }

  for (const [key, label] of Object.entries(aliases)) {
    if (name.includes(key)) return label
  }

  return name.charAt(0).toUpperCase() + name.slice(1)
}

export async function getDistroKidLinks(
  url: string,
): Promise<StreamingServiceLink[]> {
  let html: string
  try {
    const res = await fetch(url, {
      next: { revalidate: 60 * 60 * 24 }, // cache for 24 hours
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Upgrade-Insecure-Requests': '1',
      },
    })
    if (!res.ok) return []
    html = await res.text()
  } catch {
    return []
  }

  const $ = cheerio.load(html)
  const links: StreamingServiceLink[] = []

  $('a:has(.hyperDspLink)').each((_, el) => {
    const href = $(el).attr('href')
    const iconSrc = $(el).find('img').attr('src')
    if (!href || !iconSrc) return
    links.push({
      service: extractServiceName(iconSrc),
      url: href,
      iconUrl: iconSrc,
    })
  })

  return links
}
