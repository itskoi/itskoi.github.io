import { ProjectScene } from '@/components/ProjectScene/ProjectScene'
import { experience } from '@/data/portfolio'
import { useActiveId, useSectionActive } from '@/hooks/useSectionActive'
import styles from './Experience.module.css'

const PROJECT_IDS = experience.flatMap((item) => item.projects.map((project) => project.id))
const ENTRY_IDS = experience.map((item) => item.id)

const emphasize = (text: string) =>
  text.split('**').map((part, index) => (index % 2 ? <strong key={part}>{part}</strong> : part))

export function Experience() {
  const active = useSectionActive('experience')
  // The stage is in view from the section's top, so it shouldn't wait for the first project.
  const activeProject = useActiveId(PROJECT_IDS) ?? (active ? PROJECT_IDS[0] : undefined)
  const activeEntry = useActiveId(ENTRY_IDS)

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
            <article
              key={item.id}
              id={item.id}
              className={styles.entry}
              data-active={item.id === activeEntry}
            >
              <header className={styles.entryHeader}>
                <div className={styles.intro}>
                  {/* Decorative: the company's name is right below it. */}
                  <img src={item.logo} alt="" className={styles.logo} />
                  <p className={styles.about}>{item.about}</p>
                </div>
                <p className={styles.period}>{item.period}</p>
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
                {item.context && <p className={styles.context}>{emphasize(item.context)}</p>}
              </header>
              {item.projects.map((project) => (
                <div
                  key={project.id}
                  id={project.id}
                  className={styles.project}
                  data-active={project.id === activeProject}
                >
                  <h4 className={styles.projectTitle}>{project.title}</h4>
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
