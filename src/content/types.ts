export type SceneId = 'education' | 'internships' | 'projects' | 'awards';

export type Link = { label: string; href: string };

export type Slide = { full: string; thumb: string; caption: string; label: string };

export type Deck = { label: string; slides: Slide[] };

export type Internship = {
  org: string;
  role: string;
  /** "City, ST · Mon YYYY – Mon YYYY", optionally followed by more " · " parts */
  meta: string;
  desc: string[];
  stack: string[];
  show?: { note: string; peek?: Slide; decks?: Deck[] };
};

export type Media =
  | ({ kind: 'deck'; layout: 'wide' | 'portrait' } & Deck)
  | { kind: 'preview'; href: string; host: string; src: string; alt: string; width: number; height: number };

export type Block = { kind: 'p'; text: string } | { kind: 'list'; items: string[] };

export type Project = {
  slug: string;
  title: string;
  /** role first, then a few keywords for the list row */
  tags: string;
  nonprofit?: boolean;
  logo?: { src: string; alt: string };
  when?: string;
  body: Block[];
  media?: Media;
  links: Link[];
  /** extra words the command palette matches on */
  keywords?: string;
};

export type Faq = {
  q: string;
  a: string;
  /** the building the answer points to */
  go?: SceneId;
  links?: Link[];
};
