import { BinaryStarScene } from '@/components/BinaryStarScene/BinaryStarScene'
import { BlackHoleScene } from '@/components/BlackHoleScene/BlackHoleScene'
import { Nav } from '@/components/Nav/Nav'
import { useSmoothScroll } from '@/hooks/useSmoothScroll'
import { useTheme } from '@/hooks/useTheme'
import { Education } from '@/sections/Education/Education'
import { Experience } from '@/sections/Experience/Experience'
import { Hero } from '@/sections/Hero/Hero'
import { Publications } from '@/sections/Publications/Publications'
import { Technologies } from '@/sections/Technologies/Technologies'

export function App() {
  useSmoothScroll()
  const { theme } = useTheme()
  return (
    <>
      {theme === 'dark' ? <BlackHoleScene /> : <BinaryStarScene />}
      <Nav />
      <main>
        <Hero />
        <Experience />
        <Education />
        <Publications />
        <Technologies />
      </main>
    </>
  )
}
