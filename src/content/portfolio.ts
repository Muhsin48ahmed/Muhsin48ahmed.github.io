import type { Portfolio } from './types'

/** All site copy, taken from the CV. Edit here — the 3D world reads from this too. */
export const portfolio: Portfolio = {
  profile: {
    name: 'Muhsin Ahmed',
    role: 'Full-Stack Engineer & Data Scientist',
    tagline:
      'I build production systems end to end — Go APIs, React frontends, PostgreSQL — and bring the data science that makes them smarter.',
    location: 'Nairobi, Kenya',
    email: 'nishum48ahmed@gmail.com',
    // Public web copy (no phone number), exported from resume/ with `node build-resume.cjs … --web`.
    resumeUrl: '/resume.pdf',
    bio: [
      'I’m a full-stack software developer with a background in data science. Right now I’m building a production e-government platform that digitizes land administration, building permits, property tax, civil registration and revenue collection for a regional government.',
      'I enjoy owning features end to end — from database and API design to the interfaces citizens and officers use every day — and I bring machine learning, analytics and visualization skills to the products I build.',
    ],
    languages: ['English', 'Swahili', 'Somali', 'Arabic'],
    socials: [{ label: 'GitHub', href: 'https://github.com/Muhsin48ahmed' }],
  },
  stats: [
    { value: '53k+', label: 'applications processed on the platform I build' },
    { value: '16k+', label: 'official documents issued with QR verification' },
    { value: '<2s', label: 'search time, down from 10+ minute timeouts' },
  ],
  skillGroups: [
    { name: 'Languages', skills: ['Go', 'TypeScript', 'Python', 'SQL', 'R'] },
    { name: 'Engineering', skills: ['React', 'Remix', 'Gin', 'REST APIs', 'NATS', 'Nx', 'Tailwind'] },
    { name: 'Data & ML', skills: ['pandas', 'NumPy', 'scikit-learn', 'XGBoost', 'TensorFlow', 'NLP'] },
    { name: 'Data platforms', skills: ['PostgreSQL', 'ClickHouse', 'MySQL', 'MongoDB', 'Power BI'] },
  ],
  journey: [
    {
      period: '2022 — 2026',
      title: 'BSc Data Science & Analytics',
      org: 'USIU-Africa',
      kind: 'education',
      highlights: [
        'Degree conferred September 2026.',
        'Machine learning, data mining, big data analytics, statistical modelling, data warehousing and NLP.',
      ],
      stack: ['Python', 'R', 'SQL'],
    },
    {
      period: '2023 — 2024',
      title: 'Data Scientist & Frontend Developer',
      org: 'Faras Cabs',
      kind: 'work',
      highlights: [
        'Built Power BI dashboards tracking ride patterns, revenue trends and operational efficiency.',
        'Cleaned and analysed operational data into regular reports for business decisions.',
        'Built responsive React interfaces and contributed to backend and database work.',
      ],
      stack: ['Power BI', 'Python', 'React', 'SQL'],
    },
    {
      period: '2024',
      title: 'Data Science Core Program',
      org: 'Moringa School',
      kind: 'education',
      highlights: ['Intensive program in applied data analysis, visualization and machine learning.'],
      stack: ['pandas', 'scikit-learn', 'XGBoost'],
    },
    {
      period: '2024 — Present',
      title: 'Full-Stack Software Developer',
      org: 'One Stop Development',
      kind: 'work',
      highlights: [
        'Building a production e-government platform: 53,000+ applications since January 2026.',
        'Official document generation in Somali, Amharic and English — 16,000+ documents issued.',
        'eBirr mobile-money integration with 20,000+ payments; search cut from 10+ min to under 2 s.',
      ],
      stack: ['Go', 'PostgreSQL', 'NATS', 'React', 'Remix', 'TypeScript'],
    },
  ],
  projects: [
    {
      title: 'E-Government Platform',
      category: 'Production · Full-stack',
      summary:
        'Digitizes land administration, building permits, property tax, civil registration and revenue collection for a regional government.',
      impact: '53k+ applications · 20k+ payments',
      highlights: [
        'No-code workflow composer for versioned, multi-step approval routes.',
        'QR-verified certificates in three languages — 16,000+ issued.',
        'Executive analytics on 17 SQL views and 10 report templates, reconciled to the cent.',
      ],
      stack: ['Go', 'Gin', 'PostgreSQL', 'NATS', 'React', 'Remix', 'TypeScript'],
    },
    {
      title: 'Nairobi Surge Pricing Prediction',
      category: 'Capstone · ML + geospatial',
      summary:
        'Predicts whether a Nairobi ride-hailing trip will be surge-priced and maps where and when surge concentrates, from 3.7M trips plus weather data, triangulated with 35 driver, passenger and expert interviews.',
      impact: '3.7M trips · ROC-AUC 0.78',
      highlights: [
        'Compared six classifiers with Optuna tuning on time-ordered CV; calibrated XGBoost scored ROC-AUC 0.78 on a sealed test set.',
        'Excluded leaking features and reported honestly that surge size is not predictable from trip-level data.',
        'Mapped evening peaks (17:00–21:00), rain amplification and a CBD hotspot cluster with Folium and K-means.',
        'Three-page Streamlit dashboard (overview, hotspot map, predict), with pytest tests and full reproducibility docs.',
      ],
      stack: ['Python', 'XGBoost', 'Optuna', 'GeoPandas', 'Folium', 'Streamlit'],
      repoUrl: 'https://github.com/Muhsin48ahmed/nairobi-surge-analysis',
      charts: [
        { src: '/charts/surge-choropleth.png', alt: 'Choropleth of Nairobi neighbourhoods coloured by surge rate' },
        { src: '/charts/surge-heatmap.png', alt: 'Heatmap of mean surge multiplier by day of week and hour' },
        { src: '/charts/surge-roc.png', alt: 'ROC curve of the calibrated XGBoost classifier' },
      ],
      lab: 'surge',
    },
    {
      title: 'Unified Public Health Information System',
      category: 'Health data · Analysis',
      summary:
        'Consolidated multiple health data sources into one platform for Mombasa County, supporting public-health decisions and universal health coverage.',
      impact: 'County-wide health data platform',
      highlights: [
        'Handled data collection and analysis in a cross-functional team, from development through deployment.',
        'Improved access to data for county public-health decision-making.',
      ],
      stack: ['Data collection', 'Data analysis', 'Data integration'],
    },
    {
      title: 'Customer Churn Prediction',
      category: 'Machine learning',
      summary:
        'Churn model on 3,333 customers with 21 features. Handled class imbalance with SMOTE and compared four model families.',
      impact: '0.73 recall · 0.73 F1',
      highlights: [
        'Tuned XGBoost reached 92.4% accuracy against an 86% majority-class baseline.',
        'Translated results into customer-retention recommendations.',
      ],
      stack: ['Python', 'scikit-learn', 'XGBoost', 'SMOTE'],
      repoUrl: 'https://github.com/Muhsin48ahmed/PREDICTION-OF-CUSTOMER-CHURN',
      charts: [
        { src: '/charts/churn-roc.png', alt: 'ROC curves of the churn models on train and test sets' },
        { src: '/charts/churn-confusion.png', alt: 'Confusion matrix of the tuned XGBoost churn model on the test set' },
      ],
    },
    {
      title: 'Stream254 Recommender',
      category: 'Recommender systems',
      summary:
        'Personalized movie recommendations from 100,000+ MovieLens ratings, comparing KNN, SVD and NMF collaborative filtering.',
      impact: '100k+ ratings · 5 models compared',
      highlights: ['Evaluated with RMSE and MAE; tackled cold-start and data sparsity.'],
      stack: ['Python', 'Surprise', 'pandas'],
      repoUrl: 'https://github.com/Muhsin48ahmed/Recommendation-system-project',
      charts: [{ src: '/charts/recommender-approach.png', alt: 'Diagram comparing content-based and collaborative filtering' }],
    },
  ],
  awards: [
    {
      date: 'Sep 2026',
      title: 'Certificate of Honour — E-Government Platform Implementation',
      issuer: 'City Administration Revenue Office',
    },
    { date: 'Dec 2020', title: 'President’s Award — Gold Standard', issuer: 'The Duke of Edinburgh’s International Award' },
  ],
}
