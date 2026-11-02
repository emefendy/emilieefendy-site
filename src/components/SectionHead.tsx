import { SECTIONS, type Section } from '../content';
import { SplitText } from './Reveal';

export function SectionHead({ id, title }: { id: Section['id']; title: string }) {
  const i = SECTIONS.findIndex((s) => s.id === id);
  const eyebrow = SECTIONS[i]?.eyebrow;
  return (
    <div className="sh">
      <p className="eyebrow">
        <span className="sh-n">{String(i + 1).padStart(2, '0')}</span> {eyebrow}
      </p>
      <SplitText as="h2" id={'h-' + id} text={title} />
    </div>
  );
}
