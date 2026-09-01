import { technologies } from '@/data/portfolio'
import { useSectionActive } from '@/hooks/useSectionActive'
import styles from './Technologies.module.css'

export function Technologies() {
  const active = useSectionActive('technologies')
  return (
    <section
      id="technologies"
      aria-labelledby="technologies-heading"
      className={`${styles.section} section-grid`}
    >
      <h2 id="technologies-heading" className={styles.heading} data-active={active}>
        Technologies
      </h2>
      <div className={styles.groups}>
        {technologies.map((group) => (
          <div key={group.category} className={styles.group}>
            <h3 className={styles.category}>{group.category}</h3>
            <ul className={styles.tools}>
              {group.tools.map((tool) => (
                <li key={tool} className={styles.tool}>
                  {tool}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}
