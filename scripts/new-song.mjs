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
  // keep it simple; wrap in double quotes and escape quotes/newlines
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

function buildStreamingLinks({
  spotify,
  appleMusic,
  youtube,
  bandcamp,
  other,
}) {
  const links = []
  if (spotify) links.push({ label: 'Spotify', url: spotify })
  if (appleMusic) links.push({ label: 'Apple Music', url: appleMusic })
  if (youtube) links.push({ label: 'YouTube', url: youtube })
  if (bandcamp) links.push({ label: 'Bandcamp', url: bandcamp })

  // allow additional "Label=URL, Label=URL"
  const extra = normalizeListFromCSV(other)
  for (const item of extra) {
    const eq = item.indexOf('=')
    if (eq > 0) {
      const label = item.slice(0, eq).trim()
      const url = item.slice(eq + 1).trim()
      if (label && url) links.push({ label, url })
    }
  }
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
      message: 'Language (e.g. en, es, catawba, etc.) (optional)',
      type: 'text',
    },
    {
      name: 'description',
      message: 'Short description (optional)',
      type: 'text',
    },

    // Streaming links
    { name: 'spotify', message: 'Spotify URL (optional)', type: 'text' },
    { name: 'appleMusic', message: 'Apple Music URL (optional)', type: 'text' },
    { name: 'youtube', message: 'YouTube URL (optional)', type: 'text' },
    { name: 'bandcamp', message: 'Bandcamp URL (optional)', type: 'text' },
    {
      name: 'otherLinks',
      message:
        'Other links (optional, CSV of Label=URL, e.g. "SoundCloud=https://..., Site=https://...")',
      type: 'text',
    },

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

    // If files are used: ask for filenames (multiple formats allowed)
    {
      name: 'audioFiles',
      message: 'Audio filenames (CSV) (e.g. "track.mp3, track.wav")',
      type: (prev) => (prev === 'files' || prev === 'both' ? 'text' : null),
      initial: 'track.mp3',
    },

    // If links are used: ask for URLs
    {
      name: 'audioLinks',
      message: 'Audio URLs (CSV) (e.g. "https://...mp3, https://...wav")',
      type: (_, values) =>
        values.audioMode === 'links' || values.audioMode === 'both'
          ? 'text'
          : null,
    },

    // Optional cover image
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
      message:
        'Image filenames (CSV) (e.g. "cover.jpg" or "cover.jpg, alt.png")',
      type: (_, values) => (values.hasImage ? 'text' : null),
      initial: 'cover.jpg',
    },
    {
      name: 'copyExampleImage',
      message:
        'Copy example image into the first image filename (if available)?',
      type: (_, values) => (values.hasImage ? 'toggle' : null),
      initial: true,
      active: 'yes',
      inactive: 'no',
    },

    // Lyrics + credits (multiline)
    { name: 'lyrics', message: 'Lyrics (optional) (paste text)', type: 'text' },
    {
      name: 'credits',
      message: 'Credits (optional) (paste text)',
      type: 'text',
    },
  ],
  {
    onCancel: () => {
      process.exit(1)
    },
  },
)

const {
  slug,
  name,
  releaseDate,
  streamingLinks,
  description,
  lyrics,
  language,
  credits,
  spotify,
  appleMusic,
  youtube,
  bandcamp,
  otherLinks,
  audioMode,
  audioFiles,
  audioLinks,
  hasImage,
  imageFiles,
  copyExampleImage,
} = res

if (!slug || !name) process.exit(1)

// Paths
const mdPath = path.join(contentDir, `${slug}.md`)
const songAssetDir = path.join(songsDir, slug)

// Parse lists
const parsedAudioFiles = normalizeListFromCSV(audioFiles)
const parsedAudioLinks = normalizeListFromCSV(audioLinks)
const parsedImageFiles = hasImage ? normalizeListFromCSV(imageFiles) : []

// Build streaming links list
const parsedStreamingLinks = buildStreamingLinks({
  spotify,
  appleMusic,
  youtube,
  bandcamp,
  other: otherLinks,
})

// Frontmatter pieces
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
${renderYamlListOfStrings(audioMode === 'files' || audioMode === 'both' ? parsedAudioFiles : [], '    ')}
  links:
${renderYamlListOfStrings(audioMode === 'links' || audioMode === 'both' ? parsedAudioLinks : [], '    ')}

images:
${renderYamlListOfStrings(parsedImageFiles, '  ')}
---

# ${name}
`

// Body sections (keep simple and readable)
const bodyParts = []

if (lyrics && String(lyrics).trim()) {
  bodyParts.push(`## Lyrics\n\n${String(lyrics).trim()}\n`)
}

if (credits && String(credits).trim()) {
  bodyParts.push(`## Credits\n\n${String(credits).trim()}\n`)
}

const md = fm + (bodyParts.length ? '\n' + bodyParts.join('\n') : '\n')

// Ensure directories
await fs.mkdir(contentDir, { recursive: true })
await fs.mkdir(songAssetDir, { recursive: true })

// Write markdown
await fs.writeFile(mdPath, md, 'utf8')

// Handle copying example assets (best-effort)
const warnings = []

// Copy example audio into first audio file, if using files and user provided at least one filename
if (
  (audioMode === 'files' || audioMode === 'both') &&
  parsedAudioFiles.length
) {
  const target = path.join(songAssetDir, parsedAudioFiles[0])

  // Only copy if target doesn't exist
  try {
    await fs.access(target)
  } catch {
    try {
      // If the target extension isn't mp3, we still copy the example mp3 bytes; that can be confusing.
      // We'll only auto-copy when target ends in .mp3.
      if (parsedAudioFiles[0].toLowerCase().endsWith('.mp3')) {
        await fs.copyFile(exampleAudio, target)
      } else {
        warnings.push(
          `Did not copy example audio because first filename is not .mp3 (${parsedAudioFiles[0]}). Place your audio file manually.`,
        )
      }
    } catch (err) {
      warnings.push(
        `Could not copy example audio: ${err?.message || String(err)}`,
      )
    }
  }
}

// Copy example image into first image file, if requested
if (hasImage && copyExampleImage && parsedImageFiles.length) {
  const target = path.join(songAssetDir, parsedImageFiles[0])
  try {
    await fs.access(target)
  } catch {
    try {
      await fs.copyFile(exampleImage, target)
    } catch (err) {
      warnings.push(
        `Could not copy example image: ${err?.message || String(err)}`,
      )
    }
  }
}

console.log(`\nCreated:
- ${path.relative(root, mdPath)}
- ${path.relative(root, songAssetDir)}/`)

if (warnings.length) {
  console.log('\nWarnings:')
  for (const w of warnings) console.log(`- ⚠️ ${w}`)
}

console.log('')
