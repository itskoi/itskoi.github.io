import { experience } from '@/data/portfolio'
import { useSectionActive } from '@/hooks/useSectionActive'
import styles from './Experience.module.css'

export function Experience() {
  const active = useSectionActive('experience')
  return (
    <section
      id="experience"
      aria-labelledby="experience-heading"
      className={`${styles.section} section-grid`}
    >
      <h2 id="experience-heading" className={styles.heading} data-active={active}>
        Experience
      </h2>
      <div className={styles.entries}>
        {experience.map((item) => (
          <article key={item.company} className={styles.entry}>
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
    </section>
  )
}
