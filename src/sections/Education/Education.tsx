import { education } from '@/data/portfolio'
import { useSectionActive } from '@/hooks/useSectionActive'
import styles from './Education.module.css'

export function Education() {
  const active = useSectionActive('education')
  return (
    <section
      id="education"
      aria-labelledby="education-heading"
      className={`${styles.section} section-grid`}
    >
      <h2 id="education-heading" className={styles.heading} data-active={active}>
        Education
      </h2>
      <div className={styles.content}>
        <article className={styles.row}>
          <p className={styles.period}>{education.period}</p>
          <div className={styles.schoolBlock}>
            <h3 className={styles.school}>{education.school}</h3>
            <p className={styles.degreeTitle}>{education.degree}</p>
            <p className={styles.gpa}>
              GPA: {education.gpa.primary} ({education.gpa.secondary})
            </p>
          </div>
          <div className={styles.block}>
            <h4 className={styles.subheading}>Awards</h4>
            <ul className={styles.list}>
              {education.awards.map((award) => (
                <li key={award.title}>
                  {award.title} <span className={styles.muted}>({award.period})</span>
                </li>
              ))}
            </ul>
          </div>
        </article>

        <div className={styles.row}>
          <h4 className={styles.rowLabel}>Certifications</h4>
          <ul className={styles.certList}>
            {education.certifications.map((cert) => (
              <li key={cert.title}>
                {cert.href ? (
                  <a href={cert.href} target="_blank" rel="noreferrer noopener">
                    {cert.title}
                  </a>
                ) : (
                  cert.title
                )}{' '}
                <span className={styles.muted}>
                  — {cert.issuer} ({cert.period})
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
