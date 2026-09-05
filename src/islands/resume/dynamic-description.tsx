import type { Verbosity } from '@/islands/resume/types';
import type { DescriptionBody, ResumeItem } from '@/data/resume/types';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Highlight, resolveVerbosity } from '@/islands/resume/highlight';
import { hasDescription, toBulletRuns } from '@/data/resume/description';
import { cn } from '@/lib/utils';


function BulletList({ bullets, terms }: { bullets: string[]; terms: string[] }) {
  return (
    <ul className='flex flex-col gap-1.5 pl-4 list-disc marker:text-muted-foreground/40'>
      {bullets.map((bullet, i) => (
        <li key={i} className='pl-0.5'>
          <Highlight terms={terms} text={bullet} />
        </li>
      ))}
    </ul>
  );
}


/** Prose renders as paragraphs split on blank lines; a list renders as bullets. */
function DescriptionContent({ body, terms }: { body: DescriptionBody; terms: string[] }) {
  if (typeof body === 'string') {
    return (
      <>
        {body.split('\n\n').map((paragraph, i) => (
          <p key={i}>
            <Highlight terms={terms} text={paragraph} />
          </p>
        ))}
      </>
    );
  }

  return (
    <>
      {toBulletRuns(body).map((run, i) => (
        <div key={i} className='flex flex-col gap-1.5'>
          {run.label && (
            <p className='text-xs font-mono font-medium text-foreground/72'>
              <Highlight terms={terms} text={run.label} />
            </p>
          )}
          <BulletList bullets={run.bullets} terms={terms} />
        </div>
      ))}
    </>
  );
}


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

  const body = getText(shownVerbosity);

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
          {body && hasDescription(body) && (
            <div className={cn(
              'flex flex-col gap-2 mt-2 text-sm leading-relaxed text-muted-foreground',
              shownVerbosity === 'detail' && 'leading-loose',
            )}>
              <DescriptionContent body={body} terms={terms} />
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
