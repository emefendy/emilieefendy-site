import {
  EMAIL,
  INTERNSHIPS,
  PROJECTS,
  REPO,
  SCENES,
  SOCIALS,
  type Project,
  type SceneId,
  type Slide,
} from '../content';
import { copyText } from '../lib/clipboard';
import { ordinal } from '../lib/format';
import { slugify } from '../lib/slug';
import type { Theme } from '../hooks/useTheme';
import type { Command } from './types';

type Deps = {
  theme: Theme;
  toggleTheme: () => void;
  openScene: (scene: SceneId) => void;
  openProject: (slug: string) => void;
  showInternship: (org: string) => void;
  openSlides: (slides: Slide[], index: number) => void;
  toast: (msg: string) => void;
  goHome: () => void;
  replayIntro: () => void;
};

const fullText = (p: Project) => p.body.map((b) => (b.kind === 'p' ? b.text : b.items.join(' '))).join(' ');

export function buildCommands(d: Deps): Command[] {
  const sections: Command[] = [
    ...SCENES.map((s, i) => ({
      id: `go:${s.id}`,
      title: `Walk into ${s.label}`,
      hint: ordinal(i),
      keywords: 'building section open',
      group: 'Sections' as const,
      run: () => d.openScene(s.id),
    })),
    {
      id: 'go:campus',
      title: 'Back to the campus',
      keywords: 'home top overview',
      group: 'Sections',
      run: d.goHome,
    },
  ];

  const projects: Command[] = PROJECTS.map((p) => ({
    id: `project:${p.slug}`,
    title: p.title,
    hint: p.when ?? (p.nonprofit ? '501(c)(3)' : ''),
    keywords: [p.keywords, fullText(p)].join(' '),
    group: 'Projects',
    run: () => d.openProject(p.slug),
  }));

  const decks: Command[] = PROJECTS.flatMap((p) => {
    const media = p.media;
    if (media?.kind !== 'deck') return [];
    return {
      id: `slides:${p.slug}`,
      title: `Flip through ${p.title} slides`,
      hint: media.label,
      keywords: 'deck figma design pitch',
      group: 'Projects',
      run: () => d.openSlides(media.slides, 0),
    };
  });

  const internships: Command[] = INTERNSHIPS.map((job) => ({
    id: `internship:${slugify(job.org)}`,
    title: job.org,
    hint: job.role,
    keywords: [job.meta, job.stack.join(' '), job.desc.join(' ')].join(' '),
    group: 'Internships',
    run: () => d.showInternship(job.org),
  }));

  const actions: Command[] = [
    {
      id: 'theme',
      title: d.theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode',
      keywords: 'theme appearance dark light night',
      group: 'Actions',
      run: d.toggleTheme,
    },
    {
      id: 'intro',
      title: 'Say hello again',
      hint: 'replay the intro',
      keywords: 'intro dialog hi hello welcome',
      group: 'Actions',
      run: d.replayIntro,
    },
    {
      id: 'copy-email',
      title: 'Copy my email',
      hint: EMAIL,
      keywords: 'contact clipboard',
      group: 'Actions',
      run: () => {
        void copyText(EMAIL).then((ok) => d.toast(ok ? `Copied ${EMAIL}` : 'Couldn’t reach the clipboard'));
      },
    },
    {
      id: 'email',
      title: 'Send me an email',
      keywords: 'contact mail hi',
      group: 'Actions',
      run: () => {
        location.href = 'mailto:' + EMAIL;
      },
    },
  ];

  const elsewhere: Command[] = [
    { id: 'gh', title: 'GitHub', hint: '@emefendy', keywords: 'code', url: SOCIALS.github },
    { id: 'li', title: 'LinkedIn', keywords: 'resume cv', url: SOCIALS.linkedin },
    { id: 'src', title: 'Source for this site', keywords: 'code repo react typescript vite', url: REPO },
  ].map(({ url, ...c }) => ({
    ...c,
    group: 'Elsewhere',
    external: true,
    run: () => window.open(url, '_blank', 'noopener'),
  }));

  return [...sections, ...projects, ...decks, ...internships, ...actions, ...elsewhere];
}
