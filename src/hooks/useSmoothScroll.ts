import { useEffect } from 'react'
import { createSmoothScroll } from '@/lib/lenis'

export function useSmoothScroll(): void {
  useEffect(() => {
    const smooth = createSmoothScroll()
    return () => {
      smooth.destroy()
    }
  }, [])
}
