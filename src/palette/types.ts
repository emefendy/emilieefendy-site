export const GROUPS = ['Recent', 'Sections', 'Works', 'Experience', 'Actions', 'Elsewhere'] as const;
export type Group = (typeof GROUPS)[number];

export type Command = {
  id: string;
  title: string;
  group: Exclude<Group, 'Recent'>;
  /** dimmed text after the title */
  hint?: string;
  /** searched by word prefix, never shown */
  keywords?: string;
  external?: boolean;
  run: () => void;
};

export type Result = { command: Command; indices: number[]; group: Group };
