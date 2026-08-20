import type { ResumeSearchDoc, SectionFilter, Verbosity, ViewMode } from '@/islands/resume/types';
import type { ResumeItem, SkillTag } from '@/data/resume/types';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import MiniSearch from 'minisearch';
import { detectPlatform, MAC_MODIFIER_SYMBOLS } from '@tanstack/react-hotkeys';
import { faMagnifyingGlass, faSliders, faXmark } from '@fortawesome/sharp-regular-svg-icons';
import { ResumeAccordion } from '@/islands/resume/accordion';
import { SECTION_OPTIONS } from '@/islands/resume/constants';
import { ResumeSidebar } from '@/islands/resume/sidebar';
import { ResumeFilterDrawer } from '@/islands/resume/filter-drawer';
import { TagPill } from '@/islands/resume/tag-pill';
import { ResumeToolbar } from '@/islands/resume/toolbar';
import { isSubCardEnabled } from '@/islands/resume/helpers';
import { Icon } from '@/components/icon';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { resumeItems } from '@/data/resume';
import { Kbd, KbdGroup } from '@/components/ui/kbd';


// ─── MiniSearch index (built once at module level) ────────────────────────────

const miniSearch = new MiniSearch<ResumeSearchDoc>({
  fields: ['title', 'organization', 'headline', 'summary', 'detail', 'tags'],
  storeFields: ['id'],
  searchOptions: {
    boost: { title: 3, organization: 2, headline: 2 },
    // fuzzy: 0.2,
    prefix: true,
  },
});

miniSearch.addAll(
  resumeItems.map((item): ResumeSearchDoc => ({
    ...item,
    tags: item.tags.join(' '),
  }))
);


// ─── Main Component ───────────────────────────────────────────────────────────

export default function ResumeExplorer() {
  const [activeSection, setActiveSection] = useState<SectionFilter>('all');
  const [activeTags, setActiveTags] = useState<Set<SkillTag>>(new Set());
  const [collapsedSections, setCollapsedSections] = useState<Set<ResumeItem['type']>>(new Set());
  const [search, setSearch] = useState('');
  const [showInternships, setShowInternships] = useState(false);
  const [verbosity, setVerbosity] = useState<Verbosity>('summary');
  const [viewMode, setViewMode] = useState<ViewMode>('chronological');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  const isMac = detectPlatform() === 'mac';
  const metaKey = isMac
    ? MAC_MODIFIER_SYMBOLS['Meta']
    : 'Ctrl';

  const NAVBAR_H = 69;
  const TOOLBAR_H = 49;
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

  const handleSectionChange = useCallback((section: SectionFilter) => {
    setActiveSection(section);

    if (section !== 'all') {
      setCollapsedSections((prev) => {
        if (!prev.has(section))
          return prev;

        const next = new Set(prev);
        next.delete(section);

        return next;
      });
    }
  }, []);

  // Read ?tag= URL param on mount to pre-populate filter (used by detail page tag links)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tagParam = params.get('tag');

    if (tagParam) {
      const allTags = resumeItems.flatMap((i) => i.tags);

      if (allTags.includes(tagParam as SkillTag)) {
        setActiveTags(new Set([tagParam as SkillTag]));
      }

      const url = new URL(window.location.href);
      url.searchParams.delete('tag');
      window.history.replaceState({}, '', url.toString());
    }
  }, []);

  const toggleTag = useCallback((tag: SkillTag) => {
    setActiveTags((prev) => {
      const next = new Set(prev);

      if (next.has(tag))
        next.delete(tag);
      else
        next.add(tag);

      return next;
    });
  }, []);

  const clearTags = useCallback(() => setActiveTags(new Set()), []);

  // All experience items in canonical order (for timeline gap detection)
  const allExperienceItems = useMemo(
    () => resumeItems.filter((i) => i.type === 'experience' && !i.hidden && (showInternships || !i.isInternship)),
    [showInternships],
  );

  // Filter and search
  const filteredItems = useMemo(() => {
    let results = resumeItems.filter((item) => !item.hidden);

    if (!showInternships) {
      results = results.filter((item) => !item.isInternship);
    }

    if (activeSection !== 'all') {
      results = results.filter((item) => item.type === activeSection);
    }

    if (activeTags.size > 0) {
      results = results.filter((item) => {
        if (item.variant === 'pandemic') {
          // Show if any sub-card passes the tag filter (AND semantics per sub-card)
          return item.subCards
            ? item.subCards.some((sc) => isSubCardEnabled(sc.id, activeTags))
            : false;
        }
        return [...activeTags].every((tag) => item.tags.includes(tag));
      });
    }

    if (search.trim()) {
      const searchResults = miniSearch.search(search.trim());
      const matchedIds = new Set(searchResults.map((r) => r.id));

      results = results.filter((item) => matchedIds.has(item.id));
    }

    return results;
  }, [search, activeTags, activeSection, showInternships]);

  const groupedItems = useMemo(
    () => ({
      education: filteredItems.filter((i) => i.type === 'education'),
      experience: filteredItems.filter((i) => i.type === 'experience'),
      project: filteredItems.filter((i) => i.type === 'project'),
    }),
    [filteredItems],
  );

  const totalCount = useMemo(
    () => resumeItems.filter((i) => !i.hidden && (showInternships || !i.isInternship)).length,
    [showInternships],
  );

  const hasResults = filteredItems.length > 0;

  // Shared section group props
  const sectionGroupProps = {
    activeTags,
    onTagClick: toggleTag,
    verbosity,
    viewMode,
  };


  return (
    <div className='min-h-[calc(100vh-4rem-1px)]'>
      <ResumeToolbar
        search={search}
        onSearchChange={setSearch}
        verbosity={verbosity}
        onVerbosityChange={setVerbosity}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      <div className='flex min-h-[calc(100vh-118px)]'>
        {/* Sidebar */}
        <div className='hidden lg:block w-56 xl:w-65 shrink-0 border-r border-border-light'>
          <motion.div style={{ height: sidebarHeight }} className='sticky top-12.25 flex flex-col'>
            <ResumeSidebar
              activeSection={activeSection}
              onSectionChange={handleSectionChange}
              activeTags={activeTags}
              onClearTags={clearTags}
              onTagClick={toggleTag}
              resultCount={filteredItems.length}
              showInternships={showInternships}
              onShowInternshipsChange={setShowInternships}
              totalCount={totalCount}
            />
          </motion.div>
        </div>

        {/* Main content */}
        <div className='flex-1 min-w-0 pt-3 pb-4 md:pt-4 md:pb-12'>
          {/* Mobile controls: section tabs + filter drawer trigger */}
          <div className='flex items-center justify-between gap-2 mb-4 lg:hidden px-4 md:px-6'>
            {/* Section dropdown (< sm) */}
            <div className='sm:hidden shrink-0'>
              <Select
                value={activeSection}
                onValueChange={(value) => handleSectionChange(value as SectionFilter)}
              >
                <SelectTrigger className='text-xs'>
                  {SECTION_OPTIONS.find((o) => o.value === activeSection)?.label}
                </SelectTrigger>
                <SelectContent>
                  {SECTION_OPTIONS.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Section tabs (sm – lg) — scrollable */}
            <div className='hidden sm:flex items-center gap-1 overflow-x-auto min-w-0'>
              {SECTION_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  className={cn(
                    'px-3 py-1.5 text-xs whitespace-nowrap border transition-all shrink-0 cursor-pointer',
                    activeSection === value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground hover:text-foreground hover:bg-muted',
                  )}
                  onClick={() => handleSectionChange(value)}
                  type='button'
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Right side: result count + filter button group */}
            <div className='flex items-center gap-2 shrink-0'>
              <span className='text-[10px] font-mono text-muted-foreground whitespace-nowrap'>
                {filteredItems.length === totalCount
                  ? `${totalCount} entries`
                  : `${filteredItems.length} of ${totalCount} entries`
                }
              </span>
              <TooltipProvider>
                {/*
                  Two-render pattern: tooltip only appears on screens where the
                  text label is hidden (xs). On sm+ the label is visible, so no tooltip.
                  A single X button sits at the end with border-l-0 to join whichever
                  filter button is currently showing.
                */}
                <div className='flex w-fit items-stretch' role='group'>
                  {/* xs — icon-only with tooltip */}
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <Button
                          className={cn(
                            'sm:hidden rounded-none font-mono text-muted-foreground',
                            activeTags.size > 0 && 'border-primary bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary',
                          )}
                          onClick={() => setFilterDrawerOpen(true)}
                          size='icon'
                          type='button'
                          variant='outline'
                        />
                      }
                    >
                      <Icon className='text-xs' icon={faSliders} />
                    </TooltipTrigger>
                    <TooltipContent>
                      {`Filter by skill`}
                    </TooltipContent>
                  </Tooltip>

                  {/* sm+ — icon + text label, no tooltip */}
                  <Button
                    className={cn(
                      'hidden sm:inline-flex rounded-none font-mono text-muted-foreground',
                      activeTags.size > 0 && 'border-primary bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary',
                    )}
                    onClick={() => setFilterDrawerOpen(true)}
                    type='button'
                    variant='outline'
                  >
                    <Icon className='text-xs' icon={faSliders} />
                    {`Filter by skill`}
                    {activeTags.size > 0 && (
                      <span className='text-[10px] font-mono font-semibold'>
                        {`(${activeTags.size})`}
                      </span>
                    )}
                  </Button>

                  {/* X clear — always icon-only, border-l-0 joins the group */}
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <Button
                          className='rounded-none border-l-0 font-mono text-muted-foreground'
                          disabled={activeTags.size === 0}
                          onClick={clearTags}
                          size='icon'
                          type='button'
                          variant='outline'
                        />
                      }
                    >
                      <Icon className='text-xs' icon={faXmark} />
                    </TooltipTrigger>
                    <TooltipContent>{`Clear skill filters`}</TooltipContent>
                  </Tooltip>
                </div>
              </TooltipProvider>
            </div>
          </div>

          <ResumeFilterDrawer
            activeTags={activeTags}
            onClearTags={clearTags}
            onOpenChange={setFilterDrawerOpen}
            onShowInternshipsChange={setShowInternships}
            onTagClick={toggleTag}
            open={filterDrawerOpen}
            resultCount={filteredItems.length}
            showInternships={showInternships}
            totalCount={totalCount}
          />

          {/* Mobile active tags */}
          {activeTags.size > 0 && (
            <div className='flex items-center gap-1 flex-wrap mb-4 lg:hidden px-4 md:px-6'>
              <span className='text-[10px] font-mono text-muted-foreground'>
                {`Skill filters:`}
              </span>
              {[...activeTags].map((tag) => (
                <TagPill
                  key={tag}
                  active
                  onClick={() => toggleTag(tag)}
                  small
                  tag={tag}
                />
              ))}
              {/*<button
                className='text-[10px] font-mono text-primary hover:underline ml-1'
                onClick={clearTags}
                type='button'
              >
                {`Clear`}
              </button>*/}
            </div>
          )}

          {/* Empty state */}
          {!hasResults
            ? (
                <div className='flex flex-col items-center justify-center py-24 text-center gap-4 px-4 md:px-6'>
                  <Icon
                    className='text-2xl text-muted-foreground/30'
                    icon={faMagnifyingGlass}
                  />
                  <div className='flex flex-col gap-2'>
                    <p className='text-sm text-muted-foreground'>
                      {`No results found.`}
                    </p>
                    <p className='text-xs text-muted-foreground/60'>
                      {`Try adjusting your search or clearing tag filters.`}
                    </p>
                  </div>
                  {(activeTags.size > 0 || search || activeSection !== 'all') && (
                    <Button
                      autoFocus
                      className='mt-2 gap-2 font-mono border-primary text-primary hover:bg-primary/10 hover:text-primary'
                      onClick={() => {
                        clearTags();
                        setActiveSection('all');
                        setSearch('');
                      }}
                      size='sm'
                      variant='outline'
                    >
                      {`Reset all filters`}
                      <KbdGroup>
                        <Kbd>
                          {metaKey}
                        </Kbd>
                        <Kbd>
                          {`X`}
                        </Kbd>
                      </KbdGroup>
                    </Button>
                  )}
                </div>
              )
            : (
                <div className='space-y-6 px-4 md:px-6'>
                  {(activeSection === 'all' || activeSection === 'experience') && (
                    <ResumeAccordion
                      type='experience'
                      allItems={allExperienceItems}
                      collapsed={collapsedSections.has('experience')}
                      items={groupedItems.experience}
                      onToggleCollapse={() => toggleSectionCollapse('experience')}
                      {...sectionGroupProps}
                    />
                  )}
                  {(activeSection === 'all' || activeSection === 'project') && (
                    <ResumeAccordion
                      type='project'
                      collapsed={collapsedSections.has('project')}
                      items={groupedItems.project}
                      onToggleCollapse={() => toggleSectionCollapse('project')}
                      {...sectionGroupProps}
                    />
                  )}
                  {(activeSection === 'all' || activeSection === 'education') && (
                    <ResumeAccordion
                      type='education'
                      collapsed={collapsedSections.has('education')}
                      items={groupedItems.education}
                      onToggleCollapse={() => toggleSectionCollapse('education')}
                      {...sectionGroupProps}
                    />
                  )}
                </div>
              )
          }
        </div>
      </div>
    </div>
  );
}
