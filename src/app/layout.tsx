import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'DeLesslin George-Warren',
  description: 'Code, art, and advocacy by DeLesslin',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='en' className='h-full overflow-hidden overscroll-none'>
      <head>
        <link rel='icon' href='/images/favicon.ico' sizes='any' />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full overflow-hidden`}
      >
        {/* single scroll surface */}
        <div className='h-full overflow-y-auto overscroll-none [-webkit-overflow-scrolling:touch]'>
          {children}
        </div>
      </body>
    </html>
  )
}
