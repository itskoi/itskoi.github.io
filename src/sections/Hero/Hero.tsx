import { profile } from '@/data/portfolio'
import styles from './Hero.module.css'

export function Hero() {
  return (
    <section className={`${styles.hero} section-grid`} aria-label="Introduction">
      <div className={styles.poster}>
        <h1 className={styles.name}>{profile.name}</h1>
        <p className={styles.role}>{profile.role}</p>
        <p className={styles.meta}>
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
