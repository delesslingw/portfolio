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
    <div>
      <h1>Debug View</h1>

      {Object.entries(song).map(([key, value]) => {
        return (
          <div key={key} style={{ marginBottom: '2rem' }}>
            <h3>{key}</h3>

            {renderValue(key, value)}
          </div>
        )
      })}
    </div>
  )
}

function renderValue(key: string, value: unknown) {
  if (value == null) {
    return <p>null</p>
  }

  if (key === 'contentHtml' && typeof value === 'string') {
    return <div dangerouslySetInnerHTML={{ __html: value }} />
  }

  if (Array.isArray(value)) {
    return (
      <ul>
        {value.map((item, i) => (
          <li key={i}>
            {typeof item === 'object'
              ? JSON.stringify(item, null, 2)
              : String(item)}
          </li>
        ))}
      </ul>
    )
  }

  if (typeof value === 'object') {
    return <pre>{JSON.stringify(value, null, 2)}</pre>
  }

  return <p>{String(value)}</p>
}
