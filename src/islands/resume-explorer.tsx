import type { Verbosity, ViewMode } from '@/islands/resume/types';
import type { ResumeItem } from '@/data/resume/types';

import { useState, useMemo, useCallback } from 'react';
import { ResumeAccordion } from '@/islands/resume/accordion';
import { ResumeToolbar } from '@/islands/resume/toolbar';
import { itemMatchesTerms, tokenizeSearch } from '@/islands/resume/highlight';
import { resumeItems } from '@/data/resume';


export default function ResumeExplorer() {
  const [collapsedSections, setCollapsedSections] = useState<Set<ResumeItem['type']>>(new Set());
  const [search, setSearch] = useState('');
  const [verbosity, setVerbosity] = useState<Verbosity>('summary');
  const [viewMode, setViewMode] = useState<ViewMode>('chronological');

  const toggleSectionCollapse = useCallback((type: ResumeItem['type']) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev);

      if (next.has(type))
        next.delete(type);
      else
        next.add(type);

      return next;
    });
  }, []);

  const searchTerms = useMemo(() => tokenizeSearch(search), [search]);

  // Search highlights rather than filters — every entry stays on the page so the
  // list never shrinks. This only counts hits so we can say when there are none.
  const visibleItems = useMemo(
    () => resumeItems.filter((item) => !item.hidden),
    [],
  );

  const matchCount = useMemo(
    () => (searchTerms.length === 0
      ? 0
      : visibleItems.filter((item) => itemMatchesTerms(item, searchTerms)).length),
    [searchTerms, visibleItems],
  );

  const groupedItems = useMemo(
    () => ({
      education: visibleItems.filter((i) => i.type === 'education'),
      experience: visibleItems.filter((i) => i.type === 'experience'),
      project: visibleItems.filter((i) => i.type === 'project'),
    }),
    [visibleItems],
  );

  const sectionProps = {
    searchTerms,
    verbosity,
    viewMode,
  };


  return (
    <div className='min-h-[calc(100vh-4rem-1px)]'>
      <ResumeToolbar
        matchCount={matchCount}
        search={search}
        onSearchChange={setSearch}
        verbosity={verbosity}
        onVerbosityChange={setVerbosity}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      <div className='min-h-[calc(100vh-118px)] pt-3 pb-4 md:pt-4 md:pb-12'>
        <div className='space-y-6 px-4 md:px-6'>
          <ResumeAccordion
            type='experience'
            collapsed={collapsedSections.has('experience')}
            items={groupedItems.experience}
            onToggleCollapse={() => toggleSectionCollapse('experience')}
            {...sectionProps}
          />
          <ResumeAccordion
            type='project'
            collapsed={collapsedSections.has('project')}
            items={groupedItems.project}
            onToggleCollapse={() => toggleSectionCollapse('project')}
            {...sectionProps}
          />
          <ResumeAccordion
            type='education'
            collapsed={collapsedSections.has('education')}
            items={groupedItems.education}
            onToggleCollapse={() => toggleSectionCollapse('education')}
            {...sectionProps}
          />
        </div>
      </div>
    </div>
  );
}
