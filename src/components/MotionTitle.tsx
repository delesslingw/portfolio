'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

export default function MotionTitle({ suffix }: { suffix?: string }) {
  return (
    <div className='absolute top-4 left-4 z-[99] flex items-baseline gap-2'>
      <motion.h1
        className='text-4xl font-mono text-neutral-700'
        initial={{ x: 48, opacity: 0 }}
        animate={{ x: 0, opacity: 0.7 }}
        transition={{ delay: 1, duration: 1.5, ease: 'easeOut' }}
      >
        <Link href='/'>DELESSLIN</Link>
      </motion.h1>
      {suffix && (
        <motion.span
          className='text-2xl font-mono text-neutral-500'
          initial={{ x: 16, opacity: 0 }}
          animate={{ x: 0, opacity: 0.6 }}
          transition={{ delay: 2.2, duration: 1, ease: 'easeOut' }}
        >
          {suffix}
        </motion.span>
      )}
    </div>
  )
}
