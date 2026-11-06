// Single source of truth for portfolio content.
// Transcribed from docs/resume.tex — update this file when the resume changes.
// Project descriptions differ on purpose: they say what each project does, with no evaluation results.
// Phone number from the resume is intentionally omitted from the public site.

import clcLogo from '@/assets/logos/clc.png'
import uniquifyLogo from '@/assets/logos/uniquify.jpg'
import waoLogo from '@/assets/logos/wao.webp'

export interface Link {
  label: string
  href: string
}

export type SceneId =
  | 'companion'
  | 'meals'
  | 'sdd'
  | 'voice'
  | 'rag'
  | 'text-to-image'
  | 'sentiment'

export interface Project {
  id: SceneId // also the DOM id the scroll tracking observes
  title: string
  stack: readonly string[]
  body: readonly string[] // **bold** marks what a skimming reader should catch
}

export interface ExperienceItem {
  id: string // the DOM id the scroll tracking observes
  logo: string
  about?: string
  role: string
  company: string
  period: string
  href?: string
  projects: readonly Project[]
  notes?: readonly string[]
}

export interface Award {
  title: string
  period: string
}

export interface Certification {
  title: string
  issuer: string
  period: string
  href?: string
}

export interface Publication {
  title: string
  venue: string
  period: string
  authors: readonly string[]
  owner: string
  doi: Link
}

export interface TechGroup {
  category: string
  tools: readonly string[]
}

export const profile: {
  name: string
  role: string
  location: string
  email: Link
  linkedin: Link
} = {
  name: 'Võ Bách Khôi',
  role: 'AI Engineer',
  location: 'Ho Chi Minh City, Vietnam',
  email: { label: 'itskoiwork@gmail.com', href: 'mailto:itskoiwork@gmail.com' },
  linkedin: { label: 'LinkedIn', href: 'https://linkedin.com/in/bachkhoivo' },
}

export const experience: readonly ExperienceItem[] = [
  {
    id: 'wao',
    logo: waoLogo,
    about: 'AI calorie-tracking app for Vietnamese users.',
    role: 'AI Engineer',
    company: 'Wao',
    period: 'Mar 2025 – Nov 2026',
    href: 'https://apps.apple.com/vn/app/wao-food-calorie-counter/id6737834587',
    projects: [
      {
        id: 'companion',
        title: 'Wao Companion (AI health agent, POC)',
        stack: ['LangGraph.js', 'NestJS'],
        body: [
          "Built an **LLM agent** that gives **personalized answers** to nutrition, exercise and app-support questions, based on each user's profile and in-app behavior and **grounded in nutritionist-approved guidelines**.",
          'An **input guardrail** screens each question and rewrites it if needed. A **planner** breaks it down, calls tools and turns the results into claims. An **answerer** writes the reply from a ledger of those claims, and an **output guardrail** checks that every figure comes from a tool result and every answer cites its guideline.',
        ],
      },
      {
        id: 'meals',
        title: 'Meal suggestions',
        stack: ['Python', 'PyTorch', 'LightGBM', 'FastAPI'],
        body: [
          'Built a system that **suggests meals** a user is likely to eat and that fit their day. It works out their **remaining calories and macros**, retrieves candidates from meal templates with a **two-tower model**, **optimizes each portion** to fit, then **reranks with LightGBM** on what the user is likely to accept and keep. **Rule-based safety filters** sit outside the models.',
        ],
      },
      {
        id: 'sdd',
        title: 'Spec-driven development (SDD) workflow',
        stack: ['GitHub Spec Kit', 'OpenSpec', 'Playwright', 'Maestro', 'GitLab'],
        body: [
          "**One of the first two engineers** to adopt Wao's **spec-driven AI workflow** (Sep 2025): Jira ticket → AI-written spec → task list → implementation → AI code review. **Pushed for explicit task lists** after agents lost context and shipped bugs. **Proposed agent-driven E2E testing**, adopted on web and mobile.",
        ],
      },
      {
        id: 'voice',
        title: 'Voice Log search (~20% of food logs)',
        stack: ['React Native', 'NestJS', 'Typesense'],
        body: [
          'Built the **voice-logging search pipeline**: a cloud LLM API turns a **Vietnamese transcript into structured queries** (food, brand, alternative names, tags, grams), which search the food and recipe catalog. Results are **reranked on preparation state** (raw, cooked, processed), brand and food group, so "mì bò" finds the cooked dish, not instant noodles. Also brought the **brand-aware ranking** to Meal Scan.',
        ],
      },
    ],
  },
  {
    id: 'uniquify',
    logo: uniquifyLogo,
    about: 'Semiconductor company.',
    role: 'AI Engineer',
    company: 'Uniquify',
    period: 'Oct 2023 – Feb 2025',
    projects: [
      {
        id: 'rag',
        title: 'SoC documentation chatbot',
        stack: ['LangGraph Python', 'FastAPI', 'Vue.js', 'vLLM'],
        body: [
          '**Led a 4-person team** building a **RAG chatbot** that answers questions from ~2 GB of chip-design software manuals for the SoC and IP teams. PDFs are **parsed into Markdown and indexed**, and a **LangGraph** workflow retrieves the relevant passages and answers with **self-hosted, on-premises LLMs**, so engineers can ask for a command instead of searching PDFs.',
        ],
      },
    ],
    notes: [
      'Built **AI training modules** (CV, NLP, LLMs, MLOps) and ran seminars and workshops to **mentor junior engineers**.',
    ],
  },
  {
    id: 'clc',
    logo: clcLogo,
    role: 'Research Assistant',
    about: 'Computational Linguistics Center, HCMUS',
    company: 'CLC',
    period: 'Apr 2022 – Sep 2023',
    projects: [
      {
        id: 'text-to-image',
        title: 'Vietnamese text-to-image',
        stack: [],
        body: [
          "Co-developed a **Vietnamese text-to-image model** (IEEE RIVF'23, **first author**) that generates images from Vietnamese prompts. **PhoBERT** encodes the prompt, and its features join the **diffusion model** through skip connections at different stages.",
        ],
      },
      {
        id: 'sentiment',
        title: 'Vietnamese sentiment analysis',
        stack: [],
        body: [
          "Improved **PhoBERT** for **Vietnamese sentiment analysis** by adding **linguistic features**. The model classifies a sentence as positive, neutral or negative (FAIR'22).",
        ],
      },
    ],
  },
]

export const education: {
  school: string
  degree: string
  period: string
  gpa: { primary: string; secondary: string }
  awards: readonly Award[]
  certifications: readonly Certification[]
} = {
  school: 'University of Science, VNU-HCM (HCMUS)',
  degree: 'Bachelor of Science in Computer Science',
  period: 'Aug 2019 – Nov 2023',
  gpa: { primary: '3.74/4.0', secondary: '8.93/10' },
  awards: [
    { title: 'Encouragement Scholarship', period: '2019, 2020, 2021, 2022' },
    { title: 'Outstanding Research Activities', period: '2022–2023' },
  ],
  certifications: [
    {
      title: 'Google Cloud Skills Boost — Member, Diamond League',
      issuer: 'Google',
      period: '2022 – Present',
      href: 'https://www.cloudskillsboost.google/public_profiles/06ce9d7f-cc51-478e-989d-d5fbb9b4c1d4',
    },
    {
      title: 'LLM Agents MOOC — Mastery Tier Certificate',
      issuer: 'Berkeley RDI',
      period: 'Feb 2025',
      href: 'https://mcusercontent.com/0d89bb5c8066a9533eb98759d/files/215f6572-b834-33b9-d4bf-230306f19a56/llmagentsf24_certificate_no367.pdf',
    },
    { title: 'TOEIC 900', issuer: 'IIG Vietnam', period: 'Jun 2023' },
    {
      title: 'IBM AI Engineering Certificate',
      issuer: 'Coursera',
      period: 'Sep 2022',
      href: 'https://www.coursera.org/account/accomplishments/specialization/certificate/U53TP5AD3HD3',
    },
    {
      title: 'IBM Data Science Professional Certificate',
      issuer: 'Coursera',
      period: 'Jun 2021',
      href: 'https://www.credly.com/badges/3d498c27-3706-484b-a81c-ff26b394ea8b',
    },
  ],
}

export const publications: readonly Publication[] = [
  {
    title: 'Combining Diffusion Model and PhoBERT for Vietnamese Text-to-Image Generation',
    venue: "IEEE RIVF'23",
    period: 'Dec 2023',
    authors: ['Bach-Khoi Vo', 'Anh-Dung Ho', 'An-Vinh Luong', 'Dinh Dien'],
    owner: 'Bach-Khoi Vo',
    doi: {
      label: '10.1109/RIVF60135.2023.10471860',
      href: 'https://doi.org/10.1109/RIVF60135.2023.10471860',
    },
  },
  {
    title: 'Sentiment Analysis for Vietnamese Language Using PhoBERT Model',
    venue: "FAIR'22",
    period: 'Dec 2022',
    authors: ['Thanh-Tu Huynh', 'Bach-Khoi Vo', 'Anh-Dung Ho', 'Duc-Lung Vu'],
    owner: 'Bach-Khoi Vo',
    doi: {
      label: '10.15625/vap.2022.0254',
      href: 'https://doi.org/10.15625/vap.2022.0254',
    },
  },
]

export const technologies: readonly TechGroup[] = [
  { category: 'LLM & Agents', tools: ['LangGraph', 'LangChain', 'vLLM', 'Pydantic'] },
  {
    category: 'Search & ML',
    tools: [
      'Typesense',
      'PyTorch',
      'LightGBM',
      'scikit-learn',
      'NumPy',
      'Pandas',
      'Polars',
      'CVXPY',
    ],
  },
  {
    category: 'Backend & Full-stack',
    tools: ['Python', 'TypeScript', 'NestJS', 'FastAPI', 'React', 'Vue.js', 'GraphQL', 'SQL'],
  },
  { category: 'Infra', tools: ['PostgreSQL', 'Redis', 'Docker', 'Alembic', 'GCP'] },
  { category: 'Dev Environment', tools: ['Bash', 'Git', 'Vim', 'tmux', 'Linux', 'macOS'] },
]
