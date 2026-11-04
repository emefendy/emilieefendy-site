export const EMAIL = 'eefendy@college.harvard.edu';

export type Link = { label: string; href: string };

export const SOCIALS = {
  github: 'https://github.com/emefendy',
  linkedin: 'https://www.linkedin.com/in/emilie-efendy-587153243/',
} as const;

export type SceneId = 'education' | 'experience' | 'projects' | 'extras';

/** The four buildings you can walk into, in the order the tags are numbered. */
export const SCENES: readonly { id: SceneId; label: string; title: string }[] = [
  { id: 'education', label: 'Education', title: 'Education' },
  { id: 'experience', label: 'Experience', title: 'Experience' },
  { id: 'projects', label: 'Projects', title: 'Projects' },
  { id: 'extras', label: 'Extras', title: 'Extras' },
];

export type Experience = {
  org: string;
  role: string;
  meta: string;
  desc: string[];
  stack: string[];
};

export const EXPERIENCE: Experience[] = [
  {
    org: 'QuEra Quantum Computing',
    role: 'Data Engineering Intern',
    meta: 'Cambridge, MA · Jun 2026 – Aug 2026',
    desc: [
      'Built an end-to-end Python pipeline that pulls messy testbed data into a Postgres backend you can query with SQL, deployed a dashboard for it on a Linux VM, and presented the work to executives.',
      'Trained three agents (data, analysis and FDTD simulation optimization) with custom evals to improve their harness.',
      'I also worked on the Anthropic × QuEra pilot of a then-unreleased package for research agents.',
    ],
    stack: ['Python', 'Postgres', 'SQL', 'Agents', 'Evals'],
  },
  {
    org: 'Mercor',
    role: 'Project Manager',
    meta: 'San Francisco, CA · May 2026 – Jun 2026',
    desc: [
      'Organized 100+ domain experts and ran internal trainings on eval design and trajectory analysis. Raised the share of submissions passing benchmarks set by frontier AI lab clients from 41% to 85%.',
      'Built a Python and React dashboard that lets experts visualize and explore very large datasets intuitively.',
    ],
    stack: ['Evals', 'Python', 'React', 'Operations'],
  },
  {
    org: 'Katmai Computing',
    role: 'Go-to-Market Intern',
    meta: 'Palo Alto, CA · Harvard Innovation Labs startup · Jun 2025 – Aug 2025',
    desc: [
      'Built the CRM for the seed fundraising sprint, tracking 100+ CEOs, investors and funds including Sequoia, a16z and 8VC, and researched the funding rounds and lead investors of 200+ startups. Independently secured an investor call with Quantonation, a global VC firm focused on quantum technologies, and managed the first cohort of clients.',
      'On the research team, developed software modules that connect quantum hardware readings to user-interface components.',
    ],
    stack: ['Fundraising', 'Go-to-market', 'CRM', 'Software'],
  },
  {
    org: 'NC State Department of Computer Science',
    role: 'Software Engineering Intern',
    meta: 'Raleigh, NC · Jun 2023 – Aug 2023',
    desc: [
      'On an NSF-funded project under Dr. Veronica Catete, programmed Python applications used in under-resourced K-12 classrooms to bring computational thinking into non-STEM courses.',
      'Led user testing with educators and students, then refined each app around their feedback.',
    ],
    stack: ['Python', 'Education', 'User research'],
  },
  {
    org: 'Rice University Quantum Initiative',
    role: 'Quantum Applications Student Researcher',
    meta: 'Houston, TX · Jan 2023 – Aug 2025 · with Dr. Tirthak Patel',
    desc: [
      'Proposed and led a lab team researching applications of Grover’s algorithm in k-SAT problems, and worked on QCAiEd, a multidisciplinary project with Rice’s Education Department under a Rice Undergraduate Scholars Program grant.',
    ],
    stack: ['Quantum computing', 'Qiskit', 'Grover’s algorithm'],
  },
];

export const HARVARD_COURSES = [
  'Theoretical Physics (Course/Teaching Assistant)',
  'Machine Learning',
  'Reinforcement Learning',
  'Quantum Mechanics',
  'Systems Programming & Machine Organization',
  'Data Structures & Algorithms',
  'Algorithms & Limitations',
  'Real Analysis',
  'Proof-based Linear Algebra & Vector Calculus',
  'Probability',
  'Game Theory for Social Behavior',
  'Evolving Morality: From Primordial Soup to Superintelligent Machines',
];

export const ORGS: { name: string; role?: string }[] = [
  { name: 'Harvard Tech for Social Good', role: 'Executive Board & Senior Software Engineer' },
  { name: 'HackHarvard', role: 'Finance & Corporate Relations' },
  { name: 'Harvard Women in Computer Science' },
  { name: 'Society of Physics Students' },
  { name: 'Harvard Innovation Labs' },
  { name: 'Harvard Women in Entrepreneurship' },
];

export const HS_COURSES = [
  'Modern Physics',
  'Multivariable Calculus',
  'Data Structures & Algorithms',
  'Organic Chemistry',
  'AP Computer Science A',
  'AP Physics 1, 2 & C',
  'AP Statistics',
  'AP Calculus BC',
];

/* ---------- works ---------- */

export type Slide = { full: string; thumb: string; caption: string; label: string };

export type Media =
  | { kind: 'deck'; layout: 'wide' | 'portrait'; label: string; slides: Slide[] }
  | { kind: 'preview'; href: string; host: string; src: string; alt: string; width: number; height: number };

export type Block = { kind: 'p'; text: string } | { kind: 'list'; items: string[] };

export type Work = {
  slug: string;
  title: string;
  /** a few words for the index row */
  tags: string;
  /** what floats next to the cursor in the index; logos get a white card */
  cover: { src: string; kind: 'logo' | 'shot' };
  nonprofit?: boolean;
  logo?: { src: string; alt: string };
  when?: string;
  body: Block[];
  media?: Media;
  links: Link[];
  /** extra words the command palette should match on */
  keywords?: string;
};

function deck(dir: string, n: number, caption: (i: number) => string, label: (i: number) => string): Slide[] {
  return Array.from({ length: n }, (_, k) => {
    const i = k + 1;
    const nn = String(i).padStart(2, '0');
    return { full: `decks/${dir}/${nn}.jpg`, thumb: `decks/${dir}/t${nn}.jpg`, caption: caption(i), label: label(i) };
  });
}

const ALSF_SCREENS = ['Fundraisers near you', 'Personal fundraising page', 'Quick-start guide', 'FAQ', 'Lemonade points'];

export const WORKS: Work[] = [
  {
    slug: 'chw-central',
    tags: 'RAG · WordPress · Lead engineer',
    cover: { src: 'logos/chw-central.png', kind: 'logo' },
    title: 'Central Healthcare Workers',
    nonprofit: true,
    logo: { src: 'logos/chw-central.png', alt: 'CHW Central logo' },
    keywords: 'rag semantic search wordpress php openai embeddings chatbot',
    body: [
      {
        kind: 'p',
        text: 'CHW Central is a nonprofit library for people who run community health worker programs around the world: program managers, researchers, trainers and CHWs themselves. Started in 2011 with early support from USAID, it hosts case studies, journal articles, training materials and stories from community health workers, working toward a world where everyone in need can reach a trained and supported CHW.',
      },
      {
        kind: 'list',
        items: [
          'As Senior SWE, led five engineers and met with the client weekly',
          'Built a WordPress plugin that adds semantic search and a RAG chatbot over 3,600+ resources for 60,000+ users',
          'Indexer chunks every post, embeds it with OpenAI text-embedding-3-small, stores the vectors in MySQL, and re-indexes on save, using content hashes to skip posts that haven’t changed',
          'PHP REST endpoint embeds the query and cosine-ranks it against the full corpus or a taxonomy-filtered subset (language, region, health area, resource type), with query embeddings and results cached',
          'RAG answers send the top five excerpts to the OpenAI Responses API with a strict JSON schema, then map the cited source IDs back to WordPress permalinks',
          'Cross-lingual retrieval across English, French, Spanish and Portuguese, plus a JavaScript frontend that drops onto any page with a shortcode and a site-wide floating Q&A widget',
        ],
      },
    ],
    links: [
      { label: 'Website', href: 'https://chwcentral.org/' },
      { label: 'Code', href: 'https://github.com/htong1/chwcentral-search' },
    ],
  },
  {
    slug: 'computers-4-people',
    tags: 'Electron · Next.js · Computer use',
    cover: { src: 'logos/computers-4-people.png', kind: 'logo' },
    title: 'Computers 4 People',
    nonprofit: true,
    logo: { src: 'logos/computers-4-people.png', alt: 'Computers 4 People logo' },
    keywords: 'granson electron next react computer use voice i18n',
    body: [
      {
        kind: 'p',
        text: 'Computers 4 People is a nonprofit that refurbishes donated computers for low-income families. Granson AI is a desktop assistant that walks people with little computer experience through the everyday digital tasks they get stuck on.',
      },
      {
        kind: 'list',
        items: [
          'Electron overlay over a Next.js/React app, toggled from anywhere with a global hotkey (Cmd/Ctrl+Shift+Space)',
          'Tool-calling chat: the model decides when it needs to see the screen, triggers a capture through Electron’s desktopCapturer, and answers from the screenshot in a second pass',
          'Interactive tutorials that use Claude’s Computer Use API to turn plain-English targets (“the Gmail icon, top right”) into screen coordinates at runtime, so steps work on any layout',
          'Voice input through OpenAI speech-to-text, read-aloud answers through OpenAI text-to-speech, and an English/Spanish interface built on react-i18next',
        ],
      },
    ],
    links: [
      { label: 'Website', href: 'https://www.computers4people.org/' },
      { label: 'Code', href: 'https://github.com/saranyasingh/t4sg-c4p-2026' },
    ],
  },
  {
    slug: '412-food-rescue',
    tags: 'i18n · 3 languages',
    cover: { src: 'logos/412-food-rescue.png', kind: 'logo' },
    title: '412 Food Rescue',
    nonprofit: true,
    logo: { src: 'logos/412-food-rescue.png', alt: '412 Food Rescue logo' },
    keywords: 'angular ngx-translate i18n translation hero app',
    body: [
      {
        kind: 'p',
        text: '412 Food Rescue is a Pennsylvania nonprofit that keeps good food out of landfills and gets it to people facing food insecurity, powered by thousands of volunteer drivers.',
      },
      {
        kind: 'list',
        items: [
          'Built the translation system for its Food Rescue Hero app with ngx-translate, pulling every hard-coded label, button, dialog and message into one dictionary that loads the chosen language on demand',
          'The app now runs in English, Spanish and French, with 818 translation keys across 50+ feature areas, from onboarding to the full rescue workflow',
        ],
      },
    ],
    links: [
      { label: 'Website', href: 'https://412foodrescue.org/' },
      { label: 'Code', href: 'https://github.com/412FoodRescue/app-distribution-server' },
    ],
  },
  {
    slug: 'steel-city-codes',
    tags: 'Director · Hackathons',
    cover: { src: 'previews/scc.jpg', kind: 'shot' },
    title: 'Steel City Codes',
    nonprofit: true,
    logo: { src: 'logos/steel-city-codes.png', alt: 'Steel City Codes logo' },
    when: 'Houston Director · Executive Director of Special Events',
    keywords: 'hackathon houston director camps',
    body: [
      {
        kind: 'list',
        items: [
          'Led the largest Steel City Codes region in the world (16 chapters, 400+ students)',
          'Organized the annual International SCC Hackathon, with $12,000+ in prizes from Wolfram, Inspirit AI and MRI Software in 2024',
          'Organized three fundraisers to provide week-long camps for Title 1 schools',
          'Spearheaded a partnership with Fort Bend ISD',
          'Ran two summer camps',
          'Started the Executive Special Events team',
        ],
      },
    ],
    media: {
      kind: 'preview',
      href: 'https://schwinter2024.devpost.com/',
      host: 'schwinter2024.devpost.com',
      src: 'previews/scc.jpg',
      alt: 'Steel City Hacks 2024 Winter Hackathon page on Devpost: Feb 9–18, 2024, $12,220 in prizes, 130 participants',
      width: 800,
      height: 440,
    },
    links: [{ label: 'Steel City Hacks 2024', href: 'https://schwinter2024.devpost.com/' }],
  },
  {
    slug: 'alsf',
    tags: 'UX · Figma',
    cover: { src: 'decks/alsf/01.jpg', kind: 'shot' },
    title: 'Alex’s Lemonade Stand Foundation',
    nonprofit: true,
    logo: { src: 'logos/alsf.png', alt: 'Alex’s Lemonade Stand Foundation logo' },
    keywords: 'figma ux design lemonade days app',
    body: [
      {
        kind: 'p',
        text: 'Alex’s Lemonade Stand Foundation is the largest independent childhood cancer charity in the U.S. It began in 2000 with a front-yard lemonade stand run by 4-year-old Alex Scott, who was fighting cancer herself, and has since funded more than 1,500 research projects at nearly 150 institutions.',
      },
      { kind: 'p', text: 'UX design for ALSF’s annual Lemonade Days app:' },
      {
        kind: 'list',
        items: [
          'A map of lemonade stands near you, so supporters can find one and see how far away it is',
          'A page for each stand with its fundraising goal and progress, the host, time and place, and buttons to donate or RSVP',
          'A quick-start guide that walks first-time hosts through getting supplies, sharing their page and running the stand',
          'Lemonade points, earned by donating, going to events and sharing, that fill up a pitcher and unlock rewards',
        ],
      },
    ],
    media: {
      kind: 'deck',
      layout: 'portrait',
      label: 'Figma preview · 5 screens',
      slides: deck(
        'alsf',
        5,
        (i) => `Lemonade Days · ${ALSF_SCREENS[i - 1]}`,
        (i) => `Lemonade Days screen ${i} of 5: ${ALSF_SCREENS[i - 1]}`,
      ),
    },
    links: [
      { label: 'Website', href: 'https://www.alexslemonade.org/' },
      {
        label: 'Figma',
        href: 'https://www.figma.com/design/xwUC7y0nRId7dV2QzZQeQk/Alex-s-Lemonade-Stand-Foundation-App-Design?node-id=0-1&t=exShkNWUZ9kSTrlF-0',
      },
    ],
  },
  {
    slug: 'first-racquet',
    tags: 'UX · iOS',
    cover: { src: 'decks/first-racquet/02.jpg', kind: 'shot' },
    title: 'First Racquet',
    nonprofit: true,
    keywords: 'tennis ios app ux design angola',
    body: [
      {
        kind: 'p',
        text: 'First Racquet is an international tennis nonprofit that connects 750+ Angolan athletes with accessible tennis equipment and athletic wear.',
      },
      { kind: 'p', text: 'UX design for First Racquet’s iOS app:' },
      {
        kind: 'list',
        items: [
          'An events feed for hitting events and fundraisers, with what to bring, where to go and a button to register',
          'A volunteer hours tracker showing progress toward the Bronze, Silver and Gold President’s Volunteer Service Award',
          'Pages on what the nonprofit stands for and how it works, from equipment drives to tournaments',
          'A resources hub with donations through Apple Pay and Zelle, sponsor and volunteer forms, player waivers and a contact form',
        ],
      },
    ],
    media: {
      kind: 'deck',
      layout: 'portrait',
      label: 'App design · 16 slides',
      slides: deck(
        'first-racquet',
        16,
        (i) => `First Racquet x Apps for Impact · ${i} of 16`,
        (i) => `First Racquet x Apps for Impact slide ${i} of 16`,
      ),
    },
    links: [{ label: 'Website', href: 'https://firstracquet.org/' }],
  },
  {
    slug: 'breakthrough',
    tags: 'Physics · Global finalist',
    cover: { src: 'previews/bjc.jpg', kind: 'shot' },
    title: 'Breakthrough Junior Challenge',
    when: 'Global Physics Finalist, 1 of 5 ($400K grand prize)',
    keywords: 'physics higgs video science communication finalist',
    body: [
      {
        kind: 'p',
        text: '1 of 5 international finalists for a global science communication competition with a $400K prize.',
      },
      {
        kind: 'p',
        text: 'Advanced through three judging rounds of interviews, essays and public voting from 140K+ viewers, with a panel that included Terence Tao, Sal Khan and Scott Kelly. Contracted with Rubenstein Public Relations.',
      },
    ],
    media: {
      kind: 'preview',
      href: 'https://breakthroughjuniorchallenge.org/winners/2024',
      host: 'breakthroughjuniorchallenge.org',
      src: 'previews/bjc.jpg',
      alt: 'Breakthrough Junior Challenge 2024 finalists page, showing Emilie Efendy’s Higgs field entry among the finalists',
      width: 608,
      height: 392,
    },
    links: [{ label: '2024 Finalists', href: 'https://breakthroughjuniorchallenge.org/winners/2024' }],
  },
  {
    slug: 'evergreen',
    tags: 'SwiftUI · Pitch',
    cover: { src: 'decks/evergreen/01.jpg', kind: 'shot' },
    title: 'For Evergreen',
    when: 'Pitched @ Technovation Houston · 2024',
    keywords: 'swiftui ios climate carbon gpt pitch',
    body: [
      {
        kind: 'p',
        text: 'A gamified learning experience for living greener. As you cut your carbon footprint, the trees on your own 3-D island grow. The iOS app, built with SwiftUI, also has a GPT-4 chatbot, a carbon-footprint calculator and short articles on climate change.',
      },
    ],
    media: {
      kind: 'deck',
      layout: 'wide',
      label: 'Pitch deck · 10 slides',
      slides: deck(
        'evergreen',
        10,
        (i) => `For Evergreen · ${i} of 10`,
        (i) => `For Evergreen slide ${i} of 10`,
      ),
    },
    links: [],
  },
  {
    slug: 'wecode',
    tags: 'Programming · Conference',
    cover: { src: 'previews/wecode.jpg', kind: 'shot' },
    title: 'Harvard WECode x Build@HUB Vietnam',
    when: 'Director of Programming · Harvard WECode',
    keywords: 'conference women in tech panel vietnam',
    body: [
      {
        kind: 'p',
        text: 'WECode is the world’s largest student-run undergraduate women in tech conference, founded in 2014 by Harvard Undergraduate Women in Computer Science. The 2025 conference brought together 790 attendees from 220 colleges and 36 countries.',
      },
      {
        kind: 'p',
        text: 'Build@HUB is a competition backed by HUB Network and the Hanoi Youth Union that has grown across 10 regions, supporting 100+ student startups and 2,100+ young innovators.',
      },
      {
        kind: 'list',
        items: [
          'As Director of Programming, organized the Harvard WECode x Build@HUB Vietnam panel, bringing women-in-tech speakers in front of hundreds of students',
        ],
      },
    ],
    media: {
      kind: 'preview',
      href: 'https://www.wecodeconference.com/',
      host: 'wecodeconference.com',
      src: 'previews/wecode.jpg',
      alt: 'Harvard WECode conference homepage: Harvard Undergraduate Women in Computer Science',
      width: 800,
      height: 440,
    },
    links: [{ label: 'Harvard WECode', href: 'https://www.wecodeconference.com/' }],
  },
];

export const RECOGNITION: { title: string; sub: string }[] = [
  { title: 'Global Physics Finalist, 1 of 5 ($400K grand prize)', sub: 'Breakthrough Junior Challenge' },
  {
    title: 'Science Olympiad: Regional, State and National Invitational Medalist',
    sub: 'Main Events: Astronomy, Experimental Design, Optics, Wind Power, WIDI/WICI',
  },
  { title: '1st Chair Cellist', sub: '80th International Midwest Convention · Chicago' },
  { title: 'All-State Symphony Cellist', sub: 'Texas Music Educators Association' },
  { title: '1st Place, Advanced Division', sub: 'Texas Digital Divas Programming Competition' },
  { title: 'Affiliate Winner', sub: 'National Center for Women & Information Technology Aspirations in Computing' },
  { title: 'National Merit Scholar', sub: 'NMSC' },
  { title: 'Most Likely to Beat Mr. Shah in a Physics Pun Battle', sub: 'Clements Junior Engineering Technical Society' },
];

export const PROGRAMS = [
  'MIT Quantum Winter School',
  'Point72 Spring Academy',
  'D.E. Shaw Connect',
  'Inside DRW',
  'Two Sigma New Seekers Summit',
];

/* ---------- talking to me ---------- */

/** The dialog boxes on a first visit, one per Next. */
export const INTRO: readonly string[] = [
  'Hi there! I’m Emilie, a Harvard student studying computer science and physics, with a concurrent master’s in CS.',
  'I hope you enjoy exploring my site! I’ll be around if you have any questions.',
];

export type Faq = {
  q: string;
  a: string;
  /** a building the answer points to */
  go?: SceneId;
  links?: Link[];
  /** special answers the landing page handles itself */
  special?: 'replay';
};

export const FAQ: readonly Faq[] = [
  {
    q: 'What do you study?',
    a: 'Computer science and physics at Harvard, with a concurrent master’s in CS. Some of my favorite classes: Theoretical Physics (I hold office hours and help with grading), Machine Learning, Systems Programming, and Evolving Morality: From Primordial Soup to Superintelligent Machines!',
    go: 'education',
  },
  {
    q: 'What have you built/worked on?',
    a: [
      '0 → 1 projects, used by thousands of users worldwide:',
      '• CHW Central: AI search + chatbot for 60,000+ health workers',
      '• Computers 4 People: an AI helper for first-time computer users',
      '• 412 Food Rescue: its app in Spanish and French for volunteers',
      '• Steel City Codes: led 16 chapters, 400+ students',
    ].join('\n'),
    go: 'projects',
  },
  {
    q: 'Where have you worked?',
    a: 'Most recently QuEra Quantum Computing, building a data pipeline and training agents against custom evals. Before that Mercor, Katmai Computing, NC State and Rice’s quantum initiative.',
    go: 'experience',
  },
  {
    q: 'Do you teach?',
    a: 'Yes! I lead two cohorts at Harvard Tech for Social Good with a two-hour lecture every week, and I hold office hours and help with grading for Theoretical Physics.',
  },
  {
    q: 'What do you do for fun?',
    a: 'I love to run, and I’m currently training for a half marathon! I also love experimenting in the dining hall to see what new recipes I can come up with.',
    go: 'extras',
  },
  {
    q: 'How can I reach you?',
    a: 'Email is best, I read everything: eefendy@college.harvard.edu. I’m on GitHub and LinkedIn too.',
    links: [
      { label: 'Email', href: 'mailto:eefendy@college.harvard.edu' },
      { label: 'GitHub', href: 'https://github.com/emefendy' },
      { label: 'LinkedIn', href: 'https://www.linkedin.com/in/emilie-efendy-587153243/' },
    ],
  },
  { q: 'Can I see the intro again?', a: '', special: 'replay' },
];
