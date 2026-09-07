import type { SkillVisibility } from '@/data/resume/skills';
import type { TaxonomyRecord } from '@/lib/tag-source';
import type { ApiEntry, Draft } from '@/islands/tag-editor/state';

import { useCallback, useMemo, useState } from 'react';
import { faCircleCheck, faTriangleExclamation } from '@fortawesome/sharp-regular-svg-icons';
import {
  addTag,
  allTags,
  categoryOf,
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
  visibilityOfTag,
} from '@/islands/tag-editor/state';
import { EntryColumn } from '@/islands/tag-editor/entry-column';
import { TagColumn } from '@/islands/tag-editor/tag-column';
import { Icon } from '@/components/icon';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';


interface Status {
  kind: 'error' | 'ok';
  text: string;
}

/**
 * What the editor is currently pointed at. Focusing a tag turns the entry list
 * into checkboxes for it; focusing an entry does the same to the tag list. That
 * is the whole "both directions" of the mapping, in one piece of state — the
 * columns receive the two halves of it rather than the union.
 */
type Focus =
  | { kind: 'tag'; name: string }
  | { kind: 'entry'; id: string }
  | null;


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


function EditorHeader(props: {
  changedCount: number;
  dirty: boolean;
  onSave: () => void;
  saving: boolean;
  stats: { sidebar: number; total: number; uncovered: number; untagged: number };
  status: Status | null;
}) {
  const { stats } = props;

  return (
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
          {props.dirty && (
            <span className='text-[10px] font-mono text-muted-foreground'>
              {`${props.changedCount} ${props.changedCount === 1 ? 'entry' : 'entries'} edited`}
            </span>
          )}
          <Button
            className='font-sans'
            disabled={!props.dirty || props.saving}
            onClick={props.onSave}
            variant={props.dirty ? 'default' : 'outline'}
          >
            {props.saving ? 'Saving…' : props.dirty ? 'Save to source' : 'No changes'}
          </Button>
        </div>
      </div>

      {props.status && (
        <div className={cn(
          'flex items-start gap-2 mt-2 px-2 py-1.5 border text-xs',
          props.status.kind === 'error'
            ? 'border-destructive/50 bg-destructive/8 text-destructive'
            : 'border-primary/50 bg-primary/8 text-primary',
        )}>
          <Icon
            className='mt-0.5 text-[10px] shrink-0'
            icon={props.status.kind === 'error' ? faTriangleExclamation : faCircleCheck}
          />
          <span>{props.status.text}</span>
        </div>
      )}
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
  const [status, setStatus] = useState<Status | null>(null);
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
    (tag: string): SkillVisibility => visibilityOfTag(draft, tag) ?? 'hidden',
    [draft],
  );

  // Every mutation funnels through here so a rejected edit — a duplicate name,
  // an unknown category — surfaces as a message instead of throwing into React.
  // It reports whether the edit landed, so a caller with follow-up state to set
  // does not set it on an edit the draft refused.
  const apply = useCallback((fn: (d: Draft) => Draft): boolean => {
    try {
      const next = fn(draft);

      setStatus(null);
      setDraft(next);

      return true;
    } catch (error) {
      setStatus({ kind: 'error', text: error instanceof Error ? error.message : 'Edit failed.' });

      return false;
    }
  }, [draft]);

  const stats = useMemo(() => {
    const tags = allTags(draft);

    return {
      total: tags.length,
      sidebar: tags.filter((t) => t.visibility === 'sidebar' || t.visibility === 'print').length,
      uncovered: tags.filter((t) =>
        (counts.get(t.name) ?? 0) === 0 && t.visibility !== 'hidden').length,
      untagged: Object.entries(draft.tagsById)
        .filter(([id, list]) => list.length === 0 && liveIds.has(id)).length,
    };
  }, [counts, draft, liveIds]);

  const focusedTag = focus?.kind === 'tag' ? focus.name : null;
  const focusedEntry = focus?.kind === 'entry' ? focus.id : null;

  // Clicking either side means "assign" when the other side holds focus, and
  // "focus me" otherwise. Both columns share that rule, in both directions.
  const handleTagClick = useCallback((tag: string) => {
    if (focusedEntry) {
      apply((d) => toggleTag(d, focusedEntry, tag));
      return;
    }

    setFocus((prev) => (prev?.kind === 'tag' && prev.name === tag ? null : { kind: 'tag', name: tag }));
  }, [apply, focusedEntry]);

  const handleEntryClick = useCallback((id: string) => {
    if (focusedTag) {
      apply((d) => toggleTag(d, id, focusedTag));
      return;
    }

    setFocus((prev) => (prev?.kind === 'entry' && prev.id === id ? null : { kind: 'entry', id }));
  }, [apply, focusedTag]);

  const tagActionsFor = useCallback((id: string) => ({
    onMoveBy: (tag: string, delta: number) => apply((d) => moveEntryTagBy(d, id, tag, delta)),
    onMoveToFront: (tag: string) => apply((d) => moveEntryTagToFront(d, id, tag)),
    onReorder: (from: number, to: number) => apply((d) => reorderEntryTag(d, id, from, to)),
    onTagClick: (tag: string) => setFocus({ kind: 'tag', name: tag }),
  }), [apply]);

  const save = useCallback(async () => {
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

      const count = body.written.length;

      setStatus({
        kind: 'ok',
        text: `Wrote ${count} ${count === 1 ? 'file' : 'files'}. Review with git diff — the dev server will reload.`,
      });
    } catch (error) {
      setStatus({
        kind: 'error',
        text: error instanceof Error ? error.message : 'The save request failed.',
      });
    } finally {
      setSaving(false);
    }
  }, [draft]);


  return (
    <div className='flex flex-col h-screen'>
      <EditorHeader
        changedCount={changed.length}
        dirty={dirty}
        onSave={save}
        saving={saving}
        stats={stats}
        status={status}
      />

      {/* The two directions, side by side */}
      <div className='flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]'>
        <TagColumn
          allCounts={allCounts}
          counts={counts}
          draft={draft}
          focusedEntry={focusedEntry}
          focusedTag={focusedTag}
          hasTag={(tag) => Boolean(focusedEntry && entryHasTag(draft, focusedEntry, tag))}
          onAddTag={(category, name) => apply((d) => addTag(d, category, name))}
          onTagClick={handleTagClick}
          onVisibilityChange={(tag, value) => apply((d) => setVisibility(d, tag, value))}
        />

        <EntryColumn
          entries={props.initialEntries}
          entryHasFocusedTag={(id) => Boolean(focusedTag && entryHasTag(draft, id, focusedTag))}
          focusedEntry={focusedEntry}
          focusedTag={focusedTag}
          inspector={{
            categories: draft.categories.map((c) => c.name),
            category: focusedTag ? categoryOf(draft, focusedTag) ?? '' : '',
            count: focusedTag ? counts.get(focusedTag) ?? 0 : 0,
            onMove: (category) => focusedTag && apply((d) => moveTag(d, focusedTag, category)),
            onRename: (name) => {
              // Only follow the tag if it actually moved: a rejected rename —
              // a name already taken — would otherwise leave focus pointing at
              // a tag the draft never grew.
              if (focusedTag && apply((d) => renameTag(d, focusedTag, name)))
                setFocus({ kind: 'tag', name: name.trim() });
            },
            onReorder: (delta) =>
              focusedTag && apply((d) => moveTagWithinCategory(d, focusedTag, delta)),
          }}
          onClearFocus={() => setFocus(null)}
          onEntryClick={handleEntryClick}
          tagActionsFor={tagActionsFor}
          tagsFor={(id) => draft.tagsById[id] ?? []}
          visibilityOf={visibilityLookup}
        />
      </div>
    </div>
  );
}
