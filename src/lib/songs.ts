import matter from 'gray-matter'
import fs from 'node:fs/promises'
import path from 'node:path'
import remarkHtml from 'remark-html'
import remarkParse from 'remark-parse'
import 'server-only'
import { unified } from 'unified'

export type StreamingLink = {
  label: string
  url: string
}

export type Song = {
  slug: string
  name: string
  releaseDate?: string
  language?: string
  description?: string

  images: string[] // resolved full paths
  audioFiles: string[] // resolved full paths
  audioLinks: string[] // external URLs
  streamingLinks: StreamingLink[]

  contentHtml: string // parsed markdown body
}

const DIR = path.join(process.cwd(), 'content', 'songs')

export async function getAllSongs(): Promise<Song[]> {
  let files: string[] = []

  try {
    files = (await fs.readdir(DIR)).filter((f) => f.endsWith('.md'))
  } catch {
    return []
  }

  const songs = await Promise.all(
    files.map(async (file) => {
      const slug = file.replace(/\.md$/, '')
      const raw = await fs.readFile(path.join(DIR, file), 'utf8')
      const { data, content } = matter(raw)

      const html = String(
        await unified().use(remarkParse).use(remarkHtml).process(content),
      )

      const mediaRoot = data.mediaRoot ?? `/songs/${slug}/`

      return {
        slug,
        name: data.name ?? slug,
        releaseDate: data.releaseDate ?? '',
        language: data.language ?? '',
        description: data.description ?? '',

        images: resolveMediaArray(data.images, mediaRoot),

        audioFiles: resolveMediaArray(data.audio?.files, mediaRoot),

        audioLinks: filterStringArray(data.audio?.links),

        streamingLinks: filterStreamingLinks(data.streamingLinks),

        contentHtml: html,
      }
    }),
  )

  // Sort newest first by releaseDate (string compare works for YYYY-MM-DD)
  return songs.sort((a, b) =>
    (b.releaseDate ?? '').localeCompare(a.releaseDate ?? ''),
  )
}

function resolveMediaArray(arr: unknown, mediaRoot: string): string[] {
  const safe = filterStringArray(arr)
  return safe.map((file) => `${mediaRoot}${file}`)
}

function filterStringArray(arr: unknown): string[] {
  if (!Array.isArray(arr)) return []
  return arr.filter(
    (entry): entry is string =>
      typeof entry === 'string' && entry.trim().length > 0,
  )
}

function filterStreamingLinks(arr: unknown): StreamingLink[] {
  if (!Array.isArray(arr)) return []

  return arr
    .filter((entry): entry is StreamingLink => {
      if (typeof entry !== 'object' || entry === null) return false

      const maybe = entry as Record<string, unknown>

      return typeof maybe.label === 'string' && typeof maybe.url === 'string'
    })
    .map((entry) => ({
      label: entry.label,
      url: entry.url,
    }))
}
export async function getSongBySlug(slug: string): Promise<Song | null> {
  const filePath = path.join(DIR, `${slug}.md`)

  let raw: string

  try {
    raw = await fs.readFile(filePath, 'utf8')
  } catch (e: unknown) {
    if (
      typeof e === 'object' &&
      e !== null &&
      'code' in e &&
      (e as { code?: string }).code === 'ENOENT'
    ) {
      return null
    }

    throw e
  }

  const { data, content } = matter(raw)

  const html = String(
    await unified().use(remarkParse).use(remarkHtml).process(content),
  )

  const mediaRoot = data.mediaRoot ?? `/songs/${slug}/`

  return {
    slug,
    name: data.name ?? slug,
    releaseDate: data.releaseDate ?? '',
    language: data.language ?? '',
    description: data.description ?? '',

    images: resolveMediaArray(data.images, mediaRoot),

    audioFiles: resolveMediaArray(data.audio?.files, mediaRoot),

    audioLinks: filterStringArray(data.audio?.links),

    streamingLinks: filterStreamingLinks(data.streamingLinks),

    contentHtml: html,
  }
}
