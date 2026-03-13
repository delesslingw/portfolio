'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'

const NAV_LINKS = [
  { href: '/cv', label: 'CV' },
  { href: '/links', label: 'Links' },
  { href: '/music', label: 'Music' },
]

const NavLink = ({ href, label, onClick }: { href: string; label: string; onClick?: () => void }) => (
  <Link
    href={href}
    onClick={onClick}
    className='border-l-4 border-neutral-400 pl-1 inline-flex items-center hover:border-neutral-600 hover:[&>span]:bg-neutral-600 transition-colors'
  >
    <span className='bg-neutral-400 px-2 py-0.5 text-sm text-white transition-colors'>
      {label}
    </span>
  </Link>
)

export function NavButtons() {
  return (
    <div className='absolute bottom-8 right-8 flex gap-4'>
      {NAV_LINKS.map(({ href, label }) => (
        <NavLink key={href} href={href} label={label} />
      ))}
    </div>
  )
}

export function HamburgerNav() {
  const [visible, setVisible] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const hero = document.getElementById('hero')
    if (!hero) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(!entry.isIntersecting)
        if (entry.isIntersecting) setOpen(false)
      },
      { threshold: 0 }
    )
    observer.observe(hero)
    return () => observer.disconnect()
  }, [])

  if (!visible) return null

  return (
    <div className='fixed top-6 right-8 z-50'>
      <button
        onClick={() => setOpen((o) => !o)}
        className='p-2 bg-white rounded-full text-neutral-700 hover:text-neutral-900 transition-colors'
        aria-label={open ? 'Close menu' : 'Open menu'}
      >
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>
      {open && (
        <div className='absolute right-0 top-9 flex flex-col gap-1 border border-neutral-200 bg-white/90 backdrop-blur-sm px-4 py-3'>
          {NAV_LINKS.map(({ href, label }) => (
            <NavLink key={href} href={href} label={label} onClick={() => setOpen(false)} />
          ))}
        </div>
      )}
    </div>
  )
}
