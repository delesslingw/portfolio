'use client'

const Section = ({
  children,
  color = '#222',
}: {
  children?: React.ReactNode
  color?: string
}) => {
  return (
    <article
      className='border-l-16 min-h-[500] px-4 pb-12 flex justify-stretch align-stretch'
      style={{ borderColor: color }}
    >
      {children}
    </article>
  )
}

export default Section
