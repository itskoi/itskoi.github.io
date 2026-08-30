import { FlowScene } from '@/components/FlowScene/FlowScene'
import { Nav } from '@/components/Nav/Nav'
import { useSmoothScroll } from '@/hooks/useSmoothScroll'
import { Education } from '@/sections/Education/Education'
import { Experience } from '@/sections/Experience/Experience'
import { Hero } from '@/sections/Hero/Hero'
import { Publications } from '@/sections/Publications/Publications'
import { Technologies } from '@/sections/Technologies/Technologies'

export function App() {
  useSmoothScroll()
  return (
    <>
      <FlowScene />
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
