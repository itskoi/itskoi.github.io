import type { MouseEvent } from 'react'
import { ThemeToggle } from '@/components/ThemeToggle/ThemeToggle'
import { useActiveId } from '@/hooks/useSectionActive'
import { scrollTo } from '@/lib/lenis'
import styles from './Nav.module.css'

const NAV_ITEMS = [
  { id: 'experience', label: 'Experience' },
  { id: 'education', label: 'Education' },
  { id: 'publications', label: 'Publications' },
  { id: 'technologies', label: 'Technologies' },
] as const

const NAV_IDS = NAV_ITEMS.map((item) => item.id)

export function Nav() {
  const activeId = useActiveId(NAV_IDS)

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
      {/* Fixed in the corner, not in the bar; it lives here because Nav knows when you're past the hero. */}
      {activeId && (
        <button
          type="button"
          className={styles.top}
          onClick={() => scrollTo(0)}
          aria-label="Back to top"
          title="Back to top"
        >
          <svg
            viewBox="0 0 16 16"
            width="16"
            height="16"
            aria-hidden="true"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M8 13V3M3.5 7.5L8 3l4.5 4.5" />
          </svg>
        </button>
      )}
      <ThemeToggle />
    </nav>
  )
}
