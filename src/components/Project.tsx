'use client'
import Image from 'next/image'
import { useState } from 'react'
import { Project as ProjectType } from '../lib/projects'

const Project = ({ p }: { p: ProjectType }) => {
  return (
    <article key={p.slug}>
      <h2>{p.title}</h2>
      <p>
        {p.dates}
        {p.location ? ` • ${p.location}` : ''}
      </p>

      {p.description && <p>{p.description}</p>}
      <div style={{ maxWidth: 500, margin: '0 auto' }}>
        <Images images={p.images} alt={p.title} />
      </div>

      {/* Markdown body */}
      <div dangerouslySetInnerHTML={{ __html: p.contentHtml }} />

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

const Images = ({
  images,
  alt = '',
}: {
  images: string[] | undefined
  alt?: string
}) => {
  const [active, setActive] = useState(0)
  return (
    <div style={{ display: 'flex', gap: 12, height: 360, width: '100%' }}>
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
                cursor: 'pointer',
                flexGrow: isActive ? 8 : 1,
                transition: 'flex-grow 350ms ease',
                position: 'relative',
                overflow: 'hidden',
                borderRadius: 1,
                height: '100%',
                minWidth: 40,
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
