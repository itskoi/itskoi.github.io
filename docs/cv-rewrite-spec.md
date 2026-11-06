# CV Rewrite: Senior AI Engineer

| Field | Value |
|---|---|
| Owner | Bach-Khoi Vo |
| Started | 2026-10-31 |
| Status | Phase 1 (update CV), drafting. `docs/resume.tex` is unchanged. |
| Target | Senior AI Engineer applications |
| Source CV | `docs/resume.tex` |
| Review page | https://claude.ai/artifact/B6KpGQtdq2cRCHKV4Td1wc (first review, 2026-10-31) |

## Phases

1. **Update CV.** Go through each section, collect facts, agree on bullets here, then apply them to `docs/resume.tex` in one pass when the owner says so.
2. **Prepare for interview.** Build answers for each project around its hardest challenge, the decisions made, and the numbers below.

## Rules

- **R1. No invented claims.** Every number and claim on the CV is in the facts tables below, with its source. Numbers marked *pending* stay off the CV until confirmed.
- **R2. Ownership matches the record.** "Led", "built", "designed" are used only where the owner did that work; shared work says so. Git history is public to the employer and checkable.
- **R3. No production claims without production.** The Companion is a POC; the CV says so.
- **R4. Drafts stay in this file.** `docs/resume.tex` changes only when the owner asks to apply.
- **R5. One page.** Make room by trimming Education, certifications and the internship.
- **R6. Bullet shape.** Strong past-tense verb, what, how, result. Bold only 1 or 2 numbers or phrases per bullet.

## Decisions

| # | Date | Decision | Reason |
|---|---|---|---|
| D1 | 2026-10-31 | Restructure the Wao entry around four projects: Companion, AI-assisted delivery (SDD + E2E), Voice Log search, Meal plans. | Owner's framing. |
| D2 | 2026-11-01 | Describe the Companion as a POC with its eval results. Drop "~200 beta users" and any production claim. | R3. There is no beta; follow-up questions and reference checks would expose it. |
| D3 | 2026-11-01 | Frame SDD as "one of the first two engineers", not "led the team's move". | R2. Cong Pham built most of the tooling; the owner co-adopted it, pushed for task lists, proposed E2E, and drove the OpenSpec move. |
| D4 | 2026-11-01 | Correct app scale: ~10K daily active users and ~100K food logs per day (not ~100K active users). | Owner correction. |
| D5 | 2026-11-01 | Keep the job title "Fullstack AI Engineer"; carry "sole AI engineer" in the context line. | The title is the official one; the context line shows the scope. |

## Wao (Mar 2025 – Nov 2026)

Owner's last day was 2026-11-01.

### Context line (draft)

> *AI calorie-tracking app for Vietnamese users. Sole AI engineer on a ~6-person product team.*

### Numbers on the CV (owner, 2026-11-04)

Stay: team size (~6), relative gains (Recall@3 up 30 percentage points, new-meal recall@10 +59%, from 0.178 vs 0.112; NDCG@5 +5%, LightGBM preference 0.8289 vs frequency 0.7871; accept rate +13%, v3 33.26% vs v2 29.34%), eval scores, and voice share (~20%). Hidden: users, food logs, catalog sizes, and case, query and spec counts. "Simulated" stays in that bullet because it keeps the claim accurate (R3). The facts tables below keep the numbers for interview prep, so this file must not be published.

### Bullet order (owner, 2026-11-04)

Wao Companion → Meal suggestions → SDD workflow → Voice Log search.

### Team facts

| Fact | Source |
|---|---|
| Team: ~3 developers, 1 AI engineer (owner), 1 QC, 1 PO; 5–6 people at a time | Owner |
| Owner is the sole / lead AI engineer, owning the AI stack | Owner |
| ~10K daily active users, ~100K food logs per day | Owner |

---

### P1. Wao Companion (AI health agent)

**What it is.** An LLM agent that answers nutrition, exercise and app-support questions from the user's profile, behavior-derived feature flags and internal nutrition guidelines. Every answer must follow the guidelines, use the user's real numbers, and cite its guideline.

**Hardest challenge (owner).** Guaranteeing that answers follow the guidelines and use real user data, with clear citations.

**Facts**

| Fact | Source |
|---|---|
| Built from 2026-07-06 to now; 794 commits, all by the owner | git, `waoai/nutrition/tools/ai-chat` |
| POC built in about 2 months; production is proposed, not running | Owner |
| Stack: NestJS + LangGraph JS (TypeScript); Context service (NestJS, TypeORM, Postgres); Next.js UI | `tools/ai-chat/CLAUDE.md` |
| Ported from Python (FastAPI, LangChain, MCP) to TypeScript with parity tests | `tools/ai-chat/CLAUDE.md`, `docs/evidence/2026-10-09-wao-chat-eval-ts-port.md` |
| Turn graph: input check → prefetch → safety → intent → route → canned reply, or plan → execute → answer → guardrail → finalize | `companion/src/turn/graph.ts` |
| 8 tools: profile, behavior flags, nutrition metrics, food log, engagement, nutrition term, health guideline, calculate | `companion/src/tools/definitions/` |
| Rule: every figure in a reply comes from a tool result. Claim-first planning; claim ledger and output guardrails check citations, unsourced figures, and claims about tools never called (one re-answer on failure) | `companion/src/guardrails/`, `docs/2026-08-20-claim-first-planning-spec.md` |
| Layered safety L0–L4 (sanitizer, safety routing, fixed safety copy, prompt hardening, output guardrail); risk tiers from behavior flags hold back advice and require a referral line | `docs/2026-08-31-l*`, `docs/2026-09-28-companion-risk-level-model-spec.md` |
| Guidelines, terms and prompts in a versioned, hashed Knowledge Pack (YAML + Markdown) | `knowledge/`, `companion/knowledge/` |
| Built spec-driven: ~200 dated specs with evidence files | `tools/ai-chat/docs/` |
| Dev model: Qwen 3.8-27B on vLLM (DGX Spark). Production target: Gemini 3.6 Flash, GPT-5.4-mini failover, via LiteLLM | Owner; `docs/2026-09-04-wao-companion-chat-production-proposal.md` |
| Latency: ~10 s to first token, up to 60 s for the full reply | Owner |
| Production proposal WAO-1806: two NestJS services on Cloud Run, socket push, nutritionist-approved pack versions; revised after tech lead review | `docs/2026-09-04-wao-companion-chat-production-proposal.md` |
| Eval set: 3,000 hand-written cases from QC, PO and nutrition teams; scored runs use a 1,000-case sample | Owner; `tools/ai-chat/README.md` |
| Eval v2 results on the 1,000-case sample: M1 answer decision 93%, M2 decline delivery 89%, M3a completeness 95%, M3b correctness 92%, M3c grounding 89%, M3d tone 90% | Owner (results not on this machine) |
| Correctness checked by script: expected guidelines per question compared with the guidelines the answer cited. Tone graded by judge. Human reviewers approved the judge's grading | Owner |
| Decision: no orchestrator. Wrong-tool share 6/19 (32%), under the 1/3 bar; most were wrong arguments, fixed by argument checks | `docs/evidence/2026-10-21-companion-orchestrator-decision-read.md` |
| Decision: removed embedding routing in favor of prescreen + LLM router (2026-10-21) | `docs/2026-10-21-companion-remove-embedding-routing-spec.md` |

**Draft bullets**

> **Wao Companion (AI health agent, POC):** Built an LLM agent that gives personalized answers to nutrition, exercise and app-support questions, based on each user's profile and in-app behavior and grounded in nutritionist-approved guidelines. The agent plans its claims first, and output guardrails require every figure to come from a tool result and every answer to cite its guideline.
>
> Built the eval with the QC, PO and nutrition teams: hand-written test cases, scripted checks that cited guidelines match the expected ones, and an LLM judge for tone validated by human reviewers. The agent chose correctly to answer, clarify or decline in **93%** of cases. Of graded replies, **95%** covered everything asked, **92%** were factually correct and **89%** were backed by user data or guidelines.

**Open questions:** none.

**Interview notes**
- Claim-first planning: why plan claims before writing, and what the ledger catches.
- Scripted checks first, LLM judge only for tone; self-preference risk when the judge is the same model.
- Orchestrator decision: a data bar set before reading the results.
- What failed: embedding routing removed; planner retrying invalid tool arguments (fixed by capping replans and listing valid keys).

---

### P2. AI-assisted delivery (SDD + agent E2E)

**What it is.** The team's move from vibe coding to spec-driven AI development, then agent-run E2E testing.

**Hardest challenge (owner).** Changing team habits, and a workflow that had to evolve over time instead of being right the first time.

**Facts**

| Fact | Source |
|---|---|
| Started Sep 2025: `w.sh` → `agent/scripts/start.sh WAO-<n>` reads the Jira ticket, writes a spec, then implements; providers include Gemini and opencode | `waoai/nutrition/w.sh`, git (first commits 2025-09-15/18) |
| Started from a customized GitHub Spec Kit command | Owner |
| Owner and Cong Pham were the first two to develop with specs; owner's WAO-843 on 2025-09-17 is among the first tickets | Owner; git |
| Cong Pham committed most of the tooling (30 commits in `agent/`); AI code review on GitLab from Jul 2025 (WAO-744) | git |
| Owner pushed for task lists after agents lost context without one and shipped bugs | Owner |
| Other members extended the workflow; Hung Nguyen wrote most of `docs/guidelines/` from Mar 2026 | Owner; git |
| Owner proposed agent-driven E2E testing after reading about it | Owner |
| Mobile E2E runs before deploys: Maestro, 169 flows on the iOS simulator; skills committed by Hung Nguyen | Owner; `.claude/skills/wao-mobile-e2e` |
| Owner evaluated OpenSpec, presented it, and the team agreed to migrate | Owner |
| Web E2E uses Playwright (`backoffice-app`) | Owner; `backoffice-app/playwright.config.ts` |
| Mobile E2E: Maestro is the main runner (`yarn e2e`, commits through Oct 2026). `agent-device` is also in the repo, in agent-test skills and 27 flow files, added Aug 2026 by a teammate | git, `mobile-app/package.json`, `mobile-app/e2e/flows` |

**Draft bullet**

> **SDD workflow:** One of the first two engineers on Wao's spec-driven AI workflow (Sep 2025): Jira ticket → AI-written spec → task list → implementation → AI code review. Pushed for explicit task lists after agents lost context and shipped bugs. Proposed agent-driven E2E testing, adopted on web and mobile.

**Resolved**
- Q2.1 The CV names Playwright and Maestro. The owner didn't recall which mobile tool is used; the repo shows Maestro as the main runner, so `agent-device` stays out of the bullet.

**Interview notes**
- Concrete story: agent lost the task list → bug → task lists and docs that define what the agent must do.
- How habits changed in a 5–6 person team; what was wrong in the first version of the workflow.

---

### P3. Voice Log search

**What it is.** Speech → text (React Native speech recognition) → LLM writes the search query → Typesense search → reranker using LLM pre-extracted tags: ingredients, preparation state (raw, cooked, processed), brand, food group (vegetables, meat, dairy, fish).

**Hardest challenge (owner).** One Vietnamese dish or food can go by many different names.

**Baseline gaps the work fixed (owner)**
1. Preparation state: user says "mì bò" (cooked noodle soup) and gets "mì gói" (instant noodles, processed).
2. Different names for the same food: "khổ qua" and "mướp đắng" (bitter melon).
3. Brand: a user who says Vinamilk should not get other brands.

**Facts**

| Fact | Source |
|---|---|
| Recall@3 up 30 percentage points over the baseline, Typesense alone; ~800K foods. Before and after values not given | Owner |
| Measured on 500 cases hand-labeled by the owner and QC; no evaluation code in the repo | Owner |
| About 20% of food logs come from voice; ~20K logs a day, derived from ~100K food logs a day | Owner; derived |
| ~10K foods come from the nutrition team; the rest come from barcode scans | Owner |
| Aliases are LLM-generated; tags and aliases cover all ~10K nutrition-team foods | Owner |
| Brand comes from what the user says in the moment; there is no per-user brand memory | Owner; `voice-log.service.ts` |
| Owner started the voice-log module (WAO-758, 2025-08-22) and its main enhancements: tag list and recipe threshold (WAO-789), serving mapping (WAO-997), brand priority (WAO-1003), voice log report page (WAO-1007), result enhancement (WAO-1641, 2026-05) | git, `backend/backoffice/src/modules/nutrition/voice-log/` |
| LLM step: transcript → JSON list, one item per food: `name`, `brand`, `alternativeNames`, `foodType` (food or recipe), `tags` from a predefined list, `quantity`, `convertRate` (grams). Vietnamese word segmentation with underscores (`rau_muống`); brand list loaded from the DB into the prompt | `voice-log.service.ts` (`voiceTextToQueriesPromptV3`) |
| Models: Gemini 2.5 Flash primary, GPT-4o-mini fallback, behind a circuit breaker; JSON mode, temperature 0.1 | `docs/llm-call-sites.md` §2.2 |
| Search: foods and recipes in parallel in Typesense; fields name / unaccented name / keywords weighted 80/40/20; results sorted by text match, then tag overlap | `food/food.service.ts` `searchSimilarFoods` |
| Rerank is rule-based: down-rank candidates without the raw tag when the user said raw; brand named → down-rank candidates without it; no brand named → down-rank branded candidates; drop below a 0.2 threshold | `voice-log.service.ts` |
| Aliases prepared for every raw and cooked food; Typesense synonym groups | Owner; `food-search-index/typesense-synonyms-import.ts` |
| Typesense indexing, synonyms import and zero-downtime reindex mostly by Hung Nguyen and Cong Pham; the LLM fallback layer is a shared module | git |
| Owner also added brand-aware ranking and a cooked-food ingredient fallback to Meal Scan (WAO-1661, 2026-05) | git |

**Draft bullet**

> **Voice Log search (~20% of food logs):** Built the voice-logging search pipeline: a cloud LLM API turns a Vietnamese transcript into structured queries (food, brand, alternative names, tags, grams), searched over the food and recipe catalog and reranked on preparation state (raw, cooked, processed), brand and food group. **Recall@3 up 30 percentage points** over keyword search alone, measured on hand-labeled queries. Brought the brand-aware ranking to Meal Scan.

**Resolved**
- Q3.13 +30 is percentage points (owner, 2026-11-04). Before and after values are worth having for interviews.
- Q3.14 Tags and aliases cover all ~10K nutrition-team foods (owner, 2026-11-04).

---

### P4. Meal plans (dropped from the CV)

**Status.** Owner decided on 2026-11-04 not to mention meal plans on the CV. The Wao recommender item is now P4b only. Facts below are kept for reference, and none of them, including ~10K plans, adoption and retention, may be used in P4b's bullet.

**What it is.** CVXPY optimization for calorie and macro targets, then a reranker driven by a recommender model trained on user behavior.

**Hardest challenge (owner).** Recommending foods users are likely to enjoy and that fit their preferences.

**Facts**

| Fact | Source |
|---|---|
| ~10K plans generated | Owner |
| ~70% adoption | Owner, *pending: 70% of what* |
| ~20% retention | Owner, *pending: rate (D7/D30) or lift over non-plan users* |
| Owner is the main author of the engine: 31 commits in `meal_planning`, first on 2025-10-28 ("Prepare meal plan service"); 19 of about 30 in the planner and optimizer. Tai Le and Hung Nguyen also contributed | git, `AI/meal_planning/` |
| Two FastAPI services: Generator (meal plan API) and Indexer (LLM recipe classification, CDC events over Pub/Sub, cron jobs) | `AI/CLAUDE.md` |
| CVXPY optimizes ingredient portions against calorie, carb, protein, fat and sugar targets, with slack variables and penalties for soft limits (spices, flavorings, oil, minimum calories) | `core/generator/optimizer/` |
| Recipe selection scores candidates with boosts, Jaccard similarity and region match; validator checks meal structure, preferences and targets | `core/generator/meal_planner/select_meal.py`, `AI/CLAUDE.md` |
| Region preference: 4,800+ dishes scored North / Central / South by LLM, used in meal selection | `AI/docs/specs/WAO-1421.md` |
| ALS collaborative filtering (`implicit`, 16 factors, alpha 10, regularization 0.05) ranks foods for each user at `POST /suggest_foods`, with a fallback for new users; the spec replaced random suggestions | `core/generator/food_suggestor/`, `AI/docs/plans/2026-06-11-suggest-foods-with-als-spec.md` |
| A search of `meal_planner/` and `workflow/` found no ALS use. It appears to serve food suggestions, not `/plan_meals` | Code search, *pending: owner to confirm* |

#### P4b. Meal suggestions (`../meal-suggestions`)

**Status.** Wao feature, per the owner (2026-11-04), so it goes under Wao; `docs/guidelines/product-requirements.md` in the Wao repo lists smart meal suggestions. The repo's docs and commits are dated 2026-11-02 to 2026-11-04, after the owner's last day (2026-11-01), so the owner should be ready to explain the timing if asked. Not claimed as live: all data is mock (R1, R3). The code may belong to Wao, so check before publishing it.

**Facts**

| Fact | Source |
|---|---|
| Design docs dated 2026-11-02; first commit 2026-11-04; local repo with no remote | Docs, git |
| Mock data: 1,000 users, 60 days of logs, hidden tastes kept from the model; USDA nutrition | `README.md` |
| Built v1 pipeline: meal target, candidates, filters, portion fit, selection. Safety rules sit outside the models | `openspec/changes/archive/` |
| Two-tower retrieval (PyTorch) built, trained and archived on 2026-11-04; all tasks ticked, and the design doc's bar was met on mock data | `src/meal_suggestions/two_tower/`, `openspec/changes/archive/` |
| Synthetic test, days 47–60: recall@100 0.743 vs 0.671 popularity; new-meal recall@100 0.548 vs 0.460. "Own most frequent" wins at recall@10, 0.591 vs 0.440 | `data/models/two_tower_report.md` |
| DCN-v2 and LightGBM rankers built and trained 2026-11-05 (mostly uncommitted; tasks 8.2 to 8.4 not ticked). `ranker_choice.txt` serves LightGBM: DCN-v2 didn't beat it (accepted and kept per user +0.0018, interval -0.0045 to +0.0083; offline GAUC -0.0035). Simulated A/B, accepted and kept per request: no ranker 25.65%, LightGBM 29.30% (+14%), DCN-v2 29.40% | `src/meal_suggestions/ranker/`, `data/models/ab_report.md` |
| Not in the prototype: slot-based retrieval (50 per slot), top 15 per slot, grid search over templates. It retrieves whole meal templates from 5 sources and returns 3–5 meals | Code search, `docs/Meal Suggestion System.md` |

**Draft bullet** (under Wao)

> **Meal suggestions:** Built a meal suggestion system for the app that suggests meals a user is likely to eat and that fit their remaining calories and macros. Two-tower retrieval over meal templates, then learned ranking of what a user will accept and keep, with portion fitting and rule-based safety filters outside the models. Compared DCN-v2 and LightGBM rankers and chose LightGBM, since DCN-v2 showed no significant gain. In offline evaluation on simulated users: **new-meal recall@10 +59%** over popularity, **NDCG@5 +5%** over frequency ranking and **accept rate +13%** with the ranker.

Owner asked to drop the word "prototype" (2026-11-04). "Simulated" and "designed" stay, because they are what keep the bullet accurate under R1 and R3.

**Open questions**
- Q4.9 Live status: the owner said it is live, but `openspec/project.md` says all data is mock and "must not be used with real users", and there is no remote or deploy config. Not claimed.

**Resolved**
- Q4.8 The slot and grid-search design will not replace the prototype's design (owner, 2026-11-04). The bullet keeps "two-tower retrieval over meal templates".

---

## Other sections (from the first review, not yet discussed)

| Section | Proposed change | Status |
|---|---|---|
| Summary | Removed (owner, 2026-11-05): it repeated the bullets, and the space allows larger text. | Decided |
| Header | Icons on all five items. Location, email and phone show as text; "Portfolio" (itskoi.github.io) and "LinkedIn" (linkedin.com/in/bachkhoivo) show as labelled links, with the URLs hidden at the owner's request. PDF metadata: `pdfauthor={Bach-Khoi Vo}` (typo on line 24), `pdftitle={Bach-Khoi Vo - CV}`. | Draft, awaiting owner |
| Uniquify | Draft: "**SoC documentation chatbot:** Led a 4-person team building a RAG chatbot over ~2GB of chip design software manuals for the SoC and IP teams, using self-deployed on-premise LLMs. Cut command lookup from about a minute of searching PDFs to under 10 seconds, with **95% answer accuracy** on a hand-built eval set based on the teams' expected functionality." and "Built AI training modules (CV, NLP, LLMs, MLOps) and ran seminars and workshops to mentor beginner engineers." Numbers and stack from owner; model names stay off the CV (for interviews: BGE-M3, owner wrote "bg3-m3"; Llama 3.1 8B Instruct; dual NVIDIA A6000 GPUs). Interview: eval set size, who judged answers, whether lookup times were measured. | Draft, awaiting owner |
| Research Assistant | Draft: "Co-developed a Vietnamese text-to-image model combining Diffusion Models and PhoBERT (IEEE-RIVF'23, first author)." and "Improved PhoBERT for Vietnamese sentiment analysis with added linguistic features: F1 95.22% on the revised UIT-VSFC (FAIR'22)." | Decided |
| ITR internship | Remove the whole entry (owner, 2026-11-05). | Decided |
| Education | Remove only the Outstanding Freshman Scholarship. Everything else stays as it is, including the Encouragement Scholarship, research award, and all certificates (Cloud Skills Boost, Berkeley LLM Agents, TOEIC 900, both IBM). | Decided |
| Personal projects | Remove the whole section (owner, 2026-11-05). | Decided |
| Technologies | Draft: "LLM & Agents: LangGraph, LangChain, vLLM, Pydantic"; "Search & ML: Typesense, PyTorch, LightGBM, Scikit-learn, NumPy, Pandas, Polars, CVXPY"; "Backend & Fullstack: Python, TypeScript, NestJS, FastAPI, React, Vue.js, GraphQL, SQL"; "Infra: PostgreSQL, Redis, Docker, Alembic, GCP"; "Dev Environment: Bash, Git, Vim, tmux, Linux, macOS". LiteLLM stays off unless used. Playwright and Maestro stay off because the team used them, not the owner. | Draft, not yet applied |

## Changes

- 2026-11-01: created from the review conversation (2026-10-31 to 2026-11-01).
- 2026-11-02: P3 Voice Log filled in from the owner's answers and `backend/backoffice` code; draft bullet added, then updated with the eval set, voice share, and alias source. P4 Meal plans filled in from `AI/meal_planning`; draft bullet added with numbers pending.
- 2026-11-04: added P4b, the meal suggestion prototype, from `../meal-suggestions`. Recorded as a prototype on mock data; DCN-v2 and the slot and grid-search design are not recorded as built. Owner confirmed it is Wao work, so the draft bullet moves under Wao. Owner then dropped meal plans from the CV: P4's bullet and its open questions removed, facts kept for reference. Dropped the word "prototype" from P4b's bullet at the owner's request. Owner ruled out mentioning ALS or meal plans in this bullet; ALS question removed. Q4.8 resolved; bullet now states what the system does. Q2.1, Q3.13 and Q3.14 resolved; P2 and P3 bullets updated. Set the Wao bullet order and renamed the P2 bullet to "SDD workflow". Removed the production rollout sentence from the Companion bullet at the owner's request. Removed the 1,000-case figure from that bullet at the owner's request; "in a sampled run" stays because the metrics come from the 1,000-case sample, not all 3,000. Rewrote the metrics in plain language so a reader knows what each measures, and added correctness (M3b, 92%). Owner changed "sampled run" to "eval run"; the run used 1,000 of the 3,000 cases, so say so if asked. Job title set to AI Engineer (owner).
- 2026-11-04: added a Summary draft, then removed "Sole" and the papers line at the owner's request. Owner has left Wao: Summary changed to "Most recently at Wao"; end date and tense pending. Last day confirmed as 2026-11-01: Wao dates set, SDD bullet moved to past tense, and P4b moved to Personal Projects because it was built after that date. Owner corrected this: it is a Wao feature, so P4b is back under Wao, with the owner's bullet order restored.
- 2026-11-04: "Sole" kept only in the Wao context line. Wao product and result numbers removed from the bullets and Summary at the owner's request. Then hid case, query and spec counts and the simulated result, keeping only team size. Owner then restored relative gains: Recall@3 and new-meal recall.
- 2026-11-04: added a Header draft; email confirmed, GitHub left off because the owner wants recruiters on the portfolio.
- 2026-11-05: added a Uniquify draft from the owner's numbers, then added team size, stack and accuracy.
- 2026-11-05: added a Research Assistant draft. Removed ITR at the owner's request.
- 2026-11-05: Education decided. Restored Companion eval scores and voice share, and dropped "state-of-the-art" from the Research Assistant draft, as recommended and approved by the owner.
- 2026-11-05: removed Personal Projects. Kept Bash, Vim, tmux and macOS in Technologies at the owner's request. Removed Playwright and Maestro from Technologies.
- 2026-11-05: DCN-v2 and LightGBM now exist in `../meal-suggestions`; bullet updated. The owner said the system uses DCN-v2, but `ranker_choice.txt` serves LightGBM, so the bullet says that.
- 2026-11-05: removed model names from the Voice Log and Uniquify bullets at the owner's request, and BGE-M3 from Technologies to match.
- 2026-11-05: wrote the CV to `docs/resume.html` (A4, print-ready) at the owner's request. `docs/resume.tex` is unchanged.
- 2026-11-05: added header icons to `docs/resume.html`; Portfolio and LinkedIn URLs hidden behind labelled links.
- 2026-11-05: applied the longer Summary to `docs/resume.html`, chosen by the owner over the version built from outside feedback.
- 2026-11-05: removed the Summary from `docs/resume.html` and raised body text from 9pt to 9.4pt.
- 2026-11-05: rewrote the Companion bullets from the owner's text. The referral says "dietitian or doctor" per `docs/2026-09-28-companion-risk-level-model-spec.md`. Pending from owner: case count, judge agreement rate, graded reply count.
- 2026-11-05: removed the risk tiers sentence from the Companion bullet at the owner's request.
- 2026-11-05: nested the eval bullet under Companion in `docs/resume.html`.
- 2026-11-05: moved project stacks out of the bullet text and into badges in `docs/resume.html`: Companion (LangGraph JS, NestJS; Next.js, PostgreSQL and vLLM removed at the owner's request); Meal suggestions (Python, PyTorch, LightGBM, FastAPI); SDD (GitHub Spec Kit, OpenSpec, Playwright, Maestro, GitLab); Voice Log (React Native, NestJS, Typesense); Uniquify (LangGraph Python, FastAPI, Vue.js, vLLM). Body text back to 9pt so the page still fits.
- 2026-11-05: moved badges onto each bold title line in `docs/resume.html`, with the description on the next line; body text now 9.2pt.
- 2026-11-05: removed the OpenSpec and spec-driven Companion sentences from the SDD bullet at the owner's request.
- 2026-11-05: removed the aliases sentence from the Voice Log bullet at the owner's request.
- 2026-11-05: Meal suggestions metrics changed to new-meal recall@10, NDCG@5 and accept rate at the owner's request, from `two_tower_report.md`, `ranker_report.md` and `ab_report.md` dated 2026-11-05.
