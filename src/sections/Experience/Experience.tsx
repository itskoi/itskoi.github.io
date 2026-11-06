import type { MouseEvent } from 'react'
import { ProjectScene } from '@/components/ProjectScene/ProjectScene'
import { experience } from '@/data/portfolio'
import { useActiveId, useSectionActive } from '@/hooks/useSectionActive'
import { scrollTo } from '@/lib/lenis'
import styles from './Experience.module.css'

const PROJECT_IDS = experience.flatMap((item) => item.projects.map((project) => project.id))

// Lands a project's title just above the band's middle (ACTIVE_BAND spans 45–50%), so it becomes
// active. An absolute position from the real scrollY, because Lenis may not have seen a native jump yet.
const scrollToProject = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
  event.preventDefault()
  const top = document.getElementById(id)?.getBoundingClientRect().top ?? 0
  scrollTo(top + window.scrollY + 24 - window.innerHeight * 0.475)
}

const emphasize = (text: string) =>
  text.split('**').map((part, index) => (index % 2 ? <strong key={part}>{part}</strong> : part))

export function Experience() {
  const active = useSectionActive('experience')
  // The stage is in view from the section's top, so it shouldn't wait for the first project.
  const activeProject = useActiveId(PROJECT_IDS) ?? (active ? PROJECT_IDS[0] : undefined)

  return (
    <section
      id="experience"
      aria-labelledby="experience-heading"
      className={`${styles.section} section-grid`}
    >
      <h2 id="experience-heading" className={styles.heading} data-active={active}>
        Experience
      </h2>
      <div className={styles.layout}>
        <aside className={styles.stage} aria-label="Illustration of the project in view">
          <div className={styles.stageInner}>
            {PROJECT_IDS.map((id) => (
              <ProjectScene key={id} id={id} active={id === activeProject} />
            ))}
          </div>
        </aside>
        <div className={styles.entries}>
          {experience.map((item) => (
            <article key={item.id} id={item.id} className={styles.entry}>
              <header className={styles.entryHeader}>
                <p className={styles.period}>{item.period}</p>
                <div className={styles.title}>
                  <h3 className={styles.role}>{item.role}</h3>
                  <div className={styles.intro}>
                    {/* Decorative: the company's name opens the description beside it. */}
                    <img src={item.logo} alt="" className={styles.logo} />
                    <p className={styles.about}>
                      <span className={styles.company}>
                        {item.href ? (
                          <a href={item.href} target="_blank" rel="noreferrer noopener">
                            {item.company}
                          </a>
                        ) : (
                          item.company
                        )}
                      </span>
                      {item.about && ` — ${item.about}`}
                    </p>
                  </div>
                </div>
              </header>
              {item.projects.map((project) => (
                <div
                  key={project.id}
                  id={project.id}
                  className={styles.project}
                  data-active={project.id === activeProject}
                >
                  <h4 className={styles.projectTitle}>
                    <a
                      href={`#${project.id}`}
                      onClick={(event) => scrollToProject(event, project.id)}
                    >
                      {project.title}
                    </a>
                  </h4>
                  <details className={styles.details}>
                    <summary
                      className={styles.summary}
                      aria-label={`Read details: ${project.title}`}
                    >
                      Read details
                    </summary>
                    {project.stack.length > 0 && (
                      <ul className={styles.stack}>
                        {project.stack.map((tool) => (
                          <li key={tool}>{tool}</li>
                        ))}
                      </ul>
                    )}
                    {project.body.map((paragraph) => (
                      <p key={paragraph} className={styles.body}>
                        {emphasize(paragraph)}
                      </p>
                    ))}
                  </details>
                </div>
              ))}
              {item.notes?.map((note) => (
                <p key={note} className={styles.note}>
                  {emphasize(note)}
                </p>
              ))}
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
