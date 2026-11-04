import { EMAIL, EXPERIENCE, SCENES, SOCIALS, WORKS, type SceneId, type Slide } from '../content';
import { copyText } from '../lib/clipboard';
import { slugify } from '../lib/slug';
import type { Theme } from '../hooks/useTheme';
import type { Command } from './types';

type Deps = {
  theme: Theme;
  toggleTheme: () => void;
  openScene: (scene: SceneId) => void;
  openWork: (slug: string) => void;
  openExperience: (org: string) => void;
  openSlides: (slides: Slide[], index: number) => void;
  toast: (msg: string) => void;
  goHome: () => void;
  replayIntro: () => void;
};

const REPO = 'https://github.com/emefendy/emilieefendy-site';

const blurb = (w: (typeof WORKS)[number]) =>
  w.body.map((b) => (b.kind === 'p' ? b.text : b.items.join(' '))).join(' ');

export function buildCommands(d: Deps): Command[] {
  const sections: Command[] = [
    ...SCENES.map((s, i) => ({
      id: 'go:' + s.id,
      title: `Walk into ${s.label}`,
      hint: String(i + 1).padStart(2, '0'),
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

  const works: Command[] = WORKS.map((w) => ({
    id: 'work:' + w.slug,
    title: w.title,
    hint: w.when ?? (w.nonprofit ? '501(c)(3)' : ''),
    keywords: [w.keywords, blurb(w)].join(' '),
    group: 'Works',
    run: () => d.openWork(w.slug),
  }));

  const decks: Command[] = WORKS.flatMap((w) => {
    const m = w.media;
    if (m?.kind !== 'deck') return [];
    return {
      id: 'slides:' + w.slug,
      title: `Flip through ${w.title} slides`,
      hint: m.label,
      keywords: 'deck figma design pitch',
      group: 'Works',
      run: () => d.openSlides(m.slides, 0),
    };
  });

  const experience: Command[] = EXPERIENCE.map((x) => ({
    id: 'xp:' + slugify(x.org),
    title: x.org,
    hint: x.role,
    keywords: [x.meta, x.stack.join(' '), x.desc.join(' ')].join(' '),
    group: 'Experience',
    run: () => d.openExperience(x.org),
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
      run: async () => d.toast((await copyText(EMAIL)) ? 'Copied ' + EMAIL : 'Couldn’t reach the clipboard'),
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

  return [...sections, ...works, ...decks, ...experience, ...actions, ...elsewhere];
}
