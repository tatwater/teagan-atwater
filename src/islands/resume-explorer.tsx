import type { Verbosity, ViewMode } from '@/islands/resume/types';
import type { ResumeItem, SkillTag } from '@/data/resume/types';

import { useState, useMemo, useCallback, useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { ResumeAccordion } from '@/islands/resume/accordion';
import { ResumeToolbar } from '@/islands/resume/toolbar';
import { SkillsPanel } from '@/islands/resume/skills-sidebar';
import { itemMatchesTerms, tokenizeSearch } from '@/islands/resume/highlight';
import { SORTED_SECTION_LABEL } from '@/islands/resume/constants';
import {
  countMatchingTag,
  mergeableItems,
  sortByTag,
  tagCoverage,
} from '@/islands/resume/sort';
import { resumeItems } from '@/data/resume';


const NAVBAR_H = 69;
const TOOLBAR_H = 49;

/** Breathing room between the stuck toolbar and the section heading below it. */
const LIST_TOP_GAP = 10;

/** Below this the toolbar is `relative`, not `sticky`, so it covers nothing. */
const TOOLBAR_STICKY_FROM = 768;

/** Close enough to the target that scrolling would read as a twitch. */
const SCROLL_DEADZONE = 12;


export default function ResumeExplorer() {
  const [collapsedSections, setCollapsedSections] = useState<Set<ResumeItem['type']>>(new Set());
  const [search, setSearch] = useState('');
  const [verbosity, setVerbosity] = useState<Verbosity>('summary');
  const [viewMode, setViewMode] = useState<ViewMode>('chronological');
  const [activeTag, setActiveTag] = useState<SkillTag | null>(null);
  const entriesRef = useRef<HTMLDivElement>(null);

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

  const coverage = useMemo(() => tagCoverage(visibleItems), [visibleItems]);

  const groupedItems = useMemo(
    () => ({
      education: visibleItems.filter((i) => i.type === 'education'),
      experience: visibleItems.filter((i) => i.type === 'experience'),
      project: visibleItems.filter((i) => i.type === 'project'),
    }),
    [visibleItems],
  );

  // While a tag is active, experience and projects rank against each other in
  // one list — a matching project should be able to outrank a non-matching job,
  // which the section split would otherwise prevent. Education keeps its own
  // section: a degree doesn't compete with a job on a skill tag.
  const rankedItems = useMemo(
    () => sortByTag(mergeableItems(visibleItems), activeTag),
    [visibleItems, activeTag],
  );

  const tagMatchCount = useMemo(
    () => countMatchingTag(rankedItems, activeTag),
    [rankedItems, activeTag],
  );

  // Below `lg` the skills panel sits underneath the entries, so a tap there
  // would re-sort a list entirely off-screen above. Bring the list back into
  // view so the reorder is something you actually see happen.
  //
  // `scrollIntoView` is wrong for this: it parks the list flush against the top
  // of the viewport, where the sticky toolbar then covers the section heading
  // and clips the first card. Scrolling to a measured offset instead lands the
  // heading just below the toolbar — from the top of the page that is a nudge
  // of roughly the navbar's height, and no further.
  const handleTagClick = useCallback((tag: SkillTag) => {
    setActiveTag((prev) => (prev === tag ? null : tag));

    const list = entriesRef.current;
    if (!list) return;

    const stickyOffset = window.innerWidth >= TOOLBAR_STICKY_FROM ? TOOLBAR_H : 0;
    const target = Math.max(
      0,
      window.scrollY + list.getBoundingClientRect().top - stickyOffset - LIST_TOP_GAP,
    );

    if (Math.abs(window.scrollY - target) <= SCROLL_DEADZONE) return;

    window.scrollTo({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'auto'
        : 'smooth',
      top: target,
    });
  }, []);

  const clearActiveTag = useCallback(() => setActiveTag(null), []);

  const sectionProps = {
    activeTag,
    searchTerms,
    verbosity,
    viewMode,
  };

  const skillsPanelProps = {
    activeTag,
    coverage,
    onTagClick: handleTagClick,
    searchTerms,
  };


  return (
    <div className='min-h-[calc(100vh-4rem-1px)]'>
      <ResumeToolbar
        activeTag={activeTag}
        matchCount={matchCount}
        onClearActiveTag={clearActiveTag}
        onSearchChange={setSearch}
        onVerbosityChange={setVerbosity}
        onViewModeChange={setViewMode}
        search={search}
        tagMatchCount={tagMatchCount}
        verbosity={verbosity}
        viewMode={viewMode}
      />

      <div className='flex min-h-[calc(100vh-118px)]'>
        {/* Skills sidebar — lg and up */}
        <div className='hidden lg:block w-56 xl:w-65 shrink-0 border-r border-border-light'>
          <motion.div style={{ height: sidebarHeight }} className='sticky top-12.25 flex flex-col'>
            <aside className='flex-1 overflow-y-auto min-h-0 p-4 pb-8'>
              <SkillsPanel {...skillsPanelProps} />
            </aside>
          </motion.div>
        </div>

        {/* Main content */}
        {/* The runout sits on the column, not on either child, so it lands under
            whichever one is last — the entries at lg, the skills below it. */}
        <div className='flex-1 min-w-0 pt-3 md:pt-4 page-runout'>
          <div className='space-y-6 px-4 md:px-6' ref={entriesRef}>
            {activeTag ? (
              <ResumeAccordion
                collapsed={collapsedSections.has('experience')}
                items={rankedItems}
                label={SORTED_SECTION_LABEL}
                onToggleCollapse={() => toggleSectionCollapse('experience')}
                sorted
                type='experience'
                {...sectionProps}
              />
            ) : (
              <>
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
              </>
            )}
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
            <SkillsPanel {...skillsPanelProps} />
          </div>
        </div>
      </div>
    </div>
  );
}
