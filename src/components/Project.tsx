'use client'
import Image from 'next/image'
import { useState } from 'react'
import { Project as ProjectType } from '../lib/projects'

const Project = ({ p }: { p: ProjectType }) => {
  return (
    <article
      className='project'
      key={p.slug}
      style={{
        display: 'flex',
        flexDirection: 'row',
        gap: 20,
        minHeight: 500,
        paddingTop: 20,
        paddingBottom: 20,
      }}
    >
      <div style={{ flex: '0 0 700px', maxWidth: 700 }}>
        <Images images={p.images} alt={p.title} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 30 }}>
        <Information
          title={p.title}
          location={p.location}
          dates={p.dates}
          description={p.description}
        />
        <div
          style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
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

      <hr />
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
    <div
      className='information'
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <div
        className='title'
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
      >
        <h2 style={{ fontSize: 24, fontWeight: 'bold' }}>{title}</h2>
        <p style={{ fontSize: 16, color: '#333' }}>
          {dates}
          {location ? ` • ${location}` : ''}
        </p>
      </div>

      {description && (
        <p style={{ fontSize: 14, fontStyle: 'italic' }}>{description}</p>
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
    <div style={{ display: 'flex', gap: 12, height: 700, width: '100%' }}>
      {images &&
        images.length > 0 &&
        images.map((img, i) => {
          const isActive = i === active
          return (
            <button
              key={img}
              onClick={() => setActive(i)}
              style={{
                all: 'unset',
                display: 'block',
                cursor: 'pointer',
                flexGrow: isActive ? 10 : 1,
                transition: 'flex-grow 350ms ease',
                position: 'relative',
                overflow: 'hidden',
                borderRadius: 1,
                height: '100%',
                minWidth: 20,
                flexBasis: 0,
              }}
            >
              <Image
                src={img}
                alt={alt}
                fill
                sizes={isActive ? '70vw' : '5vw'}
                style={{ objectFit: 'cover', objectPosition: 'center' }}
              />
            </button>
          )
          //   return (
          //     <div key={img} style={{ flex: i === 0 ? 1 : 0.1 }}>
          //       <Image src={img} alt={alt} width={1200} height={700} />
          //     </div>
          //   )
        })}
    </div>
  )
}

export default Project
