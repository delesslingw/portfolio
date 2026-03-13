'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

export default function MotionTitle() {
  return (
    <motion.h1
      className='absolute top-4 left-4 text-4xl sm:text-4xl lg:text-4xl font-mono text-neutral-700 opacity-70 z-99'
      initial={{ x: 48, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 1, duration: 1.5, ease: 'easeOut' }}
    >
      <Link href='/'>DELESSLIN</Link>
    </motion.h1>
  )
}
