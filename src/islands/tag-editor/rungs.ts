import type { SkillVisibility } from '@/data/resume/skills';
import type { DraftEntry } from '@/islands/tag-editor/state';


/**
 * The visibility ladder, with labels that say what each rung actually does
 * rather than repeating the identifier. Order matches SKILL_VISIBILITY_ORDER.
 */
export const RUNGS: {
  className: string;
  hint: string;
  label: string;
  value: SkillVisibility;
}[] = [
  { value: 'hidden',  label: 'Hidden',  hint: 'Nowhere. Not even searchable.',      className: 'border-border bg-transparent text-muted-foreground/50' },
  { value: 'entry',   label: 'Entries', hint: 'On cards and in search only.',       className: 'border-border bg-muted/50 text-muted-foreground' },
  { value: 'sidebar', label: 'Sidebar', hint: 'Also listed in the skills sidebar.', className: 'border-sky-700/60 bg-sky-700/10 text-sky-700' },
  { value: 'print',   label: 'Print',   hint: 'Also on the printed résumé.',        className: 'border-primary bg-primary/10 text-primary' },
];

export const RUNG = Object.fromEntries(RUNGS.map((rung) => [rung.value, rung])) as
  Record<SkillVisibility, typeof RUNGS[number]>;


export const TYPE_LABEL: Record<DraftEntry['type'], string> = {
  education: 'edu',
  experience: 'exp',
  project: 'proj',
};
