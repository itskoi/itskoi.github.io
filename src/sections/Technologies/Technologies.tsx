import { technologies } from '@/data/portfolio'
import { useScrollReveal } from '@/hooks/useScrollReveal'
import styles from './Technologies.module.css'

export function Technologies() {
  const ref = useScrollReveal<HTMLDivElement>()
  return (
    <section id="technologies" aria-labelledby="technologies-heading" className={styles.section}>
      <h2 id="technologies-heading" className={styles.heading}>
        Technologies
      </h2>
      <div ref={ref} className={styles.groups}>
        {technologies.map((group) => (
          <div key={group.category} className={styles.group} data-reveal>
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
