import { PROGRAMS, RECOGNITION } from '../../content';
import { ColumnLabel, Entries } from './Entries';

export function Awards() {
  return (
    <div className="awards">
      <div>
        <ColumnLabel>Recognition</ColumnLabel>
        <Entries items={RECOGNITION.map((r) => ({ title: r.title, sub: r.sub }))} />
      </div>
      <div>
        <ColumnLabel>Programs</ColumnLabel>
        <Entries items={PROGRAMS.map((title) => ({ title }))} />
      </div>
    </div>
  );
}
