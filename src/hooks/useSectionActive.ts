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

/** The id that last crossed the band, kept while the band sits in a gap between elements.
    Undefined above the first element, where the band has not reached any of them. */
export function useActiveId(ids: readonly string[]): string | undefined {
  const [activeId, setActiveId] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null)
    if (elements.length === 0) return

    // Elements on the band, oldest entry first; the active id is the latest to enter.
    const onBand = new Set<Element>()
    let current: string | undefined
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          onBand.delete(entry.target)
          if (entry.isIntersecting) {
            onBand.add(entry.target)
            current = entry.target.id
          }
        }
        // The active element left while another stays on the band: that one never "enters"
        // again, so hand over to it rather than keep an element that is gone.
        const remaining = [...onBand]
        if (remaining.length > 0 && !remaining.some((el) => el.id === current)) {
          current = remaining[remaining.length - 1].id
        }
        // Half the viewport is the band's lower edge (ACTIVE_BAND's -50%).
        if (elements[0].getBoundingClientRect().top > window.innerHeight / 2) {
          current = undefined
        }
        setActiveId(current)
      },
      { rootMargin: ACTIVE_BAND, threshold: 0 },
    )
    for (const element of elements) observer.observe(element)
    return () => observer.disconnect()
  }, [ids])

  return activeId
}
