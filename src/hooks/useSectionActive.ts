import { useEffect, useState } from 'react'

/** Thin band around the vertical middle: the section crossing it is "active".
    Shared with the nav so the red index bar and the red heading always agree. */
export const ACTIVE_BAND = '-45% 0px -50% 0px'

export function useSectionActive(id: string): boolean {
  const [active, setActive] = useState(false)

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return
    const section = document.getElementById(id)
    if (!section) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) setActive(entry.isIntersecting)
      },
      { rootMargin: ACTIVE_BAND, threshold: 0 },
    )
    observer.observe(section)
    return () => observer.disconnect()
  }, [id])

  return active
}
