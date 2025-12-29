'use client'

import { motion } from 'framer-motion'

export default function MotionTitle() {
  return (
    <motion.h1
      className='absolute top-4 left-4 z-10 text-4xl sm:text-4xl lg:text-4xl font-mono text-neutral-700 opacity-70'
      initial={{ x: 48, opacity: 0 }} // start slightly to the right
      animate={{ x: 0, opacity: 1 }} // move into place + fade in
      transition={{ delay: 1, duration: 1.5, ease: 'easeOut' }}
    >
      DELESSLIN
    </motion.h1>
  )
}
