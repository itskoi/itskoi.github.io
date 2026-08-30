import { profile } from '@/data/portfolio'
import { useHeroIntro } from '@/hooks/useHeroIntro'
import styles from './Hero.module.css'

export function Hero() {
  const introRef = useHeroIntro<HTMLElement>()

  return (
    <section ref={introRef} className={`${styles.hero} section-grid`} aria-label="Introduction">
      <div className={styles.poster}>
        <h1 className={styles.name} data-intro>
          {profile.name}
        </h1>
        <p className={styles.role} data-intro>
          {profile.role}
        </p>
        <p className={styles.meta} data-intro>
          <span className={styles.metaItem}>{profile.location}</span>
          <a
            className={styles.metaLink}
            href={profile.linkedin.href}
            target="_blank"
            rel="noreferrer noopener"
          >
            {profile.linkedin.label}
          </a>
          <a className={styles.metaLink} href={profile.email.href}>
            {profile.email.label}
          </a>
        </p>
      </div>
    </section>
  )
}
