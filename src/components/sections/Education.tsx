import { HARVARD, HIGH_SCHOOL } from '../../content';
import { ColumnLabel, Entries } from './Entries';

export function Education() {
  return (
    <div className="edu">
      <section className="edu-row">
        <h3 className="edu-school edu-main">{HARVARD.name}</h3>
        <p className="edu-deg">{HARVARD.degree}</p>
        <p className="edu-note">{HARVARD.place}</p>
        <div className="edu-cols">
          <div>
            <ColumnLabel>Coursework</ColumnLabel>
            <Entries items={HARVARD.courses.map((title) => ({ title }))} />
          </div>
          {HARVARD.orgs && (
            <div>
              <ColumnLabel>Organizations</ColumnLabel>
              <Entries items={HARVARD.orgs.map((o) => ({ title: o.name, sub: o.role }))} />
            </div>
          )}
        </div>
      </section>

      <section className="edu-row">
        <h3 className="edu-school">{HIGH_SCHOOL.name}</h3>
        <p className="edu-deg">{HIGH_SCHOOL.degree}</p>
        <p className="edu-note">{HIGH_SCHOOL.place}</p>
        {HIGH_SCHOOL.press && (
          <>
            <p className="edu-link">
              <a href={HIGH_SCHOOL.press.href} target="_blank" rel="noopener">
                → {HIGH_SCHOOL.press.label}
              </a>
            </p>
            <p className="edu-note">{HIGH_SCHOOL.press.note}</p>
          </>
        )}
        <div className="edu-courses">
          <ColumnLabel>Coursework</ColumnLabel>
          <Entries items={HIGH_SCHOOL.courses.map((title) => ({ title }))} />
        </div>
      </section>
    </div>
  );
}
