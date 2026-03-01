'use client'

import p5 from 'p5'
import { useEffect, useRef } from 'react'

type Sketch = (p: p5) => void
export default function P5Canvas({ sketch }: { sketch: Sketch }) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const p5Ref = useRef<p5>(null)

  useEffect(() => {
    import('p5').then((p5Module) => {
      const p5 = p5Module.default

      if (canvasRef.current) {
        p5Ref.current = new p5(sketch, canvasRef.current)
      }
    })

    return () => {
      p5Ref.current?.remove() // Clean up
    }
  }, [sketch])

  return <div ref={canvasRef} className='w-full h-full' />
}
