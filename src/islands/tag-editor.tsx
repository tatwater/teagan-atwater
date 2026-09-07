import type { SkillVisibility } from '@/data/resume/skills';
import type { TaxonomyRecord } from '@/lib/tag-source';
import type { Draft, DraftEntry } from '@/islands/tag-editor/state';

import { useCallback, useMemo, useState } from 'react';
import {
  faArrowDown,
  faArrowUp,
  faCircleCheck,
  faCircleExclamation,
  faPlus,
  faTriangleExclamation,
} from '@fortawesome/sharp-regular-svg-icons';
import {
  addTag,
  changedEntryIds,
  coverage,
  draftFromApi,
  entryHasTag,
  isDirty,
  moveEntryTagBy,
  moveEntryTagToFront,
  moveTag,
  moveTagWithinCategory,
  renameTag,
  reorderEntryTag,
  setVisibility,
  toTaxonomyRecord,
  toggleTag,
} from '@/islands/tag-editor/state';
import { Icon } from '@/components/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';


type ApiEntry = DraftEntry & { tags: string[] };

type Focus =
  | { kind: 'tag'; name: string }
  | { kind: 'entry'; id: string }
  | null;


/**
 * The ladder, with labels that say what each rung actually does rather than
 * repeating the identifier. Order matches SKILL_VISIBILITY_ORDER.
 */
const RUNGS: { value: SkillVisibility; label: string; hint: string; className: string }[] = [
  { value: 'hidden',  label: 'Hidden',  hint: 'Nowhere. Not even searchable.',       className: 'border-border bg-transparent text-muted-foreground/50' },
  { value: 'entry',   label: 'Entries', hint: 'On cards and in search only.',        className: 'border-border bg-muted/50 text-muted-foreground' },
  { value: 'sidebar', label: 'Sidebar', hint: 'Also listed in the skills sidebar.',  className: 'border-sky-700/60 bg-sky-700/10 text-sky-700' },
  { value: 'print',   label: 'Print',   hint: 'Also on the printed résumé.',         className: 'border-primary bg-primary/10 text-primary' },
];

const RUNG = Object.fromEntries(RUNGS.map((r) => [r.value, r])) as Record<SkillVisibility, typeof RUNGS[number]>;

const TYPE_LABEL: Record<DraftEntry['type'], string> = {
  experience: 'exp',
  project: 'proj',
  education: 'edu',
};


function Stat(props: { label: string; tone?: 'warn'; value: number | string }) {
  return (
    <div className='flex flex-col gap-0.5'>
      <span className={cn(
        'text-lg font-mono leading-none',
        props.tone === 'warn' ? 'text-destructive' : 'text-foreground',
      )}>
        {props.value}
      </span>
      <span className='text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60'>
        {props.label}
      </span>
    </div>
  );
}


function RungSelect(props: {
  onChange: (value: SkillVisibility) => void;
  value: SkillVisibility;
}) {
  return (
    <select
      className={cn(
        'h-5.5 px-1 border text-[10px] font-mono cursor-pointer appearance-none text-center',
        RUNG[props.value].className,
      )}
      onChange={(e) => props.onChange(e.target.value as SkillVisibility)}
      onClick={(e) => e.stopPropagation()}
      title={RUNG[props.value].hint}
      value={props.value}
    >
      {RUNGS.map((rung) => (
        <option key={rung.value} value={rung.value}>
          {rung.label}
        </option>
      ))}
    </select>
  );
}


/**
 * One tag. Reads as a row of its own when nothing is focused; becomes a
 * checkbox against the focused entry when one is selected, which is the
 * entry → tags direction of the mapping.
 */
function TagRow(props: {
  count: number;
  shelvedCount: number;
  checked: boolean | null;
  focused: boolean;
  onClick: () => void;
  onVisibilityChange: (value: SkillVisibility) => void;
  tag: { name: string; visibility: SkillVisibility };
}) {
  return (
    <div
      className={cn(
        'group flex items-center gap-2 pl-1.5 pr-1 py-0.5 border cursor-pointer',
        props.focused
          ? 'border-primary bg-primary/10'
          : props.checked
            ? 'border-emerald-700/50 bg-emerald-700/8'
            : 'border-transparent hover:border-border hover:bg-muted/40',
      )}
      onClick={props.onClick}
    >
      {props.checked !== null && (
        <span className={cn(
          'grid place-items-center size-3.5 border shrink-0 text-[8px]',
          props.checked
            ? 'border-emerald-700 bg-emerald-700 text-white'
            : 'border-border',
        )}>
          {props.checked && <Icon icon={faCircleCheck} />}
        </span>
      )}

      <span className={cn(
        'flex-1 min-w-0 truncate text-xs font-mono',
        props.tag.visibility === 'hidden' && 'text-muted-foreground/50 line-through decoration-muted-foreground/30',
      )}>
        {props.tag.name}
      </span>

      <span
        className={cn(
          'shrink-0 w-6 text-right text-[10px] font-mono tabular-nums',
          props.count === 0 ? 'text-destructive/70' : 'text-muted-foreground/60',
        )}
        title={[
          `${props.count} live ${props.count === 1 ? 'entry carries' : 'entries carry'} this tag`,
          props.shelvedCount > 0 && `, plus ${props.shelvedCount} shelved`,
          props.count === 0 && ' — it sorts nothing on the résumé',
        ].filter(Boolean).join('')}
      >
        {props.count}
        {props.shelvedCount > 0 && (
          <span className='text-muted-foreground/35'>
            {`+${props.shelvedCount}`}
          </span>
        )}
      </span>

      <RungSelect onChange={props.onVisibilityChange} value={props.tag.visibility} />
    </div>
  );
}


/**
 * An entry's tags, all of them. The editor is deliberately verbose — curating
 * is exactly the job you come here to do, so a long row is information rather
 * than clutter. The résumé card is where the row gets clipped.
 *
 * While the entry is focused the row is reorderable, because a tag's position
 * here is the order it reads on the card, and which tag deserves to lead
 * differs per entry.
 */
function EntryTags(props: {
  onMoveBy: (tag: string, delta: number) => void;
  onMoveToFront: (tag: string) => void;
  onReorder: (from: number, to: number) => void;
  onTagClick: (tag: string) => void;
  reorderable: boolean;
  tags: string[];
  visibilityOf: (tag: string) => SkillVisibility;
}) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  if (props.tags.length === 0)
    return null;

  return (
    <div className='flex flex-col gap-1 pl-1'>
      <div className='flex items-start gap-1'>
        <div className='flex-1 flex flex-wrap gap-1'>
          {props.tags.map((tag, index) => (
            <button
              key={tag}
              className={cn(
                'h-5 px-1.5 border text-[10px] font-mono cursor-pointer',
                RUNG[props.visibilityOf(tag)].className,
                props.reorderable && 'cursor-grab active:cursor-grabbing',
                dragIndex === index && 'opacity-40',
                overIndex === index && dragIndex !== index && 'ring-1 ring-primary',
                !props.reorderable && 'hover:opacity-70',
              )}
              draggable={props.reorderable}
              onClick={(e) => {
                e.stopPropagation();

                if (props.reorderable)
                  props.onMoveToFront(tag);
                else
                  props.onTagClick(tag);
              }}
              onDragEnd={() => {
                setDragIndex(null);
                setOverIndex(null);
              }}
              onDragOver={(e) => {
                if (dragIndex === null) return;
                e.preventDefault();
                setOverIndex(index);
              }}
              onDragStart={() => setDragIndex(index)}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (dragIndex !== null) props.onReorder(dragIndex, index);
                setDragIndex(null);
                setOverIndex(null);
              }}
              onKeyDown={(e) => {
                if (!props.reorderable) return;

                if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                  e.preventDefault();
                  e.stopPropagation();
                  props.onMoveBy(tag, e.key === 'ArrowLeft' ? -1 : 1);
                }
              }}
              title={props.reorderable
                ? `${tag} — click to move to front, drag to reorder, ←/→ to nudge`
                : `Focus ${tag}`}
              type='button'
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {props.reorderable && (
        <span className='text-[10px] font-mono text-muted-foreground/50'>
          {`Order is how these read on the card — click a tag to move it to the front, or drag to place it.`}
        </span>
      )}
    </div>
  );
}


/**
 * One résumé entry. Mirrors TagRow: a row on its own, a checkbox against the
 * focused tag — the tags → entries direction.
 */
function EntryRow(props: {
  checked: boolean | null;
  entry: ApiEntry;
  focused: boolean;
  onClick: () => void;
  onMoveBy: (tag: string, delta: number) => void;
  onMoveToFront: (tag: string) => void;
  onReorder: (from: number, to: number) => void;
  onTagClick: (tag: string) => void;
  tags: string[];
  visibilityOf: (tag: string) => SkillVisibility;
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-1.5 p-2 border cursor-pointer',
        props.focused
          ? 'border-primary bg-primary/8'
          : props.checked
            ? 'border-emerald-700/50 bg-emerald-700/8'
            : 'border-border-light hover:border-border hover:bg-muted/30',
      )}
      onClick={props.onClick}
    >
      <div className='flex items-center gap-2'>
        {props.checked !== null && (
          <span className={cn(
            'grid place-items-center size-3.5 border shrink-0 text-[8px]',
            props.checked ? 'border-emerald-700 bg-emerald-700 text-white' : 'border-border',
          )}>
            {props.checked && <Icon icon={faCircleCheck} />}
          </span>
        )}

        <span className='text-[10px] font-mono uppercase tracking-wider text-muted-foreground/50 w-8 shrink-0'>
          {TYPE_LABEL[props.entry.type]}
        </span>

        <span className='flex-1 min-w-0 truncate text-xs font-medium'>
          {props.entry.organizationName || props.entry.title || props.entry.id}
          {props.entry.title && props.entry.organizationName && (
            <span className='text-muted-foreground font-normal'>
              {` — ${props.entry.title}`}
            </span>
          )}
        </span>

        {props.entry.hidden && (
          <span className='shrink-0 text-[10px] font-mono text-muted-foreground/50' title='Shelved — hidden from the résumé list'>
            {`shelved`}
          </span>
        )}

        <span className={cn(
          'shrink-0 text-[10px] font-mono tabular-nums',
          props.tags.length === 0 ? 'text-destructive/70' : 'text-muted-foreground/60',
        )}>
          {props.tags.length}
        </span>
      </div>

      <EntryTags
        onMoveBy={props.onMoveBy}
        onMoveToFront={props.onMoveToFront}
        onReorder={props.onReorder}
        onTagClick={props.onTagClick}
        reorderable={props.focused}
        tags={props.tags}
        visibilityOf={props.visibilityOf}
      />
    </div>
  );
}


export default function TagEditor(props: {
  initialEntries: ApiEntry[];
  initialTaxonomy: TaxonomyRecord;
}) {
  const initial = useMemo(
    () => draftFromApi(props.initialTaxonomy, props.initialEntries),
    [props.initialEntries, props.initialTaxonomy],
  );

  const [draft, setDraft] = useState<Draft>(initial);
  const [focus, setFocus] = useState<Focus>(null);
  const [tagFilter, setTagFilter] = useState('');
  const [unusedOnly, setUnusedOnly] = useState(false);
  const [newTagCategory, setNewTagCategory] = useState('');
  const [newTagName, setNewTagName] = useState('');
  const [status, setStatus] = useState<{ kind: 'error' | 'ok'; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  // Two counts, because they answer different questions: `counts` is what the
  // live résumé sees, `allCounts` includes shelved entries so editing one still
  // shows its tags as used.
  const liveIds = useMemo(
    () => new Set(props.initialEntries.filter((e) => !e.hidden).map((e) => e.id)),
    [props.initialEntries],
  );

  const counts = useMemo(() => coverage(draft, liveIds), [draft, liveIds]);
  const allCounts = useMemo(() => coverage(draft), [draft]);
  const dirty = isDirty(initial, draft);
  const changed = useMemo(() => changedEntryIds(initial, draft), [initial, draft]);

  const visibilityLookup = useCallback(
    (tag: string) =>
      draft.categories.flatMap((c) => c.tags).find((t) => t.name === tag)?.visibility ?? 'hidden',
    [draft],
  );

  // Every mutation funnels through here so a rejected edit — a duplicate name,
  // an unknown category — surfaces as a message instead of throwing into React.
  const apply = useCallback((fn: (d: Draft) => Draft) => {
    setStatus(null);
    setDraft((current) => {
      try {
        return fn(current);
      } catch (error) {
        setStatus({ kind: 'error', text: error instanceof Error ? error.message : 'Edit failed.' });
        return current;
      }
    });
  }, []);

  const stats = useMemo(() => {
    const tags = draft.categories.flatMap((c) => c.tags);

    return {
      total: tags.length,
      sidebar: tags.filter((t) => t.visibility === 'sidebar' || t.visibility === 'print').length,
      uncovered: tags.filter((t) => (counts.get(t.name) ?? 0) === 0 && t.visibility !== 'hidden').length,
      untagged: Object.entries(draft.tagsById)
        .filter(([id, list]) => list.length === 0
          && !props.initialEntries.find((e) => e.id === id)?.hidden).length,
    };
  }, [counts, draft, props.initialEntries]);

  const visibleCategories = useMemo(() => {
    const needle = tagFilter.trim().toLowerCase();

    return draft.categories
      .map((category) => ({
        ...category,
        tags: category.tags.filter((tag) => {
          if (needle && !tag.name.toLowerCase().includes(needle)) return false;
          if (unusedOnly && (counts.get(tag.name) ?? 0) > 0) return false;
          return true;
        }),
      }))
      .filter((category) => category.tags.length > 0);
  }, [counts, draft.categories, tagFilter, unusedOnly]);

  const focusedTag = focus?.kind === 'tag' ? focus.name : null;
  const focusedEntry = focus?.kind === 'entry' ? focus.id : null;

  async function save() {
    setSaving(true);
    setStatus(null);

    try {
      const response = await fetch('/api/resume-tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taxonomy: toTaxonomyRecord(draft),
          tagsById: draft.tagsById,
        }),
      });

      const body = await response.json();

      if (!response.ok) {
        setStatus({
          kind: 'error',
          text: [body.error, ...(body.problems ?? []), body.message].filter(Boolean).join(' '),
        });
        return;
      }

      setStatus({
        kind: 'ok',
        text: `Wrote ${body.written.length} ${body.written.length === 1 ? 'file' : 'files'}. Review with git diff — the dev server will reload.`,
      });
    } catch (error) {
      setStatus({
        kind: 'error',
        text: error instanceof Error ? error.message : 'The save request failed.',
      });
    } finally {
      setSaving(false);
    }
  }


  return (
    <div className='flex flex-col h-screen'>
      {/* ── Header: stats, the focus hint, and save ──────────────────────── */}
      <div className='shrink-0 border-b border-border px-4 py-3'>
        <div className='flex items-start justify-between gap-6 flex-wrap'>
          <div className='flex items-center gap-6'>
            <div className='flex flex-col gap-0.5'>
              <h1 className='text-sm font-semibold'>
                {`Tag editor`}
              </h1>
              <span className='text-[10px] font-mono text-muted-foreground/60'>
                {`dev only · writes to src/data/resume/`}
              </span>
            </div>
            <Stat label='tags' value={stats.total} />
            <Stat label='in sidebar' value={stats.sidebar} />
            <Stat label='on no live entry' tone={stats.uncovered > 0 ? 'warn' : undefined} value={stats.uncovered} />
            <Stat label='untagged entries' tone={stats.untagged > 0 ? 'warn' : undefined} value={stats.untagged} />
          </div>

          <div className='flex items-center gap-3'>
            {dirty && (
              <span className='text-[10px] font-mono text-muted-foreground'>
                {`${changed.length} ${changed.length === 1 ? 'entry' : 'entries'} edited`}
              </span>
            )}
            <Button
              className='font-sans'
              disabled={!dirty || saving}
              onClick={save}
              variant={dirty ? 'default' : 'outline'}
            >
              {saving ? 'Saving…' : dirty ? 'Save to source' : 'No changes'}
            </Button>
          </div>
        </div>

        {status && (
          <div className={cn(
            'flex items-start gap-2 mt-2 px-2 py-1.5 border text-xs',
            status.kind === 'error'
              ? 'border-destructive/50 bg-destructive/8 text-destructive'
              : 'border-primary/50 bg-primary/8 text-primary',
          )}>
            <Icon
              className='mt-0.5 text-[10px] shrink-0'
              icon={status.kind === 'error' ? faTriangleExclamation : faCircleCheck}
            />
            <span>{status.text}</span>
          </div>
        )}
      </div>

      {/* ── The two directions, side by side ─────────────────────────────── */}
      <div className='flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]'>
        {/* Tags */}
        <div className='flex flex-col min-h-0 border-r border-border'>
          <div className='shrink-0 flex flex-col gap-2 px-3 py-2 border-b border-border-light'>
            <div className='flex items-center justify-between gap-2'>
              <span className='text-[10px] font-mono uppercase tracking-widest text-muted-foreground'>
                {focusedEntry ? 'Tags — click to assign' : 'Tags'}
              </span>
              <label className='flex items-center gap-1 text-[10px] font-mono text-muted-foreground cursor-pointer'>
                <input
                  checked={unusedOnly}
                  className='cursor-pointer'
                  onChange={(e) => setUnusedOnly(e.target.checked)}
                  type='checkbox'
                />
                {`on no live entry`}
              </label>
            </div>
            <Input
              className='h-7 text-xs bg-muted/50'
              onChange={(e) => setTagFilter(e.target.value)}
              placeholder='Filter tags…'
              value={tagFilter}
            />
          </div>

          <div className='flex-1 overflow-y-auto min-h-0 px-2 py-2 flex flex-col gap-3'>
            {visibleCategories.map((category) => (
              <div key={category.name} className='flex flex-col gap-0.5'>
                <span className='px-1.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60'>
                  {category.name}
                </span>

                {category.tags.map((tag) => (
                  <TagRow
                    key={tag.name}
                    checked={focusedEntry ? entryHasTag(draft, focusedEntry, tag.name) : null}
                    count={counts.get(tag.name) ?? 0}
                    shelvedCount={(allCounts.get(tag.name) ?? 0) - (counts.get(tag.name) ?? 0)}
                    focused={focusedTag === tag.name}
                    onClick={() => {
                      if (focusedEntry) {
                        apply((d) => toggleTag(d, focusedEntry, tag.name));
                        return;
                      }

                      setFocus(focusedTag === tag.name ? null : { kind: 'tag', name: tag.name });
                    }}
                    onVisibilityChange={(value) => apply((d) => setVisibility(d, tag.name, value))}
                    tag={tag}
                  />
                ))}
              </div>
            ))}

            {visibleCategories.length === 0 && (
              <p className='px-1.5 py-4 text-xs text-muted-foreground'>
                {`No tags match that filter.`}
              </p>
            )}
          </div>

          {/* Add a tag */}
          <div className='shrink-0 flex items-center gap-1 px-2 py-2 border-t border-border-light'>
            <select
              className='h-7 px-1 border border-border bg-muted/50 text-[10px] font-mono cursor-pointer max-w-28'
              onChange={(e) => setNewTagCategory(e.target.value)}
              value={newTagCategory || draft.categories[0]?.name || ''}
            >
              {draft.categories.map((category) => (
                <option key={category.name} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
            <Input
              className='h-7 flex-1 text-xs bg-muted/50'
              onChange={(e) => setNewTagName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key !== 'Enter' || !newTagName.trim()) return;
                apply((d) => addTag(d, newTagCategory || d.categories[0].name, newTagName));
                setNewTagName('');
              }}
              placeholder='New tag…'
              value={newTagName}
            />
            <Button
              className='font-sans shrink-0'
              disabled={!newTagName.trim()}
              onClick={() => {
                apply((d) => addTag(d, newTagCategory || d.categories[0].name, newTagName));
                setNewTagName('');
              }}
              size='icon'
              variant='outline'
            >
              <Icon className='text-xs' icon={faPlus} />
            </Button>
          </div>
        </div>

        {/* Entries, and the inspector for a focused tag */}
        <div className='flex flex-col min-h-0'>
          <div className='shrink-0 flex items-center justify-between gap-2 px-3 py-2 border-b border-border-light'>
            <span className='text-[10px] font-mono uppercase tracking-widest text-muted-foreground'>
              {focusedTag ? 'Entries — click to assign' : 'Entries'}
            </span>
            {focus && (
              <button
                className='text-[10px] font-mono text-muted-foreground hover:text-foreground cursor-pointer'
                onClick={() => setFocus(null)}
                type='button'
              >
                {`Clear focus`}
              </button>
            )}
          </div>

          {focusedTag && (
            <TagInspector
              categories={draft.categories.map((c) => c.name)}
              category={draft.categories.find((c) => c.tags.some((t) => t.name === focusedTag))?.name ?? ''}
              count={counts.get(focusedTag) ?? 0}
              onMove={(category) => apply((d) => moveTag(d, focusedTag, category))}
              onRename={(name) => {
                apply((d) => renameTag(d, focusedTag, name));
                setFocus({ kind: 'tag', name: name.trim() });
              }}
              onReorder={(delta) => apply((d) => moveTagWithinCategory(d, focusedTag, delta))}
              tag={focusedTag}
            />
          )}

          {!focus && (
            <p className='shrink-0 px-3 py-2 text-xs text-muted-foreground border-b border-border-light'>
              {`Click a tag to see and edit which entries carry it. Click an entry to see and edit which tags it has.`}
            </p>
          )}

          <div className='flex-1 overflow-y-auto min-h-0 p-2 flex flex-col gap-1.5'>
            {props.initialEntries.map((entry) => (
              <EntryRow
                key={entry.id}
                checked={focusedTag ? entryHasTag(draft, entry.id, focusedTag) : null}
                entry={entry}
                focused={focusedEntry === entry.id}
                onClick={() => {
                  if (focusedTag) {
                    apply((d) => toggleTag(d, entry.id, focusedTag));
                    return;
                  }

                  setFocus(focusedEntry === entry.id ? null : { kind: 'entry', id: entry.id });
                }}
                onMoveBy={(tag, delta) => apply((d) => moveEntryTagBy(d, entry.id, tag, delta))}
                onMoveToFront={(tag) => apply((d) => moveEntryTagToFront(d, entry.id, tag))}
                onReorder={(from, to) => apply((d) => reorderEntryTag(d, entry.id, from, to))}
                onTagClick={(tag) => setFocus({ kind: 'tag', name: tag })}
                tags={draft.tagsById[entry.id] ?? []}
                visibilityOf={visibilityLookup}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


/** Rename, recategorize, and reorder the focused tag. */
function TagInspector(props: {
  categories: string[];
  category: string;
  count: number;
  onMove: (category: string) => void;
  onRename: (name: string) => void;
  onReorder: (delta: number) => void;
  tag: string;
}) {
  const [name, setName] = useState(props.tag);

  // A different tag took focus, so the field follows it rather than holding a
  // half-typed rename of the tag you just left.
  if (name !== props.tag && document.activeElement?.tagName !== 'INPUT')
    setName(props.tag);

  return (
    <div className='shrink-0 flex items-end gap-2 px-3 py-2 border-b border-border-light bg-muted/30 flex-wrap'>
      <label className='flex flex-col gap-1'>
        <span className='text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60'>
          {`Name`}
        </span>
        <Input
          className='h-7 w-52 text-xs bg-background'
          onBlur={() => name.trim() && name !== props.tag && props.onRename(name)}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && name.trim() && name !== props.tag) props.onRename(name);
            if (e.key === 'Escape') setName(props.tag);
          }}
          value={name}
        />
      </label>

      <label className='flex flex-col gap-1'>
        <span className='text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60'>
          {`Category`}
        </span>
        <select
          className='h-7 px-1 border border-border bg-background text-xs cursor-pointer'
          onChange={(e) => props.onMove(e.target.value)}
          value={props.category}
        >
          {props.categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </label>

      <div className='flex flex-col gap-1'>
        <span className='text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60'>
          {`Order`}
        </span>
        <div className='flex gap-1'>
          <Button className='font-sans' onClick={() => props.onReorder(-1)} size='icon' variant='outline'>
            <Icon className='text-[10px]' icon={faArrowUp} />
          </Button>
          <Button className='font-sans' onClick={() => props.onReorder(1)} size='icon' variant='outline'>
            <Icon className='text-[10px]' icon={faArrowDown} />
          </Button>
        </div>
      </div>

      {props.count === 0 && (
        <span className='flex items-center gap-1.5 h-7 text-[10px] font-mono text-destructive'>
          <Icon icon={faCircleExclamation} />
          {`On no live entry — it will sort nothing on the résumé`}
        </span>
      )}
    </div>
  );
}
