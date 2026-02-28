#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'
import prompts from 'prompts'

const root = process.cwd()

const contentDir = path.join(root, 'content', 'songs')
const songsDir = path.join(root, 'public', 'songs')

function yamlEscape(s) {
  const v = String(s ?? '')
  return `"${v
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\r?\n/g, '\\n')}"`
}

function buildStreamingLinks({ bandcamp, distrokid }) {
  const links = []
  if (bandcamp) links.push({ label: 'Bandcamp', url: bandcamp })
  if (distrokid) links.push({ label: 'DistroKid', url: distrokid })
  return links
}

function renderYamlLinks(items, indent = '  ') {
  if (!items.length) return `${indent}[]`
  return items
    .map(
      (x) =>
        `${indent}- label: ${yamlEscape(x.label)}\n${indent}  url: ${yamlEscape(
          x.url,
        )}`,
    )
    .join('\n')
}

const res = await prompts(
  [
    {
      name: 'slug',
      message: 'Slug (e.g. my-new-song)',
      type: 'text',
      validate: (v) => (v ? true : 'Required'),
    },
    {
      name: 'name',
      message: 'Song name',
      type: 'text',
      validate: (v) => (v ? true : 'Required'),
    },
    {
      name: 'releaseDate',
      message: 'Release date (YYYY, YYYY-MM, or YYYY-MM-DD) (optional)',
      type: 'text',
    },
    {
      name: 'language',
      message: 'Language (optional)',
      type: 'text',
    },
    {
      name: 'description',
      message: 'Short description (optional)',
      type: 'text',
    },

    { name: 'bandcamp', message: 'Bandcamp URL (optional)', type: 'text' },
    { name: 'distrokid', message: 'DistroKid URL (optional)', type: 'text' },

    {
      name: 'audioFile',
      message: 'Audio filename (e.g. track.mp3)',
      type: 'text',
      initial: 'track.mp3',
      validate: (v) => (v ? true : 'Audio filename required'),
    },

    {
      name: 'imageFile',
      message: 'Image filename (e.g. cover.jpg)',
      type: 'text',
      initial: 'cover.jpg',
      validate: (v) => (v ? true : 'Image filename required'),
    },

    { name: 'lyrics', message: 'Lyrics (optional)', type: 'text' },
    { name: 'credits', message: 'Credits (optional)', type: 'text' },
  ],
  {
    onCancel: () => process.exit(1),
  },
)

const {
  slug,
  name,
  releaseDate,
  description,
  lyrics,
  language,
  credits,
  bandcamp,
  distrokid,
  audioFile,
  imageFile,
} = res

if (!slug || !name) process.exit(1)

const mdPath = path.join(contentDir, `${slug}.md`)
const songAssetDir = path.join(songsDir, slug)

const parsedStreamingLinks = buildStreamingLinks({
  bandcamp,
  distrokid,
})

const fm = `---
type: "song"
name: ${yamlEscape(name)}
slug: ${yamlEscape(slug)}
releaseDate: ${yamlEscape(releaseDate || '')}
language: ${yamlEscape(language || '')}
description: ${yamlEscape(description || '')}
mediaRoot: ${yamlEscape(`/songs/${slug}/`)}

streamingLinks:
${renderYamlLinks(parsedStreamingLinks)}

audio:
  files:
    - ${yamlEscape(audioFile)}
  links: []

images:
  - ${yamlEscape(imageFile)}
---

# ${name}
`

const bodyParts = []

if (lyrics?.trim()) {
  bodyParts.push(`## Lyrics\n\n${lyrics.trim()}\n`)
}

if (credits?.trim()) {
  bodyParts.push(`## Credits\n\n${credits.trim()}\n`)
}

const md = fm + (bodyParts.length ? '\n' + bodyParts.join('\n') : '\n')

await fs.mkdir(contentDir, { recursive: true })
await fs.mkdir(songAssetDir, { recursive: true })
await fs.writeFile(mdPath, md, 'utf8')

console.log(`\nCreated:`)
console.log(`- ${path.relative(root, mdPath)}`)
console.log(`- ${path.relative(root, songAssetDir)}/\n`)
