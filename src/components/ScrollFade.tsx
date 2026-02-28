'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { ReactNode, useEffect } from 'react'

export default function ScrollFade({ children }: { children: ReactNode }) {
  const { scrollY } = useScroll()
  useEffect(() => {
    console.log('setup scroll')
    return scrollY.on('change', (v) => {
      console.log('scrollY:', v)
    })
  }, [scrollY])
  // Fade out over first 300px
  const opacity = useTransform(scrollY, [0, 100], [1, 0])
  const y = useTransform(scrollY, [0, 100], [0, -30])

  return <motion.div style={{ opacity, y }}>{children}</motion.div>
}
