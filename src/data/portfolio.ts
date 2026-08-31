// Single source of truth for portfolio content.
// Transcribed from docs/resume.tex — update this file when the resume changes.
// Phone number from the resume is intentionally omitted from the public site.

export interface Link {
  label: string
  href: string
}

export interface ExperienceItem {
  role: string
  company: string
  period: string
  href?: string
  highlights: readonly string[]
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
  location: 'HCM City, Vietnam',
  email: { label: 'itskoiwork@gmail.com', href: 'mailto:itskoiwork@gmail.com' },
  linkedin: { label: 'LinkedIn', href: 'https://linkedin.com/in/bachkhoivo' },
}

export const experience: readonly ExperienceItem[] = [
  {
    role: 'Fullstack AI Engineer',
    company: 'Wao',
    period: 'Mar 2025 – Present',
    href: 'https://apps.apple.com/vn/app/wao-food-calorie-counter/id6737834587',
    highlights: [
      'Designed and developing the Wao Companion, an AI Agent system that leverages personalized user profiles and robust source-citation to deliver highly accurate, trustworthy nutritional information as a tailored dietary assistant.',
      'Architected and optimized a personalized AI Meal Plan Recommendation System tailored for Vietnamese dietary habits, overseeing the entire lifecycle from algorithmic design to production deployment.',
      'Engineered full-stack integration for core features, including an AI-powered Meal Scanning tool and Voice Logging system to streamline user data entry and calorie tracking.',
      'Enhanced the Vietnamese food search engine by implementing advanced NLP techniques, resulting in a 30% improvement in retrieval accuracy for localized food databases.',
    ],
  },
  {
    role: 'AI Engineer',
    company: 'Uniquify',
    period: 'Oct 2023 – Feb 2025',
    highlights: [
      'Led the development of an LLM-based chatbot for System-on-Chip (SoC) documentation, using Retrieval-Augmented Generation (RAG) with MLOps practices to optimize reliability, scalability, and real-time responsiveness.',
      'Developed a series of AI training modules in Jupyter notebooks, covering computer vision (CV), natural language processing (NLP), large language models (LLMs), and MLOps to support beginner engineers in mastering core AI concepts.',
      'Held seminars and workshops and created comprehensive internal documentation to support continuous learning, scalability, and effective knowledge sharing within the team.',
    ],
  },
  {
    role: 'Research Assistant',
    company: 'Computational Linguistics Center (CLC), HCMUS',
    period: 'Apr 2022 – Sep 2023',
    highlights: [
      'Contributed to the development of a novel Vietnamese text-to-image synthesis model, combining Diffusion Models and PhoBERT for high-fidelity image-text alignment, achieving state-of-the-art results on the UIT-ViIC dataset.',
      'Conducted research on sentiment analysis for the Vietnamese language, improving PhoBERT’s architecture and enhancing performance with additional linguistic features, resulting in an F1-score of 95.22% on the revised UIT-VSFC dataset.',
    ],
  },
  {
    role: 'AI Engineer Intern',
    company: 'ITR',
    period: 'Feb 2023 – Apr 2023',
    highlights: [
      'Led a team in an R&D project focused on automatic spelling correction in medical reports, utilizing deep learning models to improve accuracy and efficiency in domain-specific language processing for the healthcare sector.',
      'Managed team progress, assigned tasks, and ensured timely completion of milestones, fostering collaboration and high-quality outcomes throughout the project.',
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
  school: 'University of Science',
  degree: 'Bachelor of Science in Computer Science',
  period: 'Aug 2019 – Nov 2023',
  gpa: { primary: '3.74/4.0', secondary: '8.93/10' },
  awards: [
    { title: 'Outstanding Freshman Scholarship', period: '2019 intake' },
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
      title: 'LLM Agent MOOC — Mastery Tier Certificate',
      issuer: 'Berkeley RDI',
      period: 'Feb 2025',
      href: 'https://mcusercontent.com/0d89bb5c8066a9533eb98759d/files/215f6572-b834-33b9-d4bf-230306f19a56/llmagentsf24_certificate_no367.pdf',
    },
    { title: 'TOEIC 900', issuer: 'IIG Vietnam', period: 'Jun 2023' },
    {
      title: 'IBM AI Engineer Certificate',
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
    venue: "IEEE-RIVF'23",
    period: 'Dec 2023',
    authors: ['Võ Bách Khôi', 'Anh-Dung Ho', 'An-Vinh Luong', 'Dinh Dien'],
    owner: 'Võ Bách Khôi',
    doi: {
      label: '10.1109/RIVF60135.2023.10471860',
      href: 'https://doi.org/10.1109/RIVF60135.2023.10471860',
    },
  },
  {
    title: 'Sentiment Analysis for Vietnamese Language Using PhoBERT Model',
    venue: "FAIR'22",
    period: 'Dec 2022',
    authors: ['Thanh-Tu Huynh', 'Võ Bách Khôi', 'Anh-Dung Ho', 'Duc-Lung Vu'],
    owner: 'Võ Bách Khôi',
    doi: {
      label: '10.15625/vap.2022.0254',
      href: 'http://vap.ac.vn/proceedingvap/proceeding/article/view/1160',
    },
  },
]

export const technologies: readonly TechGroup[] = [
  { category: 'LLM & NLP', tools: ['LangChain', 'Pydantic', 'vLLM'] },
  { category: 'Fullstack Development', tools: ['Nest.js', 'React', 'TypeScript', 'GraphQL'] },
  {
    category: 'Infrastructure',
    tools: ['PostgreSQL', 'FastAPI', 'Docker', 'Redis', 'Alembic'],
  },
  { category: 'Cloud', tools: ['Google Cloud Platform (GCP)'] },
  {
    category: 'Data Science',
    tools: [
      'PyTorch',
      'Scikit-learn',
      'NumPy',
      'Pandas',
      'Polars',
      'CVXPY',
      'Plotly',
      'Streamlit',
      'Gradio',
    ],
  },
  {
    category: 'Development Tools',
    tools: ['Python', 'SQL', 'Bash', 'Git', 'Vim', 'tmux', 'Linux', 'macOS'],
  },
]
