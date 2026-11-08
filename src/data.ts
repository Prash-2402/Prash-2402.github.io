// All site content lives here. Keep copy free of semicolons and long dashes.

const gh = (repo: string) => `https://github.com/Prash-2402/${repo}`
const post = (id: string) => `https://www.linkedin.com/feed/update/urn:li:activity:${id}/`
const base = import.meta.env.BASE_URL

export type Link = { label: string; href: string; icon?: string }

export const profile = {
  name: 'Prajwal S Hangaragi',
  first: 'Prajwal',
  last: 'Hangaragi',
  role: 'AI and ML Engineer',
  tagline: 'I build autonomy research, AI products and secure software that hold up in the real world.',
  location: 'Bengaluru, India',
  email: 'prajwal.s.2h@gmail.com',
  phone: '+91 7204557247',
  github: 'https://github.com/Prash-2402',
  linkedin: 'https://www.linkedin.com/in/prajwal-s-hangaragi1',
  activity: 'https://www.linkedin.com/in/prajwal-s-hangaragi1/recent-activity/all/',
  resume: `${base}docs/Prajwal_S_Hangaragi_Resume.pdf`,
  avatar: `${base}docs/resumepic.png`,
  cutout: `${base}images/prajwal-cutout.webp`,
}

export const about = {
  statement:
    'I am a Computer Science student at CHRIST University specializing in AI and Machine Learning with honours in Cybersecurity. I like hard problems where intelligence and safety meet. Planetary autonomy. Deepfake detection. Tools for local shops. I turn models and algorithms into clean products that people can actually use.',
  facts: [
    { k: 'Studying', v: 'B.Tech CSE (AI and ML)', href: 'https://christuniversity.in' },
    { k: 'Honours', v: 'Cybersecurity', href: 'https://christuniversity.in' },
    { k: 'Based in', v: 'Bengaluru, India' },
    { k: 'Currently', v: 'Club Coordinator at CAADS', href: post('7515676075646185473') },
  ],
  stats: [
    { n: 11, suffix: '', label: 'Projects shipped' },
    { n: 15, suffix: '', label: 'Hackathons' },
    { n: 3, suffix: '', label: 'Podium finishes' },
    { n: 3, suffix: '', label: 'Certifications' },
  ],
}

export const skillGroups = [
  {
    title: 'Languages and Frameworks',
    icon: 'fa-code',
    skills: ['Python', 'Java', 'C++', 'JavaScript', 'TypeScript', 'React', 'React Native', 'Expo', 'Node.js', 'Express', 'FastAPI', 'Flask', 'HTML and CSS'],
  },
  {
    title: 'AI and Machine Learning',
    icon: 'fa-brain',
    skills: ['Generative AI', 'LLMs', 'Gemini AI', 'Groq AI', 'TensorFlow', 'PyTorch', 'scikit-learn', 'Reinforcement Learning (PPO)', 'OpenCV', 'Prophet', 'Whisper API'],
  },
  {
    title: 'Robotics and Autonomy',
    icon: 'fa-robot',
    skills: ['State Estimation (EKF)', 'Path Planning (A*)', 'Fault Detection', 'PyBullet', 'Gymnasium', 'Three.js'],
  },
  {
    title: 'Data, Cloud and Tools',
    icon: 'fa-database',
    skills: ['Databases', 'MySQL', 'PostgreSQL', 'Supabase', 'Firebase', 'AWS Cloud', 'Git', 'Linux'],
  },
  {
    title: 'Security',
    icon: 'fa-shield-halved',
    skills: ['Network Scanning', 'Vulnerability Assessment', 'Deepfake Detection', 'Secure API Design', 'Ethical Hacking'],
  },
  {
    title: 'Leadership and Product',
    icon: 'fa-people-group',
    skills: ['Project Planning', 'Team Coordination', 'Program Coordination', 'Club Management', 'Customer Relationship Management', 'Interpersonal Skills'],
  },
]

export type Project = {
  title: string
  kicker: string
  desc: string
  points?: string[]
  tags: string[]
  links: Link[]
  note?: string
  image?: string
}

const astra: Project = {
  title: 'ASTRA',
  kicker: 'AI-Driven System for Touchdown and Rover Autonomy',
  desc: 'A research grade platform for autonomous planetary missions. It keeps decisions safe, explainable and statistically defensible when sensors drift and parts fail.',
  points: [
    '6-DOF Mars and lunar landing with hazard aware site selection and autonomous diversion',
    'Rover autonomy with EKF estimation, A* replanning and energy aware routes',
    'CUSUM drift detection catches a sensor that lies, then isolates it',
    'Independent safety supervisor that can override the planner',
    'Matched seed trials with McNemar and Wilcoxon tests against a rule based baseline',
    'Grew out of my earlier AETHER-LAND landing project',
  ],
  tags: ['Python', 'FastAPI', 'PyBullet', 'PyTorch', 'PPO', 'EKF', 'React', 'Three.js'],
  links: [{ label: 'Read the AETHER-LAND post', href: post('7515680960860893197'), icon: 'fa-linkedin' }],
  note: 'Private research project',
}

export const projects: Project[] = [
  astra,
  {
    title: 'ZeroRot',
    kicker: 'Post harvest loss prevention with a live digital twin',
    desc: 'A phone app synced with a 3D world that follows a crop from godown to mandi. Live weather, spoilage prediction, sell or store advice, AI grading and real road truck tracking with reroutes.',
    tags: ['FastAPI', 'React', 'Three.js', 'Groq AI', 'Open-Meteo', 'OSRM'],
    links: [
      { label: 'Live demo', href: 'https://zerorot.vercel.app', icon: 'fa-arrow-up-right-from-square' },
      { label: 'Code', href: gh('ZeroRot'), icon: 'fa-github' },
    ],
  },
  {
    title: 'ShopIQ',
    kicker: 'AI powered kirana store manager',
    desc: 'A full stack mobile app for Indian kirana stores. AI demand forecasting, WhatsApp automation, voice input in Hindi and Kannada, and profit analytics. Built during the OkCredit Future Founders internship.',
    tags: ['React Native', 'Expo', 'Supabase', 'FastAPI', 'Gemini AI', 'Prophet', 'Whisper API'],
    links: [{ label: 'Code', href: gh('ShopIQ'), icon: 'fa-github' }],
  },
  {
    title: 'UnMask',
    kicker: 'AI deepfake detection',
    desc: 'Real time deepfake detection for images and videos using ensemble deep learning. Won the cybersecurity domain at FOOBAR 10.0 with 94 to 96 percent accuracy.',
    tags: ['TensorFlow', 'EfficientNetB0', 'Flask', 'OpenCV', 'MTCNN'],
    links: [
      { label: 'Live demo', href: 'https://unmask-nan8.onrender.com/', icon: 'fa-arrow-up-right-from-square' },
      { label: 'Code', href: gh('UnMask'), icon: 'fa-github' },
    ],
  },
  {
    title: 'PropagandaLens',
    kicker: 'Multilingual propaganda detector',
    desc: 'Detects 8 rhetorical manipulation techniques in English and Hindi. Includes temporal analysis, an explainable AI chat and PDF reports.',
    tags: ['Python', 'FastAPI', 'Groq AI', 'Helsinki-NLP', 'React'],
    links: [
      { label: 'Live demo', href: 'https://propaganda-lens.vercel.app/', icon: 'fa-arrow-up-right-from-square' },
      { label: 'Code', href: gh('PropagandaLens'), icon: 'fa-github' },
    ],
  },
  {
    title: 'CampusFlow AI+',
    kicker: 'AI productivity platform for students',
    desc: 'A hackathon build with deadline tracking, RAG over lecture PDFs, AI quizzes, voice mock interviews and n8n automations for Google Calendar and WhatsApp reminders.',
    tags: ['React', 'Node.js', 'Supabase', 'Groq AI', 'RAG', 'n8n'],
    links: [
      { label: 'Live demo', href: 'https://campus-flow-self-three.vercel.app', icon: 'fa-arrow-up-right-from-square' },
      { label: 'Code', href: gh('CampusFlow'), icon: 'fa-github' },
    ],
  },
  {
    title: 'Port Scanner',
    kicker: 'Port scanner and vulnerability reporter',
    desc: 'A fast TCP scanner with a live web UI. 200 concurrent threads, service mapping, high risk ports flagged with CVE references, streaming results and rate limiting.',
    tags: ['Python', 'Flask', 'Multithreading', 'SSE', 'Cybersecurity'],
    links: [{ label: 'Code', href: gh('Port'), icon: 'fa-github' }],
  },
  {
    title: 'CleanBrowse',
    kicker: 'Kid safe browsing extension',
    desc: 'A Manifest V3 Chrome extension that blocks unsafe sites and softens unsafe text in real time, backed by a custom trained text safety classifier.',
    tags: ['Chrome Extension', 'JavaScript', 'Python', 'ML Classifier'],
    links: [{ label: 'Code', href: gh('CleanBrowse'), icon: 'fa-github' }],
  },
  {
    title: 'KAPP',
    kicker: 'AI career navigator',
    desc: 'A career guidance platform that uses a multi agent setup to read resumes and generate personal learning roadmaps.',
    tags: ['Python', 'Gemini 2.5', 'React', 'Agents'],
    links: [
      { label: 'Live demo', href: 'https://kapp-rho.vercel.app/', icon: 'fa-arrow-up-right-from-square' },
      { label: 'Code', href: gh('KAPP'), icon: 'fa-github' },
    ],
  },
  {
    title: 'Code Review Tool',
    kicker: 'Static analysis web app',
    desc: 'Parses code into an AST to catch unused variables and poor coding practices before they reach review.',
    tags: ['Python', 'AST', 'JavaScript'],
    links: [
      { label: 'Live demo', href: 'https://prash-2402.github.io/code-review-tool/', icon: 'fa-arrow-up-right-from-square' },
      { label: 'Code', href: gh('code-review-tool'), icon: 'fa-github' },
    ],
  },
  {
    title: 'Fitness and TDEE',
    kicker: 'Health calculator',
    desc: 'An interactive calculator for TDEE, calorie deficit or surplus, and daily intake planning.',
    tags: ['JavaScript', 'CSS', 'Health Logic'],
    links: [
      { label: 'Live demo', href: 'https://prash-2402.github.io/fitness-calculator/', icon: 'fa-arrow-up-right-from-square' },
      { label: 'Code', href: gh('fitness-calculator'), icon: 'fa-github' },
    ],
  },
]

export type Role = {
  org: string
  role: string
  when: string
  where: string
  points: string[]
  links: Link[]
}

export const experience: Role[] = [
  {
    org: 'CAADS, CHRIST University',
    role: 'Club Coordinator',
    when: 'Jul 2026 to Present',
    where: 'Bengaluru',
    points: [
      'Coordinate club activities and technical events across AI, data science and emerging tech.',
      'Plan initiatives with faculty and student teams and grow student participation.',
      'Organised the SLAB Hackathon where builders prototyped self learning AI agents.',
    ],
    links: [
      { label: 'Role announcement', href: post('7515676075646185473'), icon: 'fa-linkedin' },
      { label: 'SLAB Hackathon', href: post('7515681568250654721'), icon: 'fa-linkedin' },
    ],
  },
  {
    org: 'SIRD, State Institute of Rural Development',
    role: 'Assistant AI Trainer',
    when: 'Nov 2026',
    where: 'CHRIST University, Kengeri',
    points: [
      'Trained participants in AI over a three day programme.',
      'Demonstrated practical AI tools and showed how they simplify everyday work.',
    ],
    links: [{ label: 'See on LinkedIn', href: profile.activity, icon: 'fa-linkedin' }],
  },
  {
    org: 'OkCredit',
    role: 'Future Founders Intern',
    when: 'May 2026 to Jul 2026',
    where: 'Remote',
    points: [
      'Led ShopIQ, a kirana management app with voice inventory in Hindi and Kannada, profit analytics and auto udhar billing.',
      'Validated merchant pain points through field research at Bengaluru stores.',
      'Built Prophet based demand forecasting to help owners stock smarter.',
      'Received a letter of recommendation on completion.',
    ],
    links: [
      { label: 'Recommendation', href: post('7515675044480585728'), icon: 'fa-linkedin' },
      { label: 'ShopIQ code', href: gh('ShopIQ'), icon: 'fa-github' },
      { label: 'OkCredit', href: 'https://okcredit.in', icon: 'fa-arrow-up-right-from-square' },
    ],
  },
  {
    org: 'Hindustan Aeronautics Limited',
    role: 'Developer Intern',
    when: 'Mar 2026 to Apr 2026',
    where: 'Bengaluru',
    points: [
      'Interned at the Mission and Combat System Research and Design Centre (MCSRDC).',
      'Worked with C++ and databases with hands on exposure to aerospace engineering.',
    ],
    links: [
      { label: 'Internship post', href: post('7515676957766819840'), icon: 'fa-linkedin' },
      { label: 'HAL', href: 'https://hal-india.co.in', icon: 'fa-arrow-up-right-from-square' },
    ],
  },
  {
    org: 'CHRIST University',
    role: 'B.Tech CSE (AI and ML), Honours in Cybersecurity',
    when: '2024 to 2028',
    where: 'Bengaluru',
    points: [
      'Coursework across deep learning, data engineering, program analysis, secure systems and cryptography.',
    ],
    links: [{ label: 'University', href: 'https://christuniversity.in', icon: 'fa-arrow-up-right-from-square' }],
  },
]

export const achievements = [
  {
    result: 'Winner',
    event: 'FOOBAR 10.0 Hackathon',
    detail: 'Cybersecurity domain. 24 hours. Built the UnMask deepfake detector.',
    href: 'https://unmask-nan8.onrender.com/',
    cta: 'See UnMask',
  },
  {
    result: '3rd Place',
    event: 'AfterHours 1.0',
    detail: 'Top 4 of 54 inter college teams in a 24 hour hackathon at DBIT Bengaluru. Oct 2026.',
    href: post('7523430879504007168'),
    cta: 'Read post',
  },
  {
    result: 'Runner Up',
    event: 'CodeStorm 2026, Karnataka Edition',
    detail: 'Organised by the Department of ADSE at CHRIST University with UNILOX.',
    href: post('7515678033589235714'),
    cta: 'Read post',
  },
  {
    result: '15+',
    event: 'Hackathons participated',
    detail: 'Competed in 15 plus hackathons across AI, cybersecurity and product, from 24 hour sprints to 8 week programmes.',
    href: profile.activity,
    cta: 'See my journey',
  },
]

export const certifications = [
  { name: 'AWS Academy Graduate, Cloud Foundations', issuer: 'Amazon Web Services', date: 'Sep 2026', href: 'https://www.credly.com/go/091VpuiW' },
  { name: 'Getting Started with Generative AI', issuer: 'IBM', date: 'Oct 2025', href: 'https://www.credly.com/go/iyNiZIsw' },
  { name: 'Artificial Intelligence Fundamentals', issuer: 'IBM', date: 'Sep 2025', href: 'https://www.credly.com/badges/c1b5cba5-7a1b-460f-bd23-c0aa5be045fe' },
]

// Screenshots shown on each project card and in the detail view
const shots: Record<string, string> = {
  ASTRA: 'astra',
  ZeroRot: 'zerorot',
  ShopIQ: 'shopiq',
  UnMask: 'unmask',
  PropagandaLens: 'propagandalens',
  'CampusFlow AI+': 'campusflow',
  'Port Scanner': 'port',
  CleanBrowse: 'cleanbrowse',
  KAPP: 'kapp',
  'Code Review Tool': 'codereview',
  'Fitness and TDEE': 'fitness',
}
projects.forEach(p => {
  if (shots[p.title]) p.image = `${base}images/projects/${shots[p.title]}.webp`
})
