import { publications } from '@/data/portfolio'
import { useScrollReveal } from '@/hooks/useScrollReveal'
import styles from './Publications.module.css'

export function Publications() {
  const ref = useScrollReveal<HTMLDivElement>()
  return (
    <section
      id="publications"
      aria-labelledby="publications-heading"
      className={`${styles.section} section-grid`}
    >
      <h2 id="publications-heading" className={styles.heading}>
        Publications
      </h2>
      <div ref={ref} className={styles.entries}>
        {publications.map((pub) => (
          <article key={pub.doi.label} className={styles.entry} data-reveal>
            <p className={styles.period}>{pub.period}</p>
            <div className={styles.paper}>
              <h3 className={styles.title}>{pub.title}</h3>
              <p className={styles.authors}>
                {pub.authors.map((author, index) => (
                  <span key={author}>
                    <span
                      data-owner={author === pub.owner ? '' : undefined}
                      className={author === pub.owner ? styles.owner : undefined}
                    >
                      {author}
                    </span>
                    {index < pub.authors.length - 1 ? ', ' : ''}
                  </span>
                ))}
              </p>
            </div>
            <div className={styles.facts}>
              <p className={styles.venue}>{pub.venue}</p>
              <p className={styles.doi}>
                DOI:{' '}
                <a href={pub.doi.href} target="_blank" rel="noreferrer noopener">
                  {pub.doi.label}
                </a>
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
