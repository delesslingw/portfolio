#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'
import prompts from 'prompts'

const root = process.cwd()

// Where the markdown lives
const contentDir = path.join(root, 'content', 'songs')

// Where song assets live
const songsDir = path.join(root, 'public', 'songs')

// Reusable example assets (optional)
const exampleImage = path.join(root, 'public', 'images', 'example.jpg')
const exampleAudio = path.join(root, 'public', 'audio', 'example.mp3')

function yamlEscape(s) {
  const v = String(s ?? '')
  return `"${v.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\r?\n/g, '\\n')}"`
}

function normalizeListFromCSV(input) {
  const raw = String(input ?? '').trim()
  if (!raw) return []
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

function buildStreamingLinks({ bandcamp, distrokid }) {
  const links = []
  if (bandcamp) links.push({ label: 'Bandcamp', url: bandcamp })
  if (distrokid) links.push({ label: 'DistroKid', url: distrokid })
  return links
}

function renderYamlListOfStrings(items, indent = '  ') {
  if (!items.length) return `${indent}[]`
  return items.map((x) => `${indent}- ${yamlEscape(x)}`).join('\n')
}

function renderYamlLinks(items, indent = '  ') {
  if (!items.length) return `${indent}[]`
  return items
    .map(
      (x) =>
        `${indent}- label: ${yamlEscape(x.label)}\n${indent}  url: ${yamlEscape(x.url)}`,
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

    // Streaming links (restricted)
    { name: 'bandcamp', message: 'Bandcamp URL (optional)', type: 'text' },
    { name: 'distrokid', message: 'DistroKid URL (optional)', type: 'text' },

    // Audio source mode
    {
      name: 'audioMode',
      message: 'Audio source type',
      type: 'select',
      choices: [
        {
          title: 'Files in /public/songs/<slug>/ (recommended)',
          value: 'files',
        },
        { title: 'External audio links (no local files)', value: 'links' },
        { title: 'Both files AND external links', value: 'both' },
      ],
      initial: 0,
    },

    {
      name: 'audioFiles',
      message: 'Audio filenames (CSV) (e.g. "track.mp3, track.wav")',
      type: (prev) => (prev === 'files' || prev === 'both' ? 'text' : null),
      initial: 'track.mp3',
    },

    {
      name: 'audioLinks',
      message: 'Audio URLs (CSV)',
      type: (_, values) =>
        values.audioMode === 'links' || values.audioMode === 'both'
          ? 'text'
          : null,
    },

    {
      name: 'hasImage',
      message: 'Include an image?',
      type: 'toggle',
      initial: false,
      active: 'yes',
      inactive: 'no',
    },
    {
      name: 'imageFiles',
      message: 'Image filenames (CSV)',
      type: (_, values) => (values.hasImage ? 'text' : null),
      initial: 'cover.jpg',
    },
    {
      name: 'copyExampleImage',
      message: 'Copy example image into first filename?',
      type: (_, values) => (values.hasImage ? 'toggle' : null),
      initial: true,
      active: 'yes',
      inactive: 'no',
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
  audioMode,
  audioFiles,
  audioLinks,
  hasImage,
  imageFiles,
  copyExampleImage,
} = res

if (!slug || !name) process.exit(1)

const mdPath = path.join(contentDir, `${slug}.md`)
const songAssetDir = path.join(songsDir, slug)

const parsedAudioFiles = normalizeListFromCSV(audioFiles)
const parsedAudioLinks = normalizeListFromCSV(audioLinks)
const parsedImageFiles = hasImage ? normalizeListFromCSV(imageFiles) : []

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
${renderYamlListOfStrings(
  audioMode === 'files' || audioMode === 'both' ? parsedAudioFiles : [],
  '    ',
)}
  links:
${renderYamlListOfStrings(
  audioMode === 'links' || audioMode === 'both' ? parsedAudioLinks : [],
  '    ',
)}

images:
${renderYamlListOfStrings(parsedImageFiles, '  ')}
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

console.log(`\nCreated:
- ${path.relative(root, mdPath)}
- ${path.relative(root, songAssetDir)}/\n`)
