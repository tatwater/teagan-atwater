import type { SkillTag } from '@/data/resume/types';

import { cn } from '@/lib/utils';


export function TagPill(props: {
  tag: SkillTag;
  highlighted?: boolean;
  small?: boolean;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 border font-mono transition-all select-none',
        props.small
          ? 'h-5.5 px-1.5 text-[10px]'
          : 'h-6.5 px-2 text-xs',
        props.highlighted
          ? 'border-primary bg-primary/10 text-primary'
          : 'border-border bg-muted/50 text-muted-foreground',
      )}
    >
      {props.tag}
    </span>
  );
}
