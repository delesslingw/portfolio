import BoidCanvas from '@/components/BoidCanvas'
import Contact from '@/components/Contact'
import MotionTitle from '@/components/MotionTitle'
import Projects from '../components/Projects'
export const revalidate = false // SSG at build; set to a number for ISR

export default function Home() {
  return (
    <>
      <header className='relative overflow-hidden grid items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]'>
        <MotionTitle />
        <div className='absolute inset-0 -z-10'>
          <BoidCanvas />
        </div>
      </header>
      <main>
        <Projects />
        <Contact />
      </main>
    </>
  )
}
