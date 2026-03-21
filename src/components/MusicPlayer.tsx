'use client'

import { Song } from '@/lib/songs'
import { Pause, Play } from '@deemlol/next-icons'
import type p5 from 'p5'
import { useCallback, useEffect, useRef, useState } from 'react'
import P5Canvas from './P5Canvas'
import visualizerSketch from './visualizerSketch'
export default function MusicSection({
  song,
  isActive,
  onPlay,
}: {
  song: Song
  isActive?: boolean
  onPlay?: () => void
}) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  // AudioContext + source node: guarded by ref so createMediaElementSource is
  // only ever called once per audio element. React Strict Mode runs effects twice
  // in dev (mount → cleanup → remount); without the guard the remount crashes
  // with InvalidStateError because the element is permanently "tainted" after the
  // first createMediaElementSource call, even once the context is closed.
  useEffect(() => {
    if (audioContextRef.current) return

    const audio = audioRef.current!
    const context = new AudioContext()
    audioContextRef.current = context

    const source = context.createMediaElementSource(audio)
    const analyser = context.createAnalyser()
    analyser.fftSize = 512
    source.connect(analyser)
    analyser.connect(context.destination)
    analyserRef.current = analyser
  }, [])

  // Sync isPlaying with native audio events (separate effect so listeners are
  // properly added/removed independent of the AudioContext guard above)
  useEffect(() => {
    const audio = audioRef.current!
    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)
    return () => {
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
    }
  }, [])

  // Pause when another track becomes active
  useEffect(() => {
    if (isActive === false) {
      audioRef.current?.pause()
    }
  }, [isActive])

  const toggle = async () => {
    const audio = audioRef.current!
    const context = audioContextRef.current

    if (!context) return

    // Resume context if suspended (browser autoplay policy)
    if (context.state === 'suspended') {
      await context.resume()
    }

    if (audio.paused) {
      onPlay?.()
      await audio.play()
    } else {
      audio.pause()
    }
  }

  const sketch = useCallback((p: p5) => visualizerSketch(p, analyserRef), [])
  const src = song.audioFiles[0]
  const img = song.images[0]
  return (
    <div className='h-full w-full relative'>
      <div className='flex absolute bottom-0 xl:bottom-10 xl:right-10 w-full xl:w-150 h-25 bg-white'>
        <button
          onClick={toggle}
          className='relative w-25 h-full grid place-items-center overflow-hidden'
        >
          {/* Background layer */}
          <div
            className='absolute inset-0 bg-cover bg-center'
            style={{ backgroundImage: `url(${img})`, opacity: 0.5 }}
          />

          {/* Optional dark overlay for better contrast */}
          <div className='absolute inset-0 bg-black/30' />

          {/* Foreground content */}
          <div className='relative z-10'>
            {isPlaying ? (
              <Pause size={36} color='#FFFFFF' />
            ) : (
              <Play size={36} color='#FFFFFF' />
            )}
          </div>
        </button>
        <div className='relative py-2 px-4 self-center'>
          <h1 className='font-black text-3xl'>{song.name}</h1>
          <h2 className='italic'>{song.description}</h2>
        </div>
      </div>

      <audio ref={audioRef} src={src} />

      <P5Canvas sketch={sketch} />
    </div>
  )
}
