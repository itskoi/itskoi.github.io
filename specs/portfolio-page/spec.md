# Spec: portfolio-page

> WHAT we are building and WHY. No implementation here.
> Populate the placeholder SPA with real portfolio content sourced from `docs/resume.tex`, plus a sticky navigation that smooth-scrolls between sections using the existing Lenis pipeline.

## Context

The site currently ships a placeholder Hero ("Portfolio" / "Built with React, Lenis & GSAP") and a `Placeholder` section that exists only so the page can scroll. The owner's resume (`docs/resume.tex`) is the single source of truth for the real content: name, role, experience, education, publications, and tech stack. This spec turns the scaffold into an actual portfolio page.

## Source content (derived from `docs/resume.tex`)

**Profile**
- Name: Bach-Khoi Vo
- Current role: Fullstack AI Engineer (at Wao)
- Location: HCM City, Vietnam
- Email: itskoiwork@gmail.com · LinkedIn: linkedin.com/in/bachkhoivo · Phone: 0944 157 219

**Experience** (4 roles, newest first)
1. Wao — Fullstack AI Engineer — Mar 2025 – Present
2. Uniquify — AI Engineer — Oct 2023 – Feb 2025
3. Computational Linguistics Center (CLC), HCMUS — Research Assistant — Apr 2022 – Sep 2023
4. ITR — AI Engineer Intern — Feb 2023 – Apr 2023

**Education**
- University of Science — BSc Computer Science — Aug 2019 – Nov 2023 — GPA 3.74/4.0 (8.93/10)
- 3 academic awards + 5 certifications (Google Cloud Skills Boost, Berkeley RDI LLM Agent MOOC, TOEIC 900, IBM AI Engineer, IBM Data Science)

**Publications** (2, newest first)
1. "Combining Diffusion Model and PhoBERT for Vietnamese Text-to-Image Generation" — IEEE-RIVF'23 — Dec 2023
2. "Sentiment Analysis for Vietnamese Language Using PhoBERT Model" — FAIR'22 — Dec 2022

**Technologies** (6 categories)
- LLM & NLP · Fullstack Development · Infrastructure · Cloud · Data Science · Development Tools

## User stories

- As a **visitor**, I want to **see Bach-Khoi's name, role, and location immediately** so that I **know whose portfolio this is and what they do**.
- As a **visitor**, I want a **sticky nav** so that I can **jump to any section without scrolling back to the top**.
- As a **visitor**, I want **clicking a nav link to glide smoothly** to a section so the page **feels cohesive with the rest of the site**.
- As a **recruiter**, I want to **read each work role with company, dates, and impact bullets** so I can **assess seniority and fit**.
- As a **researcher**, I want to **find the two publications with venue and DOI links** so I can **read the work**.
- As a **hiring manager**, I want to **scan the tech stack grouped by domain** so I can **gauge the tooling landscape**.

## Acceptance criteria

(Each criterion is testable. Each maps to at least one test — see `plan.md`.)

### Hero
- [ ] Hero renders the name "Bach-Khoi Vo" and the role "Fullstack AI Engineer". — `Hero.test.tsx`
- [ ] Hero no longer shows the placeholder "Portfolio" / "Built with React, Lenis & GSAP" copy. — `Hero.test.tsx`

### Sticky nav
- [ ] A nav renders with four links labeled Experience, Education, Publications, Technologies. — `Nav.test.tsx`
- [ ] Each nav link points to the corresponding section via an in-page anchor (`#experience`, `#education`, `#publications`, `#technologies`). — `Nav.test.tsx`
- [ ] Activating a nav link calls Lenis's `scrollTo` (not a native jump). — `Nav.test.tsx`
- [ ] The nav is sticky/fixed and remains visible while scrolling. — `portfolio.spec.ts` (E2E)

### Experience
- [ ] Renders exactly 4 roles in newest-first order; Wao is first. — `Experience.test.tsx`
- [ ] Each role shows role title, company, date range, and at least one highlight bullet. — `Experience.test.tsx`

### Education
- [ ] Shows "University of Science", "Computer Science" degree, the date range, and GPA. — `Education.test.tsx`
- [ ] Renders the awards and the certifications lists. — `Education.test.tsx`

### Publications
- [ ] Renders exactly 2 papers in newest-first order. — `Publications.test.tsx`
- [ ] Each paper shows its title, venue, authors (with the owner's name visually emphasized), and a working DOI link. — `Publications.test.tsx`

### Technologies
- [ ] Renders all 6 categories, each with its tool list. — `Technologies.test.tsx`

### Composition / cleanup
- [ ] The `Placeholder` section is removed from the app. — `App.test.tsx`
- [ ] `App` composes Hero, nav, and the four content sections. — `App.test.tsx`
- [ ] Existing smooth-scroll E2E (`smoke.spec.ts`) still passes after the Hero copy changes. — `tests/e2e/smoke.spec.ts`

### Accessibility
- [ ] Each section has an `id` matching its nav anchor and is headed by a heading linked via `aria-labelledby`. — component tests + E2E.
- [ ] Nav is a `<nav>` with an `aria-label`. — `Nav.test.tsx`.

### Motion (richer — Decision 2)
- [ ] Hero mounts a **staggered intro timeline** (name → role → location) that plays on load; the timeline is killed on unmount. — `Hero.test.tsx` (mock `@/lib/gsap`).
- [ ] Hero applies **parallax** to its content on scroll via `useParallax`; transform-only (no document-flow shift). — `Hero.test.tsx`.
- [ ] Each content section wires `useScrollReveal` so its **children stagger in** on enter. — section tests (hook applied / ref attached).
- [ ] No motion leak: every timeline/ScrollTrigger is killed on unmount (StrictMode double-mount safe). — `useScrollReveal.test.ts`, `useParallax.test.ts`.
- [ ] `prefers-reduced-motion` disables the intro + parallax (renders content statically). — `Hero.test.tsx`.

## Out of scope

- **Personal Projects** section (resume has only the blog; owner chose not to include). Can be added in a later spec.
- **Contact** as a dedicated section. Contact details are handled via Open Question below.
- **Dark/light theme toggle** — site is already dark by default.
- **Images, photos, or project screenshots.**
- **Internationalization** (Vietnamese copy).
- **Form/handshake with a backend** — email link only, no contact form.
- **Analytics or SEO meta** beyond the existing description tag.

## Decisions (resolved 2026-08-01)

1. **Contact info placement — name + role + location in the Hero; LinkedIn + email as links; phone omitted** from the public site for privacy.
2. **Motion ambition — richer than plain scroll-reveal.** Three layers: (a) Hero loads with a staggered text intro and parallaxes as the visitor scrolls away; (b) each section's children stagger in on enter; (c) light parallax on decorative section elements. Transform-only (opacity/translate) so anchor targets stay stable.
3. **External links — all resume URLs** (Wao app, Google Cloud profile, Coursera/IBM certs, DOIs, LinkedIn) render as `<a target="_blank" rel="noreferrer noopener">`.

## References

- Source of truth: `docs/resume.tex`
- Project principles: `specs/constitution.md`
- Template these were derived from: `specs/_template/`
