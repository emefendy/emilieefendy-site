import { INTERNSHIPS, type Internship, type Slide } from '../../content';
import { ordinal } from '../../lib/format';
import { slugify } from '../../lib/slug';
import { SlideStrip } from '../SlideStrip';

type Props = {
  open: ReadonlySet<string>;
  onToggle: (org: string, open: boolean) => void;
  onOpenSlides: (slides: Slide[], index: number) => void;
};

export const internshipId = (org: string) => `xp-${slugify(org)}`;

export function Internships({ open, onToggle, onOpenSlides }: Props) {
  return (
    <ul className="link-list">
      {INTERNSHIPS.map((job, i) => (
        <li key={job.org}>
          <details
            id={internshipId(job.org)}
            open={open.has(job.org)}
            onToggle={(e) => {
              const isOpen = e.currentTarget.open;
              if (isOpen !== open.has(job.org)) onToggle(job.org, isOpen);
            }}
          >
            <summary>
              <span className="xr-n">{ordinal(i)}</span>
              <span className="xr-main">
                <span className="xr-name">
                  <span className="t">{job.org}</span>
                  <span className="xr-at">{place(job)}</span>
                </span>
                <span className="xr-role">{job.role}</span>
              </span>
            </summary>
            <InternshipBody job={job} onOpenSlides={onOpenSlides} />
          </details>
        </li>
      ))}
    </ul>
  );
}

function InternshipBody({ job, onOpenSlides }: { job: Internship; onOpenSlides: Props['onOpenSlides'] }) {
  const note = extraMeta(job);
  const { show } = job;
  return (
    <div className="w-body">
      {note && <p className="w-meta">{note}</p>}
      {job.desc.map((d) => (
        <p className="w-desc" key={d}>
          {d}
        </p>
      ))}
      <p className="stack">{job.stack.join(' · ')}</p>
      {show && (
        <div className="xp-show">
          <p className="xp-note">{show.note}</p>
          {show.peek && <Peek slide={show.peek} onOpen={onOpenSlides} />}
          {show.decks?.map((deck) => (
            <SlideStrip key={deck.label} deck={deck} layout="wide" onOpen={onOpenSlides} />
          ))}
        </div>
      )}
    </div>
  );
}

function Peek({ slide, onOpen }: { slide: Slide; onOpen: Props['onOpenSlides'] }) {
  return (
    <button type="button" className="xp-peek" onClick={() => onOpen([slide], 0)}>
      <img src={slide.full} alt={slide.label} loading="lazy" />
      <span>{slide.caption} ↗</span>
    </button>
  );
}

const metaParts = (job: Internship) => job.meta.split(' · ');
const place = (job: Internship) => metaParts(job)[0] ?? '';
/** anything in `meta` besides the place and the dates */
const extraMeta = (job: Internship) =>
  metaParts(job)
    .slice(1)
    .filter((part) => !/\d{4}/.test(part))
    .join(' · ');
