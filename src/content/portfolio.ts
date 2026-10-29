import type { Portfolio } from './types'

/**
 * All site copy lives here. Everything below is PLACEHOLDER content —
 * replace it with your own bio, roles, projects and links.
 */
export const portfolio: Portfolio = {
  profile: {
    name: 'Muhsin Ahmed',
    role: 'Data Scientist & Software Engineer',
    tagline:
      'I turn messy data into models that ship — from exploratory analysis to production ML systems with clean, tested code.',
    location: 'Your City, Country',
    email: 'you@example.com',
    resumeUrl: '/resume.pdf',
    bio: [
      'I’m a data scientist with a software engineering background. I like the whole lifecycle: framing the problem with stakeholders, digging into the data, building and validating models, and getting them into production where they actually move a metric.',
      'Because I write software as well as notebooks, my models come with APIs, tests, monitoring and pipelines that other engineers are happy to own.',
    ],
    socials: [
      { label: 'GitHub', href: 'https://github.com/your-handle' },
      { label: 'LinkedIn', href: 'https://www.linkedin.com/in/your-handle' },
      { label: 'Kaggle', href: 'https://www.kaggle.com/your-handle' },
    ],
  },
  stats: [
    { value: '5+', label: 'years in data & software' },
    { value: '20+', label: 'models in production' },
    { value: '$2M', label: 'annual impact delivered' },
  ],
  skillGroups: [
    {
      name: 'Machine Learning',
      skills: ['scikit-learn', 'PyTorch', 'XGBoost', 'Time-series forecasting', 'NLP', 'Causal inference'],
    },
    {
      name: 'Data Engineering',
      skills: ['SQL', 'Spark', 'dbt', 'Airflow', 'Snowflake', 'Kafka'],
    },
    {
      name: 'Software Engineering',
      skills: ['Python', 'TypeScript', 'FastAPI', 'React', 'Docker', 'CI/CD'],
    },
    {
      name: 'MLOps & Cloud',
      skills: ['AWS', 'MLflow', 'Kubernetes', 'Feature stores', 'Model monitoring'],
    },
  ],
  experience: [
    {
      role: 'Senior Data Scientist',
      company: 'Company One',
      period: '2023 — Present',
      highlights: [
        'Led a demand-forecasting rebuild that cut forecast error by 18% across 4,000 SKUs.',
        'Designed the team’s model-serving platform (FastAPI + Docker) now used by 12 models.',
      ],
      stack: ['Python', 'LightGBM', 'FastAPI', 'AWS'],
    },
    {
      role: 'Data Scientist',
      company: 'Company Two',
      period: '2021 — 2023',
      highlights: [
        'Built a churn-propensity model that drove a retention campaign worth $1.2M/yr.',
        'Introduced experiment design guidelines and an A/B testing library.',
      ],
      stack: ['Python', 'SQL', 'scikit-learn', 'Airflow'],
    },
    {
      role: 'Software Engineer',
      company: 'Company Three',
      period: '2019 — 2021',
      highlights: [
        'Shipped data-heavy product features end to end in TypeScript and Python.',
        'Migrated analytics pipelines to dbt, halving data-refresh time.',
      ],
      stack: ['TypeScript', 'React', 'PostgreSQL', 'dbt'],
    },
  ],
  projects: [
    {
      title: 'Real-time Fraud Detection',
      summary:
        'Streaming anomaly detection on card transactions with a gradient-boosted model and a feature store for low-latency features.',
      impact: '−32% fraud losses',
      stack: ['Kafka', 'XGBoost', 'Feast', 'FastAPI'],
      repoUrl: 'https://github.com/your-handle/fraud-detection',
    },
    {
      title: 'LLM Document Q&A',
      summary:
        'Retrieval-augmented question answering over internal documents, with an evaluation harness to track answer quality.',
      impact: '4× faster support lookups',
      stack: ['Python', 'Embeddings', 'Vector DB', 'React'],
      repoUrl: 'https://github.com/your-handle/doc-qa',
      demoUrl: 'https://example.com',
    },
    {
      title: 'Demand Forecasting Platform',
      summary:
        'Hierarchical forecasts for thousands of products with automated backtesting and drift monitoring.',
      impact: 'MAPE 21% → 17%',
      stack: ['LightGBM', 'Prophet', 'Airflow', 'MLflow'],
      repoUrl: 'https://github.com/your-handle/forecasting',
    },
    {
      title: 'Customer Segmentation Explorer',
      summary:
        'Interactive 3D explorer for customer embeddings (UMAP + HDBSCAN) that lets marketing name and target segments.',
      impact: '+9% campaign CTR',
      stack: ['UMAP', 'HDBSCAN', 'Three.js', 'TypeScript'],
      demoUrl: 'https://example.com',
    },
  ],
}
