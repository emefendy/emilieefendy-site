import { SECTIONS, type Section } from '../content';

export function SectionHead({ id, title }: { id: Section['id']; title: string }) {
  const eyebrow = SECTIONS.find((s) => s.id === id)?.eyebrow;
  return (
    <>
      <p className="eyebrow">{eyebrow}</p>
      <h2 id={'h-' + id}>{title}</h2>
    </>
  );
}
