# Spec: portfolio-redesign

> WHAT and WHY. A new dark palette, content synced to the latest resume, and an Experience section told in two columns: the project you are reading on one side, an animated illustration of what it is on the other. No implementation here, see `plan.md`.

## Context

The resume (`docs/resume.tex`, `docs/resume.html`) was rewritten around projects, but `src/data/portfolio.ts` still mirrors the old bullets, including a removed internship and an old job title. Experience is a table of text, so a recruiter gets no picture of what the work does. The dark theme is a plain inverse of the light one; the owner wants it to have its own identity.

## User stories

- As a **recruiter**, I want **each project to show what it does as I scroll to it** so that **I understand the work without reading every line**.
- As a **visitor in dark mode**, I want **a dark navy, white and orange palette** so that **the theme has its own identity**.
- As the **owner**, I want **the site to say what the resume says** so that **the two never disagree in an interview**.
- As a **motion-sensitive visitor**, I want **the finished illustration without the build-in** so that **I lose no information**.
- As a **phone visitor**, I want **the illustration to stay in view above the text** so that **the two-column idea survives a single column**.

## Acceptance criteria

### Palette

- [x] Light theme tokens are unchanged (white, near-black, Swiss red). — `src/styles/global.test.ts`
- [x] Dark theme is dark navy background, white text and orange accent, through both the `data-theme` path and the OS-preference path. — `src/styles/global.test.ts`, `tests/e2e/swiss.spec.ts`, `tests/e2e/typography-theme.spec.ts`
- [x] All dark text tokens meet WCAG AA on navy. — `src/lib/contrast.test.ts`

### Content

- [x] `src/data/portfolio.ts` matches the resume: Wao as AI Engineer (Mar 2025 – Nov 2026) with four projects in the resume's order, Uniquify, Research Assistant, no ITR. — `src/data/portfolio.test.ts`
- [x] Education, certifications, publications and technologies match the resume. — `src/data/portfolio.test.ts`
- [x] The Companion is called a POC and Meal suggestions keeps "simulated users". — `src/data/portfolio.test.ts`
- [x] No number from outside the resume appears on the page: no user counts, catalog sizes, or case, flow or spec counts. Example values inside a schematic are labeled as schematic. — `src/data/portfolio.test.ts`, review of `ProjectScene.tsx`

### Two-column Experience

- [x] At 769px and wider, project text is in the left column and the illustration stage in the right column, and the stage stays in the viewport while the section scrolls. — `tests/e2e/experience-scenes.spec.ts`
- [x] The project crossing the shared mid-viewport band (`ACTIVE_BAND`) is the active one; exactly one illustration shows, and it is that project's. — `src/sections/Experience/Experience.test.tsx`, `tests/e2e/experience-scenes.spec.ts`
- [x] While the band sits between two projects the last active one stays, so the stage never goes blank. Before any scroll the first project is active. — `src/hooks/useSectionActive.test.tsx`
- [x] Every project has its own illustration with a text alternative; hidden illustrations are out of the accessibility tree. — `src/components/ProjectScene/ProjectScene.test.tsx`, `tests/e2e/experience-scenes.spec.ts`

### Motion

- [x] An illustration builds in with CSS animation when it becomes active, once, in under 5 seconds, then holds its finished state (WCAG 2.2.2). It replays on re-entry. — `tests/e2e/experience-scenes.spec.ts`, `src/components/ProjectScene/ProjectScene.test.tsx`
- [x] Under `prefers-reduced-motion: reduce` no animation runs and the finished illustration is shown. — `tests/e2e/experience-scenes.spec.ts`
- [x] No GSAP tween, ScrollTrigger, second canvas or new dependency. — `tests/e2e/swiss.spec.ts`, `package.json` unchanged

### Narrow screens

- [x] At 768px and below, the stage is pinned under the nav above the text and scenes still switch, with no horizontal page scroll. — `tests/e2e/experience-scenes.spec.ts`

## Out of scope

- Hero, Education, Publications and Technologies layouts (content only).
- The descent canvas: it stays and takes the new accent through its existing token.
- Real product screenshots or footage.
- Looping animation, which would need a pause control.

## References

- `docs/resume.tex`, `docs/resume.html`
- `specs/measure-and-heading-accent` (the shared band)

## Changes

### 2026-11-06

- Added: clicking a project title scrolls that project onto the band, so its illustration shows, at the owner's request. — `src/sections/Experience/Experience.test.tsx`, `tests/e2e/experience-scenes.spec.ts`
- Fixed: on screens taller than about 960px, clicking a title above the current project showed the project above it instead. The clicked project's top now lands just above the band's top edge, so the project above has left the band. — `tests/e2e/experience-scenes.spec.ts` "clicking a title above the current project shows that project"

### 2026-11-05

- Added: experience text bolds short key phrases so a reader can skim it, at the owner's request. Wording stays identical to the resume, and bold stays under half of each text. Qualifiers that keep a claim accurate, such as "simulated users", are bolded with the numbers they qualify. — `src/data/portfolio.test.ts`, `src/sections/Experience/Experience.test.tsx`
- Changed (supersedes "Before any scroll the first project is active"): no project is active until the band reaches the first one, and none again once it returns above it. The first scene was otherwise spent unseen on page load and never replayed after scrolling back to the top. The wide stage stays empty until then; the phone stage starts when Experience reaches the band, because empty it would be a gap above the text. The nav follows the same rule, so it no longer keeps a section highlighted over the hero. — `tests/e2e/experience-scenes.spec.ts`, `src/hooks/useSectionActive.test.tsx`
- Changed: four illustrations now draw the real pipelines, at the owner's request. Companion: Planner (break down, call tools, observe, claims), then Answerer (gather claims, ledger, result), then Guardrail. Meal suggestions: remaining calories, two-tower retrieval, portion optimization, LightGBM reranking, output meals. SoC chatbot: PDF, parse, Markdown, index, LangGraph with a self-hosted LLM, answer. Vietnamese text-to-image: PhoBERT feeds every denoising stage through skip connections. The under-5-seconds check now covers every scene. — `src/components/ProjectScene/ProjectScene.test.tsx`, `tests/e2e/experience-scenes.spec.ts`
- Added: each company shows its logo and a short description when its entry reaches the band, and hides them again once the band leaves. Logos are stored in the repo. Wao's description moved out of `context`, keeping the resume's wording. — `src/sections/Experience/Experience.test.tsx`, `tests/e2e/experience-scenes.spec.ts`
- Changed (supersedes "The wide stage stays empty until then"): the first scene starts when Experience reaches the band on every screen size, at the owner's request, instead of waiting for the first project on wide screens. It still doesn't play on page load, and still replays after returning to the top. — `src/sections/Experience/Experience.test.tsx`, `tests/e2e/experience-scenes.spec.ts`
- Changed: the Companion illustration adds an input guardrail before the Planner (checks the input is not harmful, rewrites the query if needed) and the final answer after the output guardrail, at the owner's request. — `src/components/ProjectScene/ProjectScene.test.tsx`
- Changed (supersedes "`src/data/portfolio.ts` matches the resume" for project descriptions, "Meal suggestions keeps \"simulated users\"", and "Wording stays identical to the resume"): project descriptions now say what each project does and how it works, with no evaluation results, at the owner's request. "Simulated users" went with the metrics it qualified. Titles, dates, company context and notes still match the resume. — `src/data/portfolio.test.ts`
- Changed: the Companion illustration shows the Planner also receiving the user's behaviors, at the owner's request. — `src/components/ProjectScene/ProjectScene.test.tsx`
- Changed: at 769px and wider the illustration stage is transparent, so the backdrop shows through as it does behind the text, at the owner's request. It stays opaque on narrow screens, where the text scrolls underneath it. — `tests/e2e/experience-scenes.spec.ts`
- Changed: each project shows only its title and a "Read details" control until opened, at the owner's request; the stack and description sit behind it. Projects no longer reserve 62vh and are indented under their role. So a list of titles doesn't switch illustrations too fast, the wheel moves the page at 25% speed while the band is on a collapsed project; touch scrolling stays native. — `src/sections/Experience/Experience.test.tsx`, `tests/e2e/experience-scenes.spec.ts`
- Changed (supersedes the logo half of "each company shows its logo and a short description when its entry reaches the band"): the company logo always shows, at the owner's request. The description still appears when the entry reaches the band. — `tests/e2e/experience-scenes.spec.ts`
- Changed (supersedes "Dark theme is dark navy background, white text and orange accent"): the dark theme is black background, white text and red accent, at the owner's request, through both the `data-theme` path and the OS-preference path. Muted text is a neutral gray, and all dark text tokens meet WCAG AA on black. — `src/styles/global.test.ts`, `src/lib/contrast.test.ts`, `tests/e2e/experience-scenes.spec.ts`
- Changed: in the dark theme the "Read details" control is the pink of the black hole's disk, through a new `--color-details` token, at the owner's request. The light theme keeps its red. — `src/styles/global.test.ts`, `src/lib/contrast.test.ts`
- Changed (supersedes the entry making "Read details" pink): "Read details" is the muted gray in both themes, through the existing `--color-fg-muted`, at the owner's request. The `--color-details` token is gone. — `tests/e2e/experience-scenes.spec.ts`
- Changed: on wide screens the space after the last project shrinks to what the pinned stage needs, `calc(52.5vh + 1.5rem)` from the project's top, and Experience drops its bottom padding, at the owner's request. — `tests/e2e/experience-scenes.spec.ts`
- Changed: company logos have rounded corners, at the owner's request. They are the one exception to the site's zero-radius rule. — `tests/e2e/experience-scenes.spec.ts`, `src/styles/global.test.ts`
- Changed (supersedes "The description still appears when the entry reaches the band"): the company description always shows, like the logo, at the owner's request. — `tests/e2e/experience-scenes.spec.ts`
- Changed: the rules above each project under a company are dashed, at the owner's request. The rules between companies stay solid. — `tests/e2e/experience-scenes.spec.ts`
- Changed: a company's notes sit in its project list, with the same indent and dashed rule, at the owner's request. — `tests/e2e/experience-scenes.spec.ts`
