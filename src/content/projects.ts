import { deck } from './deck';
import type { Project } from './types';

const ALSF_SCREENS = [
  'Fundraisers near you',
  'Personal fundraising page',
  'Quick-start guide',
  'FAQ',
  'Lemonade points',
];

export const PROJECTS: readonly Project[] = [
  {
    slug: 'chw-central',
    tags: 'Senior SWE · RAG · WordPress',
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
    tags: 'SWE · Electron · Next.js · Computer use',
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
    tags: 'SWE · i18n · 3 languages',
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
    tags: 'Executive Director of Events · Hackathons',
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
    tags: 'Project Lead · UX · Figma',
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
    tags: 'Project Lead · UX · iOS',
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
    tags: 'Researcher · Physics · Global finalist',
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
    tags: 'iOS Developer · SwiftUI · Pitch',
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
    tags: 'Executive Director of Programming · Conference',
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
