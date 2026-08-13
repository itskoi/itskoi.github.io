import type { MouseEvent } from 'react'
import { useEffect, useState } from 'react'
import { ThemeToggle } from '@/components/ThemeToggle/ThemeToggle'
import { scrollTo } from '@/lib/lenis'
import styles from './Nav.module.css'

const NAV_ITEMS = [
  { id: 'experience', label: 'Experience' },
  { id: 'education', label: 'Education' },
  { id: 'publications', label: 'Publications' },
  { id: 'technologies', label: 'Technologies' },
] as const

export function Nav() {
  const [activeId, setActiveId] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return
    const sections = NAV_ITEMS.map((item) => document.getElementById(item.id)).filter(
      (el): el is HTMLElement => el !== null,
    )
    if (sections.length === 0) return

    // Thin band around the vertical middle: the section crossing it is "active".
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveId(entry.target.id)
        }
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 },
    )
    for (const section of sections) observer.observe(section)
    return () => observer.disconnect()
  }, [])

  const handleClick = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    event.preventDefault()
    scrollTo(`#${id}`)
  }

  return (
    <nav aria-label="Sections" className={styles.nav}>
      <ul className={styles.list}>
        {NAV_ITEMS.map((item) => {
          const active = item.id === activeId
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className={active ? `${styles.link} ${styles.active}` : styles.link}
                aria-current={active ? 'location' : undefined}
                onClick={(event) => handleClick(event, item.id)}
              >
                {item.label}
              </a>
            </li>
          )
        })}
      </ul>
      <ThemeToggle />
    </nav>
  )
}
