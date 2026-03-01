import MotionTitle from '@/components/MotionTitle'
import MusicPlayer from '@/components/MusicPlayer'
import { getSongBySlug } from '@/lib/songs'
import { notFound } from 'next/navigation'
type Props = {
  params: Promise<{ slug: string }>
}

export default async function Song({ params }: Props) {
  const { slug } = await params
  const song = await getSongBySlug(slug)

  if (!song) {
    notFound()
  }

  return (
    <main>
      <MotionTitle />
      <MusicPlayer song={song} />
    </main>
  )
}
