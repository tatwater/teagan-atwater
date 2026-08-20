import type { Verbosity, ViewMode } from '@/islands/resume/types';
import type { ResumeItem } from '@/data/resume/types';

import { useState, useMemo, useCallback } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { ResumeAccordion } from '@/islands/resume/accordion';
import { ResumeToolbar } from '@/islands/resume/toolbar';
import { SkillsPanel } from '@/islands/resume/skills-sidebar';
import { itemMatchesTerms, tokenizeSearch } from '@/islands/resume/highlight';
import { resumeItems } from '@/data/resume';


const NAVBAR_H = 69;
const TOOLBAR_H = 49;


export default function ResumeExplorer() {
  const [collapsedSections, setCollapsedSections] = useState<Set<ResumeItem['type']>>(new Set());
  const [search, setSearch] = useState('');
  const [verbosity, setVerbosity] = useState<Verbosity>('summary');
  const [viewMode, setViewMode] = useState<ViewMode>('chronological');

  // The sidebar grows into the space the navbar vacates as the page scrolls.
  const { scrollY } = useScroll();
  const sidebarHeight = useTransform(
    scrollY,
    [0, NAVBAR_H],
    [`calc(100vh - ${NAVBAR_H + TOOLBAR_H}px)`, `calc(100vh - ${TOOLBAR_H}px)`],
  );

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

      <div className='flex min-h-[calc(100vh-118px)]'>
        {/* Skills sidebar — lg and up */}
        <div className='hidden lg:block w-56 xl:w-65 shrink-0 border-r border-border-light'>
          <motion.div style={{ height: sidebarHeight }} className='sticky top-12.25 flex flex-col'>
            <aside className='flex-1 overflow-y-auto min-h-0 p-4 pb-8'>
              <SkillsPanel searchTerms={searchTerms} />
            </aside>
          </motion.div>
        </div>

        {/* Main content */}
        <div className='flex-1 min-w-0 pt-3 pb-4 md:pt-4 md:pb-12'>
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

          {/* Below lg the sidebar is gone, so skills follow the entries instead */}
          <div className='lg:hidden mt-10 pt-8 border-t border-border-light px-4 md:px-6'>
            <SkillsPanel searchTerms={searchTerms} />
          </div>
        </div>
      </div>
    </div>
  );
}
