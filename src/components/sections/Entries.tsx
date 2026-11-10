import type { ReactNode } from 'react';

export function ColumnLabel({ children }: { children: ReactNode }) {
  return <p className="col-label">{children}</p>;
}

type Entry = { title: string; sub?: string | undefined };

export function Entries({ items }: { items: readonly Entry[] }) {
  return (
    <ul>
      {items.map(({ title, sub }) => (
        <li key={title}>
          <span className="e-t">{title}</span>
          {sub && <span className="e-s">{sub}</span>}
        </li>
      ))}
    </ul>
  );
}
