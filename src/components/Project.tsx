'use client'
import Image from 'next/image'
import { useState } from 'react'
import { Project as ProjectType } from '../lib/projects'

const Project = ({ p, color }: { p: ProjectType; color: string }) => {
  return (
    <article
      key={p.slug}
      className={`border-l-16 px-4 pb-12 lg:pb-0 lg:mb-8 flex min-h-[90vh] flex-col gap-6 lg:flex-row lg:gap-5`}
      style={{ borderColor: color }}
    >
      <div className='w-full h-full min-w-0 lg:flex-none lg:w-[700px] lg:max-w-[700px]'>
        <Images images={p.images} alt={p.title} />
      </div>
      <div className='flex w-full min-w-0 flex-col gap-7'>
        <Information
          title={p.title}
          location={p.location}
          dates={p.dates}
          description={p.description}
        />
        <div
          className='flex flex-col gap-2.5'
          dangerouslySetInnerHTML={{ __html: p.contentHtml }}
        />
      </div>

      {p.audio &&
        p.audio.length > 0 &&
        p.audio.map((aud) => (
          <audio controls key={aud}>
            <source src={aud} />
          </audio>
        ))}
    </article>
  )
}

const Information = ({
  title,
  dates,
  location,
  description,
}: {
  title: string
  location: string | undefined
  dates: string
  description: string | undefined
}) => {
  return (
    <div className='flex flex-col justify-between gap-1'>
      <div className='flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between'>
        <h2 className='text-2xl font-bold'>{title}</h2>
        <p className='text-base text-neutral-700'>
          {dates}
          {location ? ` • ${location}` : ''}
        </p>
      </div>

      {description && (
        <p className='text-sm italic text-neutral-700'>{description}</p>
      )}
    </div>
  )
}

const Images = ({
  images,
  alt = '',
}: {
  images: string[] | undefined
  alt?: string
}) => {
  const [active, setActive] = useState(0)

  return (
    <div className='flex h-[30vh] w-full gap-3 lg:h-[90vh]'>
      {images &&
        images.length > 0 &&
        images.map((img, i) => {
          const isActive = i === active
          return (
            <button
              key={img}
              onClick={() => setActive(i)}
              className='relative block h-full min-w-[20px] flex-[1_1_0] cursor-pointer overflow-hidden border-0 transition-[flex-grow] duration-300 ease-in-out'
              style={{ flexGrow: isActive ? 10 : 1 }}
            >
              <Image
                src={img}
                alt={alt}
                fill
                sizes='(min-width: 1024px) 700px, 100vw'
                priority={isActive} // preload active
                fetchPriority={isActive ? 'high' : 'auto'} // helps in modern browsers
                className='object-cover object-center'
              />
            </button>
          )
        })}
    </div>
  )
}

export default Project
