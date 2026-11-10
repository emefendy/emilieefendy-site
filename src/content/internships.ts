import { deck } from './deck';
import type { Internship } from './types';

export const INTERNSHIPS: readonly Internship[] = [
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
    show: {
      note: 'I can’t share the actual code from the repo, but I can share my final presentation slides and a sneak peek of what I built from scratch! I also held an informal AI workshop for some of the more senior researchers who were curious about what’s big in AI right now.',
      peek: {
        full: 'previews/quera-platform.jpg',
        thumb: 'previews/quera-platform-t.jpg',
        caption: 'Photonics Data Manager · the data tab',
        label: 'Sneak peek of the Photonics Data Manager I built',
      },
      decks: [
        {
          label: 'Final presentation · 35 slides',
          slides: deck(
            'quera',
            35,
            (i) => `QuEra Integrated Photonics Platform · ${i} of 35`,
            (i) => `QuEra final presentation slide ${i} of 35`,
          ),
        },
        {
          label: 'AI workshop · 25 slides',
          slides: deck(
            'ai-workshop',
            25,
            (i) => `The Big Things in AI Right Now · ${i} of 25`,
            (i) => `AI workshop slide ${i} of 25`,
          ),
        },
      ],
    },
  },
  {
    org: 'Mercor',
    role: 'Project Manager',
    meta: 'San Francisco, CA · May 2026 – Jun 2026',
    desc: [
      'Helped organize 100+ domain experts and ran internal trainings on eval design and trajectory analysis. Raised the share of submissions passing benchmarks set by frontier AI lab clients from 41% to 85%.',
      'Off the clock, I joined the data team to help build and debug a simulated enterprise environment, a full company’s workflow recreated so AI agents have a realistic world to operate in.',
    ],
    stack: ['Evals', 'Operations', 'JavaScript', 'Supabase', 'Cloudflare Pages'],
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
