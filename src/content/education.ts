import type { Link } from './types';

type Org = { name: string; role?: string };

const HARVARD_COURSES = [
  'Theoretical Physics (Teaching Assistant)',
  'Systems Programming & Machine Organization',
  'Reinforcement Learning',
  'Machine Learning (MIT)',
  'Data Structures & Algorithms',
  'Algorithms & Limitations',
  'AI Agents & Multi-Agent Systems',
  'Quantum Mechanics',
  'Proof-based Linear Algebra & Vector Calculus',
  'Probability',
  'Statistical Inference',
  'Game Theory for Social Behavior',
  'Evolving Morality: From Primordial Soup to Superintelligent Machines',
];

const HARVARD_ORGS: readonly Org[] = [
  { name: 'Harvard Tech for Social Good', role: 'Executive Board & Senior Software Engineer' },
  { name: 'HackHarvard', role: 'Finance & Corporate Relations' },
  { name: 'Harvard Women in Computer Science' },
  { name: 'Society of Physics Students' },
  { name: 'Harvard Innovation Labs' },
  { name: 'Harvard Women in Entrepreneurship' },
];

const HS_COURSES = [
  'Modern Physics',
  'Multivariable Calculus',
  'Organic Chemistry',
  'AP Computer Science A',
  'AP Physics 1, 2 & C',
  'AP Statistics',
  'AP Calculus BC',
];

type School = {
  name: string;
  degree: string;
  place: string;
  courses: readonly string[];
  orgs?: readonly Org[];
  press?: Link & { note: string };
};

export const HARVARD: School = {
  name: 'Harvard University',
  degree: 'A.B. in Computer Science & Physics, concurrent S.M. in Computer Science',
  place: 'Cambridge, MA',
  courses: HARVARD_COURSES,
  orgs: HARVARD_ORGS,
};

export const HIGH_SCHOOL: School = {
  name: 'William P. Clements High School',
  degree: 'Salutatorian · 2/676 · 17 APs',
  place: 'Sugar Land, TX',
  courses: HS_COURSES,
  press: {
    label: 'Emilie Efendy: Driven by Wonder',
    href: 'https://chsroundup.com/21825/features/driven-by-wonder/',
    note: 'Featured in The RoundUp. Awarded Best of SNO (top 10% of student journalism submissions nationwide).',
  },
};
