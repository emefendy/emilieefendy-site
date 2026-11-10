import type { Faq, SceneId } from './types';

export const EMAIL = 'eefendy@college.harvard.edu';

export const SOCIALS = {
  github: 'https://github.com/emefendy',
  linkedin: 'https://www.linkedin.com/in/emilie-efendy-587153243/',
} as const;

export const REPO = 'https://github.com/emefendy/emilieefendy-site';

/** One per building, in the order the campus tags are numbered. */
export const SCENES: readonly { id: SceneId; label: string }[] = [
  { id: 'education', label: 'Education' },
  { id: 'internships', label: 'Internships' },
  { id: 'projects', label: 'Projects' },
  { id: 'awards', label: 'Awards' },
];

/** The dialog boxes on a first visit, one per Next. */
export const INTRO: readonly string[] = [
  'Hi there! I’m Emilie, a Harvard student studying computer science and physics, with a concurrent master’s in CS.',
  'A little bit about me: I’m super passionate about building projects that get used by real people, and I’ve had the chance to do that by partnering with both local and global nonprofits. I also love teaching! I lead weekly two-hour lectures for Harvard Tech for Social Good on topics like Git and React, and I host office hours as a course assistant for Theoretical Physics.',
  'I hope you enjoy exploring my site! I’ll be around if you have any questions.',
];

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
    a: 'Most recently QuEra Quantum Computing, building a data pipeline and training agents against custom evals. Before that Mercor, NC State and Rice’s quantum initiative.',
    go: 'internships',
  },
  {
    q: 'What organizations are you involved with?',
    a: [
      'At Harvard:',
      '• Harvard Tech for Social Good: I lead two cohorts and teach weekly lectures',
      '• HackHarvard: finance & corporate relations',
      '• Society of Physics Students, Innovation Labs, and Women in Entrepreneurship',
    ].join('\n'),
    go: 'education',
  },
  {
    q: 'What do you do for fun?',
    a: 'I love to run, and I’m currently training for a half marathon! I also love experimenting in the dining hall to see what new recipes I can come up with. I’ve also won some state and national competitions for cello.',
    go: 'awards',
  },
  {
    q: 'How can I reach you?',
    a: 'You can reach me through email: eefendy@college.harvard.edu. LinkedIn works too!',
    links: [
      { label: 'Email', href: 'mailto:eefendy@college.harvard.edu' },
      { label: 'LinkedIn', href: 'https://www.linkedin.com/in/emilie-efendy-587153243/' },
    ],
  },
];
