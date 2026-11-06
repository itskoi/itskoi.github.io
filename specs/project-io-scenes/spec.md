# Spec: project-io-scenes

> WHAT we are building and WHY. No implementation here.

The Experience illustrations today draw each project's internals as a pipeline diagram. A reader has to decode the algorithm to see what the project does. This spec turns each illustration into a story a reader gets at a glance: a real input goes in, the system's features work on it one step at a time, and the real output comes out. It shows what a project can do, without explaining how its algorithm works.

Draft agreed with the owner through the preview artifact (2026-11-06). This first pass converts **Wao Companion** only, so the owner can check the look in the real site before the other six follow.

## User stories

- As a **recruiter skimming the page**, I want to see an actual question and the actual answer so that I understand what Wao Companion does without reading the details.
- As an **engineer reading closely**, I want each step of the agent shown working on that input (guardrail, task breakdown, tool lookups, a retry, claims, the answer, the output check) so that I can see which features it has.
- As a **reader who wants to look longer**, I want to pause the steps and move back and forward through them so that the scene doesn't move on before I've read it.

## Acceptance criteria

- [ ] AC1. The Companion scene always shows a real input: the user's question and their profile (protein target, eaten so far). — `ProjectScene.test.tsx` "companion shows the user's question and profile"
- [ ] AC2. Inside a "Wao Companion" box, the scene plays seven steps in order: input guardrail, break the task down, look up profile and food log, fetch the nutrition guideline (fails, then is retried), gather claims, write the answer, output guardrail. Each step shows its own small illustration under a "Step i / 7" header. — `ProjectScene.test.tsx` "companion walks through its seven steps"
- [ ] AC3. After the last step, the box lists all seven steps, and the real output appears below it: "You have 32 g protein left today…", citing the guideline. — `ProjectScene.test.tsx` "companion ends on the step list and the answer"
- [ ] AC4. The steps move on by themselves when the scene becomes active, starting from the input each time it becomes active again. — `ProjectScene.test.tsx` "companion plays on its own and restarts on re-entry"
- [ ] AC5. A Pause button stops the steps moving on; Play resumes. Back and Next move one step at a time, and a label names where the reader is ("Input", "Step 3 / 7", "Result"). — `ProjectScene.test.tsx` "companion pauses, and steps back and forward"; `tests/e2e/experience-scenes.spec.ts` "companion can be paused and stepped"
- [ ] AC6. With reduced motion, the scene opens on the result (step list and answer), never moves on by itself, and has no build-in animation; Back and Next still show each step. — `ProjectScene.test.tsx` "companion opens on the result under reduced motion"
- [ ] AC7. Each step's build-in still follows the motion contract: CSS only, from-states only, never loops, under 5 seconds, and dropped under reduced motion. — existing "motion contract" tests and the e2e "builds in under 5 seconds" check.

## Out of scope

- The other six scenes (meals, sdd, voice, rag, text-to-image, sentiment). They follow once the owner approves Companion.
- Metric footers (Recall@3, 95% accuracy, F1). Decided with the next scenes.
- Any change to the Experience layout, the stage, or the project text.

## Open questions

- Is the retry on a failed tool call real, and is the guideline cited by name? Shown as example values until the owner confirms.

## References

- Preview artifact: https://claude.ai/artifact/9tvarwQuGqbZSTpghB5WMq
- `specs/portfolio-redesign` (the stage, the scene motion contract)

## Changes

### 2026-11-06 — evaluation results as footnotes

At the owner's request, each scene shows its project's evaluation results from `docs/resume.tex` as footnotes under the caption, with how they were measured. This reverses "Metric footers" in Out of scope, for all seven scenes. The three numbers drawn inside the old drawings (Voice, RAG, Sentiment) move into the footnotes, so a number never appears twice.

- [x] AC8. Companion, Meals, Voice, RAG and Sentiment show their resume results as footnotes; SDD and Text-to-image, which have none, show no footnotes. — `ProjectScene.test.tsx` "shows its evaluation results as footnotes"
- [x] AC9. No drawing contains a percentage; results live only in the footnotes. — `ProjectScene.test.tsx` "keeps results out of the drawing"

### 2026-11-06 — all seven scenes, and highlights instead of footnotes

At the owner's request, after reviewing the preview artifact:

1. All seven scenes play in steps like Companion, as drawn in the preview (Meals, SDD, Voice Log, SoC docs chatbot, Text-to-image, Sentiment). This lifts "The other six scenes" from Out of scope.
2. The sentence footnotes (AC8) become a strip of short highlights: a big red value and a two-to-four word label. Meals keeps one small qualifier, "offline, simulated users". Voice reads "+30% points". SDD has no metric, so it shows one qualitative highlight: "More reliable & autonomous" — specs keep context · dev loop: code + test + review · self-checked by agent E2E. Text-to-image shows none.
3. The SDD example ticket is WAO-172.

- [x] AC10. Every scene shows a real input, plays its own steps under "Step i / n" headers, and ends on its step list and real output. — `ProjectScene.test.tsx` "<id> shows its input", "<id> walks its steps", "<id> ends on its step list and output"
- [x] AC11. Highlights replace the footnotes (supersedes AC8): Companion 93% / 92% / 89%, Meals +59% / +13%, Voice +30% points, RAG <10 s / 95%, Sentiment 95.22%, SDD "More reliable & autonomous", Text-to-image none. — `ProjectScene.test.tsx` "<id> shows its highlights"
