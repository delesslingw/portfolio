import MotionTitle from '@/components/MotionTitle'
import MusicPlayer from '@/components/MusicPlayer'
import colors from '@/lib/colors'
import { getSongBySlug } from '@/lib/songs'
import Image from 'next/image'
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
  console.log(song.streamingLinks)
  const bandcamp = song.streamingLinks.filter(
    (link) => link.label.toLowerCase() === 'bandcamp',
  )[0]
  console.log(bandcamp)
  return (
    <main>
      <MotionTitle />
      <MusicPlayer song={song} />
      <section className='flex' style={{ backgroundColor: colors[2] }}>
        <Image
          src={song.images[0]}
          height='500'
          width='500'
          alt='Fake it album art feature a psychedelic pug'
        />
        <div className='flex-1 grid place-items-center'>
          <div>
            <h1 className='italic text-6xl'>Want to support my music?</h1>
            <h2>The best way is to buy this track on BandCamp!</h2>
            <button className='h-18 w-full bg-amber-500 flex border-l-4 border-amber-500'>
              <div className=' flex-1 '>
                <h3 className='flex-1'>Buy this track on BandCamp</h3>
              </div>
            </button>
          </div>
        </div>
      </section>
    </main>
  )
}
