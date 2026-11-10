import { useState, type KeyboardEvent } from 'react';
import { PROJECTS, type Project } from '../../content';
import { cx } from '../../lib/cx';
import { ordinal } from '../../lib/format';

type Props = { onOpen: (slug: string) => void };

const rowId = (slug: string) => `project-${slug}`;

export function Projects({ onOpen }: Props) {
  const [hovered, setHovered] = useState<number | null>(null);

  const moveFocus = (e: KeyboardEvent, from: number) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    e.preventDefault();
    const to = (from + (e.key === 'ArrowDown' ? 1 : -1) + PROJECTS.length) % PROJECTS.length;
    document.getElementById(rowId(PROJECTS[to]!.slug))?.focus();
  };

  return (
    <ol className={cx('wk', hovered !== null && 'hovering')} onMouseLeave={() => setHovered(null)}>
      {PROJECTS.map((p, i) => (
        <li key={p.slug} className={cx(hovered === i && 'on')}>
          <button
            type="button"
            id={rowId(p.slug)}
            className="wk-row"
            onClick={() => onOpen(p.slug)}
            onMouseEnter={() => setHovered(i)}
            onKeyDown={(e) => moveFocus(e, i)}
          >
            <span className="wk-n">{ordinal(i)}</span>
            <Badge project={p} />
            <span className="wk-t">
              {p.title}
              {p.nonprofit && <span className="npo">501(c)(3)</span>}
            </span>
            <span className="wk-tags">{p.tags}</span>
            <span className="wk-go" aria-hidden="true">
              →
            </span>
          </button>
        </li>
      ))}
    </ol>
  );
}

// square crops for logos that are wide wordmarks
const SQUARE_LOGOS: Record<string, string> = {
  'chw-central': 'logos/badge/chw-central.png',
  'computers-4-people': 'logos/badge/computers-4-people.png',
  'first-racquet': 'logos/first-racquet.png',
  breakthrough: 'logos/breakthrough.png',
  evergreen: 'logos/evergreen.png',
  wecode: 'logos/wecode.png',
};

const initials = (title: string) =>
  title
    .replace(/[^A-Za-z0-9 ]/g, '')
    .split(' ')
    .filter((word) => /^[A-Z0-9]/.test(word))
    .slice(0, 2)
    .map((word) => word[0])
    .join('');

function Badge({ project }: { project: Project }) {
  const src = SQUARE_LOGOS[project.slug] ?? project.logo?.src;
  if (!src) {
    return (
      <span className="wk-badge wk-badge-mono" aria-hidden="true">
        {initials(project.title)}
      </span>
    );
  }
  return (
    <span className="wk-badge">
      <img src={src} alt="" loading="lazy" />
    </span>
  );
}
