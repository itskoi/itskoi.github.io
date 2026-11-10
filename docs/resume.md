# Võ Bách Khôi

Ho Chi Minh City, Vietnam · [itskoiwork@gmail.com](mailto:itskoiwork@gmail.com) · +84 944 157 219 · [Portfolio](https://itskoi.github.io/) · [LinkedIn](https://linkedin.com/in/bachkhoivo)

## Experience

### **AI Engineer** @ [Wao](https://apps.apple.com/vn/app/wao-food-calorie-counter/id6737834587) | Mar 2025 – Nov 2026

*AI calorie-tracking app for Vietnamese users. Sole AI engineer on a \~6-person product team.*

- **Wao Companion (AI health agent, POC)** `LangGraph (JS)` `NestJS`\
  Built an LLM agent that answers nutrition, exercise and app-support questions, personalized to each user's profile and behavior and grounded in nutritionist-approved guidelines. Guardrails check that every figure comes from a tool result and every answer cites a guideline.
  - Built the eval with the QC, PO and nutrition teams: 1,000 hand-written test cases, guideline-match checks and a human-validated LLM tone judge. The agent chose correctly to answer, clarify or decline in **93%** of cases. Of graded replies, **95%** were complete, **92%** factually correct and **89%** grounded in user data or guidelines.
- **Meal suggestions** `Python` `PyTorch` `LightGBM` `FastAPI`\
  Built a system that suggests meals a user is likely to eat and that fit their remaining calories and macros. Two-tower retrieval finds candidate meals, then a ranker predicts which ones the user will accept and keep logging. Portion fitting and rule-based safety filters run outside the models. Chose LightGBM over DCN-v2, which gave no significant gain. Offline, on simulated users: **new-meal recall@10 +59%** over popularity, **NDCG@5 +5%** over frequency ranking and **accept rate +13%** over no ranker. Shipped to 10% of users in beta.
- **Voice Log search (\~20% of food logs)** `React Native` `NestJS` `Typesense`\
  Built the search pipeline behind voice logging. A cloud LLM turns a Vietnamese transcript into structured queries (food, brand, alternative names, tags, grams). These search the food and recipe catalog, and results are reranked by preparation state (raw, cooked, processed), brand and food group. **Recall@3 up 30 percentage points** over keyword search alone, on 500 hand-labeled queries. Reused the brand-aware ranking in Meal Scan (photo logging).
- **Spec-driven development (SDD) workflow** `GitHub Spec Kit` `Playwright` `Maestro`\
  One of the first two engineers on Wao's spec-driven AI workflow (Sep 2025): Jira ticket → AI-written spec → task list → implementation → AI code review. Added explicit task lists after agents lost context mid-task and shipped bugs. Proposed agent-run end-to-end tests, now used on web and mobile.

### **AI Engineer** @ Uniquify | Oct 2023 – Feb 2025

- **SoC documentation chatbot** `LangGraph Python` `FastAPI` `Vue.js` `vLLM`\
  Led a 4-person team building a RAG chatbot over \~2 GB of chip-design software manuals for the SoC and IP teams, using self-hosted, on-premises LLMs. Cut command lookup from about a minute of searching PDFs to under 10 seconds, with **95% answer accuracy** on a hand-built eval set based on the teams' real lookup tasks.
- Built AI training modules (CV, NLP, LLMs, MLOps) and ran seminars and workshops to mentor the AI team.

### **Research Assistant** @ Computational Linguistics Center (CLC), HCMUS | Apr 2022 – Sep 2023

- Co-developed a Vietnamese text-to-image model combining diffusion models and PhoBERT (IEEE RIVF'23, first author).
- Improved PhoBERT for Vietnamese sentiment analysis with added linguistic features: **F1 95.22%** on the revised UIT-VSFC (FAIR'22).

## Education

### **University of Science, VNU-HCM (HCMUS)**

*Bachelor of Science in Computer Science*

**GPA:** **3.74**/4.0 (**8.93**/10) | Aug 2019 – Nov 2023

**Awards:**

- Recipient of the **Encouragement Scholarship** for academic years 2019, 2020, 2021 and 2022
- Recognized for **Outstanding Research Activities** during the academic year 2022–2023

## Certifications

- **Google Cloud Skills Boost**, [Member – Diamond League](https://www.cloudskillsboost.google/public_profiles/06ce9d7f-cc51-478e-989d-d5fbb9b4c1d4) | 2022 – Present
- **Berkeley RDI**, [LLM Agents MOOC – Mastery Tier Certificate](https://mcusercontent.com/0d89bb5c8066a9533eb98759d/files/215f6572-b834-33b9-d4bf-230306f19a56/llmagentsf24_certificate_no367.pdf) | Feb 2025
- **IIG Vietnam**, TOEIC **900** | Jun 2023
- **Coursera**, [IBM AI Engineering Certificate](https://www.coursera.org/account/accomplishments/specialization/certificate/U53TP5AD3HD3) | Sep 2022
- **Coursera**, [IBM Data Science Professional Certificate](https://www.credly.com/badges/3d498c27-3706-484b-a81c-ff26b394ea8b?source=linked_in_profile) | Jun 2021

## Publications

### **Combining Diffusion Model and PhoBERT for Vietnamese Text-to-Image Generation** | *IEEE RIVF'23* | Dec 2023

***Bach-Khoi Vo***, Anh-Dung Ho, An-Vinh Luong, Dinh Dien. **DOI:** [*10.1109/RIVF60135.2023.10471860*](https://doi.org/10.1109/RIVF60135.2023.10471860)

### **Sentiment Analysis for Vietnamese Language Using PhoBERT Model** | *FAIR'22* | Dec 2022

Thanh-Tu Huynh, ***Bach-Khoi Vo***, Anh-Dung Ho, Duc-Lung Vu. **DOI:** [*10.15625/vap.2022.0254*](https://doi.org/10.15625/vap.2022.0254)

## Technologies

- **LLM & Agents:** LangGraph, LangChain, vLLM, Pydantic
- **Search & ML:** Typesense, PyTorch, LightGBM, scikit-learn, NumPy, Pandas, Polars, CVXPY
- **Backend & Full-stack:** Python, TypeScript, NestJS, FastAPI, React, Vue.js, GraphQL, SQL
- **Infra:** PostgreSQL, Redis, Docker, Alembic, GCP
- **Dev Environment:** Bash, Git, Vim, tmux, Linux, macOS
