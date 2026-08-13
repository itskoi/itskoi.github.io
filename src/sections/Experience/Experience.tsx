import { useLayoutEffect } from 'react'
import { experience } from '@/data/portfolio'
import { useScrollReveal } from '@/hooks/useScrollReveal'
import { useTimelineFill } from '@/hooks/useTimelineFill'
import styles from './Experience.module.css'

const MOBILE_QUERY = '(max-width: 640px)'
// Min vertical gap between same-side entries (i and i-2) so their text never overlaps.
const SAME_SIDE_GAP = 24

export function Experience() {
  const entriesRef = useScrollReveal<HTMLDivElement>()
  const fillRef = useTimelineFill<HTMLDivElement>()

  // Pull each entry up toward the previous entry's midpoint (a denser zigzag), clamped
  // so two entries on the same side of the spine can't overlap. Opposite-side entries
  // overlap freely since their text sits in different halves.
  // biome-ignore lint/correctness/useExhaustiveDependencies: entriesRef is a stable ref; .current is read once on mount and re-measured via ResizeObserver, not by re-running the effect
  useLayoutEffect(() => {
    const root = entriesRef.current
    if (!root) return
    const entries = Array.from(root.children) as HTMLElement[]

    const apply = () => {
      const mobile = window.matchMedia(MOBILE_QUERY).matches
      const heights = entries.map((entry) => entry.offsetHeight)
      const tops: number[] = [0]
      entries[0].style.marginTop = ''
      for (let i = 1; i < entries.length; i++) {
        const desired = tops[i - 1] + heights[i - 1] / 2
        const floor = i >= 2 ? tops[i - 2] + heights[i - 2] + SAME_SIDE_GAP : 0
        tops[i] = Math.max(desired, floor)
        entries[i].style.marginTop = mobile ? '' : `${tops[i] - tops[i - 1] - heights[i - 1]}px`
      }
    }

    apply()
    window.addEventListener('resize', apply)
    if (typeof ResizeObserver === 'undefined')
      return () => window.removeEventListener('resize', apply)
    const ro = new ResizeObserver(apply)
    for (const entry of entries) ro.observe(entry)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', apply)
    }
  }, [])

  return (
    <section id="experience" aria-labelledby="experience-heading" className={styles.section}>
      <h2 id="experience-heading" className={styles.heading}>
        Experience
      </h2>
      <div className={styles.timeline}>
        <div className={styles.spine} aria-hidden="true" />
        <div className={styles.spineFill} ref={fillRef} aria-hidden="true" />
        <div ref={entriesRef} className={styles.entries}>
          {experience.map((item) => (
            <article key={item.company} className={styles.entry} data-reveal>
              <span className={styles.marker} aria-hidden="true" />
              <p className={styles.period}>{item.period}</p>
              <header className={styles.entryHeader}>
                <h3 className={styles.role}>{item.role}</h3>
                <p className={styles.company}>
                  {item.href ? (
                    <a href={item.href} target="_blank" rel="noreferrer noopener">
                      {item.company}
                    </a>
                  ) : (
                    item.company
                  )}
                </p>
              </header>
              <ul className={styles.highlights}>
                {item.highlights.map((highlight) => (
                  <li key={highlight}>{highlight}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
