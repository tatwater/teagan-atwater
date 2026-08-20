import type { SkillTag } from '@/data/resume/types';

import { cn } from '@/lib/utils';


export function TagPill(props: {
  tag: SkillTag;
  active?: boolean;
  onClick?: () => void;
  small?: boolean;
}) {
  return (
    <button
      className={cn(
        'inline-flex items-center gap-1 border font-mono transition-all select-none',
        props.small
          ? 'h-5.5 px-1.5 text-[10px]'
          : 'h-6.5 px-2 text-xs',
        props.onClick
          ? 'cursor-pointer hover:border-primary hover:text-primary hover:bg-primary/5'
          : 'cursor-default',
        props.active
          ? 'border-primary bg-primary/10 text-primary'
          : 'border-border bg-muted/50 text-muted-foreground',
      )}
      onClick={props.onClick}
      type='button'
    >
      {props.tag}
    </button>
  );
}
