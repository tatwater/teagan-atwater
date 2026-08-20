import type { Verbosity } from '@/islands/resume/types';
import type { ResumeItem } from '@/data/resume/types';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Highlight, resolveVerbosity } from '@/islands/resume/highlight';
import { cn } from '@/lib/utils';


export function DynamicDescription(props: {
  item: ResumeItem;
  verbosity: Verbosity;
  searchTerms?: string[];
}) {
  const terms = props.searchTerms ?? [];

  // A card whose match is hidden at the current density expands on its own.
  const effectiveVerbosity = resolveVerbosity(props.item, props.verbosity, terms);

  const getText = (v: Verbosity) =>
    v === 'headline' ? null
    : v === 'summary' ? props.item.descriptionSummary
    : props.item.descriptionFull;

  const [shownVerbosity, setShownVerbosity] = useState(effectiveVerbosity);
  const [opacity, setOpacity] = useState(1);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  const text = getText(shownVerbosity);

  // After every content change, sync wrapper height to the natural content height.
  // useLayoutEffect fires before paint, so the CSS transition picks up the new target
  // height immediately without an intermediate frame at the wrong size.
  useLayoutEffect(() => {
    const wrapper = wrapperRef.current;
    const inner = innerRef.current;
    if (!wrapper || !inner) return;
    wrapper.style.height = `${inner.scrollHeight}px`;
  }, [shownVerbosity, terms.join(' ')]);

  // On verbosity change: fade out → swap content → fade in.
  // Content is never visible at the wrong size, so no character distortion occurs.
  useEffect(() => {
    if (effectiveVerbosity === shownVerbosity) return;
    setOpacity(0);
    const t = setTimeout(() => {
      setShownVerbosity(effectiveVerbosity);
      setOpacity(1);
    }, 150);
    return () => clearTimeout(t);
  }, [effectiveVerbosity]);


  return (
    <div
      ref={wrapperRef}
      className='overflow-hidden'
      style={{ transition: 'height 0.2s ease-in-out' }}
    >
      <div ref={innerRef} className='flex flex-col'>
        <motion.div
          animate={{ opacity }}
          initial={false}
          transition={{ duration: 0.15, ease: 'easeInOut' }}
        >
          {text && (
            <p className={cn(
              'mt-2 text-sm leading-relaxed text-muted-foreground',
              shownVerbosity === 'detail' && 'leading-loose',
            )}>
              <Highlight terms={terms} text={text} />
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
