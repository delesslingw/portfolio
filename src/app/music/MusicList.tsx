'use client'

import colors from '@/lib/colors'
import { Song } from '@/lib/songs'
import { Pause, Play } from '@deemlol/next-icons'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

export default function MusicList({ songs }: { songs: Song[] }) {
  const [activeSlug, setActiveSlug] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  const [colorIndex, setColorIndex] = useState(() => Math.floor(Math.random() * colors.length))

  const activeSong = songs.find((s) => s.slug === activeSlug)

  // Cycle through colors while playing, stop when paused
  useEffect(() => {
    if (!isPlaying) return
    const interval = setInterval(() => {
      setColorIndex((i) => (i + 1) % colors.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [isPlaying])

  // When activeSlug changes, load and play the new track
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !activeSlug) return
    audio.play()
  }, [activeSlug])

  const handleToggle = (slug: string) => {
    const audio = audioRef.current
    if (!audio) return

    if (activeSlug === slug) {
      // Same track — toggle play/pause
      if (isPlaying) {
        audio.pause()
      } else {
        audio.play()
      }
    } else {
      // New track — switch src (audio element re-loads via key or src change)
      setActiveSlug(slug)
    }
  }

  const color = colors[colorIndex]

  return (
    <div
      className='w-full h-[33vh] border-l-16 flex'
      style={{ borderColor: color, transition: 'border-color 1.5s ease' }}
    >
      {/* ml-4 gap shows white page background — same pattern as Contact */}
      <div
        className='mx-4 flex-1 min-w-0 overflow-hidden flex items-center justify-center'
        style={{ backgroundColor: color, opacity: 0.8, transition: 'background-color 1.5s ease' }}
      >
      <audio
        ref={audioRef}
        src={activeSong?.audioFiles[0]}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
      />
      <div className='max-w-2xl w-full min-w-0 flex flex-col gap-3'>
      {songs.map((song) => {
        const active = song.slug === activeSlug
        const img = song.images[0]

        return (
          <div
            key={song.slug}
            className='flex items-stretch bg-white'
          >
            {/* Play / pause button */}
            <button
              onClick={() => handleToggle(song.slug)}
              aria-label={active && isPlaying ? 'Pause' : 'Play'}
              className='relative w-20 shrink-0 flex items-center justify-center overflow-hidden'
            >
              {img && (
                <>
                  <div
                    className='absolute inset-0 bg-cover bg-center'
                    style={{ backgroundImage: `url(${img})`, opacity: 0.5 }}
                  />
                  <div className='absolute inset-0 bg-black/30' />
                </>
              )}
              <span className='relative z-10'>
                {active && isPlaying ? (
                  <Pause size={28} color='#FFFFFF' />
                ) : (
                  <Play size={28} color='#FFFFFF' />
                )}
              </span>
            </button>

            {/* Song info — navigates to song page */}
            <Link
              href={`/music/${song.slug}`}
              className='flex-1 flex flex-col justify-center py-4 px-4 min-w-0'
            >
              <span className='font-black text-xl leading-tight truncate'>{song.name}</span>
              {song.description && (
                <span className='text-sm text-neutral-500 italic truncate'>{song.description}</span>
              )}
            </Link>

            {/* Arrow — navigates to song page, full-height click target */}
            <Link
              href={`/music/${song.slug}`}
              aria-label={`Open ${song.name}`}
              className='flex items-center px-4 text-neutral-400 hover:text-neutral-700 transition-colors'
            >
              <ChevronRight size={24} />
            </Link>
          </div>
        )
      })}
      </div>
      </div>
    </div>
  )
}
