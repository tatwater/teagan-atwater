import type { VariantProps } from 'class-variance-authority';

import { cva } from 'class-variance-authority';
import { HTMLAttributes } from 'react';


export interface BadgeProps extends HTMLAttributes<HTMLDivElement> {};

export default function SkillBadge({ className, ...props }: BadgeProps) {
  return (
    <div className='inline-flex items-center rounded-full border border-slate-400 px-3 h-6 text-xs text-slate-400 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 font-mono' { ...props } />
  );
}
