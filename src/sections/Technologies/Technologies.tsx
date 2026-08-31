import { technologies } from '@/data/portfolio'
import styles from './Technologies.module.css'

export function Technologies() {
  return (
    <section
      id="technologies"
      aria-labelledby="technologies-heading"
      className={`${styles.section} section-grid`}
    >
      <h2 id="technologies-heading" className={styles.heading}>
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
