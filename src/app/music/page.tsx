// SPEC: /music page
//
// HERO
// ----
// - Full-viewport-height <header> with a BoidCanvas as an absolute -z-10 background
//   (same as homepage).
// - Title: refactor MotionTitle to accept an optional `suffix` prop (e.g. "/ Music").
//   "DELESSLIN" slides in first (existing animation), then the suffix fades/slides in
//   with a stagger after. Both are part of the same fixed top-left element.
//   This suffix pattern must be reusable for other sub-paths (e.g. "/ Links", "/ CV").
//   Homepage passes no suffix — behaviour unchanged.
// - NAV: Visible in the upper-right corner while the hero is in view, then transitions
//   to the HamburgerNav (same scroll-trigger behaviour as homepage via IntersectionObserver
//   on the hero element). On desktop: inline NavLinks. On mobile: hamburger from the start.
//   Exclude the current page ("Music") from the nav link list — pass an `exclude` prop
//   or derive from the current pathname.
//
// SONG LIST
// ---------
// - Below the hero, a <main> listing songs as simple cards (MusicList.tsx).
//   No visualizer, no p5, no per-track AudioContext.
// - Each card has three zones:
//     • Play button (left, square) — album art thumbnail bg, play/pause icon.
//     • Song info (center, flex-1) — name + description, both link to /music/[slug].
//     • Arrow (right, full card height) — ChevronRight, links to /music/[slug].
// - A single shared <audio> element in MusicList drives playback; src swaps when
//   activeSlug changes. One track plays at a time.
// - If no songs exist, render a graceful empty state.

import BoidCanvas from '@/components/BoidCanvas'
import Contact from '@/components/Contact'
import MotionTitle from '@/components/MotionTitle'
import { PageNav } from '@/components/Nav'
import { getAllSongs } from '@/lib/songs'
import MusicList from './MusicList'

export default async function Music() {
  const songs = await getAllSongs()

  return (
    <>
      <header
        id='hero'
        className='relative overflow-hidden grid items-center justify-items-center h-[60vh] p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]'
      >
        <MotionTitle suffix='/ Music' />
        <div className='absolute inset-0 -z-10'>
          <BoidCanvas />
        </div>
      </header>
      <PageNav exclude='Music' />
      <main>
        {songs.length === 0 ? (
          <p className='p-8 text-neutral-500'>No songs yet.</p>
        ) : (
          <MusicList songs={songs} />
        )}
        <Contact />
      </main>
    </>
  )
}
