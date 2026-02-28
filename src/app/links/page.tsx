import MotionTitle from '@/components/MotionTitle'
import P5Canvas from '@/components/P5Canvas'
import { getAllLinks, LinkRecord } from '@/lib/linkStore'
import colors from '../../lib/colors'

const Link = ({ color, link }: { color: string; link: LinkRecord }) => {
  return (
    <a href={link.url} key={link.slug}>
      <li
        className='h-28 mb-4 flex w-full border-l-16 pl-4'
        style={{ borderColor: color }}
      >
        <div
          style={{ backgroundColor: color }}
          className='w-full flex flex-col pt-2 pl-4'
        >
          <h2 className='text-2xl font-black pb-2'>{link.title}</h2>

          <h3>{link.description && <p>{link.description}</p>}</h3>
        </div>
      </li>
    </a>
  )
}
export default async function LinksPage() {
  const links = await getAllLinks()

  const publicLinks = links
    .filter((l) => l.public)
    .sort((a, b) => a.slug.localeCompare(b.slug))

  return (
    <main className='pt-16 relative'>
      <MotionTitle />

      <div className='absolute inset-0'>
        <P5Canvas />
      </div>
      <section className='flex flex-col justify-center lg:px-72 pt-32 bg-white'>
        <div className='py-12'>
          <h1 className='text-center text-7xl font-black'>Links</h1>
          <h2 className='italic text-center'>look at all my things</h2>

          <ul className='mt-12'>
            {publicLinks.map((link, i) => (
              <Link key={link.slug} color={colors[i]} link={link} />
            ))}
          </ul>
        </div>
      </section>
    </main>
  )
}
