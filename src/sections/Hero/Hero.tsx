import { ParticleText } from '@/components/ParticleText/ParticleText'
import { profile } from '@/data/portfolio'
import styles from './Hero.module.css'

export function Hero() {
  return (
    <section className={`${styles.hero} section-grid`} aria-label="Introduction">
      <div className={styles.poster}>
        <h1 className={styles.name}>
          {/* React Bits "vortex" preset look (minus its spiral intro), with the demo link's overrides. */}
          <ParticleText
            className={styles.particles}
            text={profile.name}
            fontSize="1em"
            fontWeight={650}
            intro="none"
            highlightColor="var(--color-accent)"
            gatherDuration={2600}
            stagger={650}
            scatter={180}
            burstStrength={1.7}
            pointerRepel={60}
            repelRadius={150}
            idleDrift={1.3}
            particleSize={2.2}
            density={2}
            glow={false}
          />
        </h1>
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
