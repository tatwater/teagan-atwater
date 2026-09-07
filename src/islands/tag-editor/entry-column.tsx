import type { SkillVisibility } from '@/data/resume/skills';
import type { ApiEntry } from '@/islands/tag-editor/state';

import { useState } from 'react';
import {
  faArrowDown,
  faArrowUp,
  faCircleCheck,
  faCircleExclamation,
} from '@fortawesome/sharp-regular-svg-icons';
import { RUNG, TYPE_LABEL } from '@/islands/tag-editor/rungs';
import { Icon } from '@/components/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';


export interface EntryTagActions {
  onMoveBy: (tag: string, delta: number) => void;
  onMoveToFront: (tag: string) => void;
  onReorder: (from: number, to: number) => void;
  onTagClick: (tag: string) => void;
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
function EntryTags(props: EntryTagActions & {
  reorderable: boolean;
  tags: string[];
  visibilityOf: (tag: string) => SkillVisibility;
}) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const endDrag = () => {
    setDragIndex(null);
    setOverIndex(null);
  };

  if (props.tags.length === 0)
    return null;

  return (
    <div className='flex flex-col gap-1 pl-1'>
      <div className='flex flex-wrap gap-1'>
        {props.tags.map((tag, index) => (
          <button
            key={tag}
            className={cn(
              'h-5 px-1.5 border text-[10px] font-mono cursor-pointer',
              RUNG[props.visibilityOf(tag)].className,
              props.reorderable ? 'cursor-grab active:cursor-grabbing' : 'hover:opacity-70',
              dragIndex === index && 'opacity-40',
              overIndex === index && dragIndex !== index && 'ring-1 ring-primary',
            )}
            draggable={props.reorderable}
            onClick={(e) => {
              e.stopPropagation();

              if (props.reorderable)
                props.onMoveToFront(tag);
              else
                props.onTagClick(tag);
            }}
            onDragEnd={endDrag}
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
              endDrag();
            }}
            onKeyDown={(e) => {
              if (!props.reorderable) return;
              if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;

              e.preventDefault();
              e.stopPropagation();
              props.onMoveBy(tag, e.key === 'ArrowLeft' ? -1 : 1);
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

      {props.reorderable && (
        <span className='text-[10px] font-mono text-muted-foreground/50'>
          {`Order is how these read on the card — click a tag to move it to the front, or drag to place it.`}
        </span>
      )}
    </div>
  );
}


/** The entry's own line: type, name, shelved marker, and how many tags it has. */
function EntryHeading(props: { checked: boolean | null; entry: ApiEntry; tagCount: number }) {
  return (
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
        <span
          className='shrink-0 text-[10px] font-mono text-muted-foreground/50'
          title='Shelved — hidden from the résumé list'
        >
          {`shelved`}
        </span>
      )}

      <span className={cn(
        'shrink-0 text-[10px] font-mono tabular-nums',
        props.tagCount === 0 ? 'text-destructive/70' : 'text-muted-foreground/60',
      )}>
        {props.tagCount}
      </span>
    </div>
  );
}


/**
 * One résumé entry. Mirrors TagRow: a row on its own, a checkbox against the
 * focused tag — the tags → entries direction.
 */
function EntryRow(props: EntryTagActions & {
  checked: boolean | null;
  entry: ApiEntry;
  focused: boolean;
  onClick: () => void;
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
      <EntryHeading checked={props.checked} entry={props.entry} tagCount={props.tags.length} />

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

  const rename = () => {
    if (name.trim() && name !== props.tag) props.onRename(name);
  };

  return (
    <div className='shrink-0 flex items-end gap-2 px-3 py-2 border-b border-border-light bg-muted/30 flex-wrap'>
      <label className='flex flex-col gap-1'>
        <span className='text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60'>
          {`Name`}
        </span>
        <Input
          className='h-7 w-52 text-xs bg-background'
          onBlur={rename}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') rename();
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


/**
 * The entries side of the editor, plus the inspector for whichever tag is
 * focused. Clicking an entry focuses it — unless a tag is already focused, in
 * which case clicking assigns instead.
 */
export function EntryColumn(props: {
  entries: ApiEntry[];
  entryHasFocusedTag: (id: string) => boolean;
  focusedEntry: string | null;
  focusedTag: string | null;
  inspector: {
    categories: string[];
    category: string;
    count: number;
    onMove: (category: string) => void;
    onRename: (name: string) => void;
    onReorder: (delta: number) => void;
  };
  onClearFocus: () => void;
  onEntryClick: (id: string) => void;
  tagActionsFor: (id: string) => EntryTagActions;
  tagsFor: (id: string) => string[];
  visibilityOf: (tag: string) => SkillVisibility;
}) {
  const focused = Boolean(props.focusedTag || props.focusedEntry);

  return (
    <div className='flex flex-col min-h-0'>
      <div className='shrink-0 flex items-center justify-between gap-2 px-3 py-2 border-b border-border-light'>
        <span className='text-[10px] font-mono uppercase tracking-widest text-muted-foreground'>
          {props.focusedTag ? 'Entries — click to assign' : 'Entries'}
        </span>
        {focused && (
          <button
            className='text-[10px] font-mono text-muted-foreground hover:text-foreground cursor-pointer'
            onClick={props.onClearFocus}
            type='button'
          >
            {`Clear focus`}
          </button>
        )}
      </div>

      {props.focusedTag && (
        <TagInspector {...props.inspector} tag={props.focusedTag} />
      )}

      {!focused && (
        <p className='shrink-0 px-3 py-2 text-xs text-muted-foreground border-b border-border-light'>
          {`Click a tag to see and edit which entries carry it. Click an entry to see and edit which tags it has.`}
        </p>
      )}

      <div className='flex-1 overflow-y-auto min-h-0 p-2 flex flex-col gap-1.5'>
        {props.entries.map((entry) => (
          <EntryRow
            key={entry.id}
            checked={props.focusedTag ? props.entryHasFocusedTag(entry.id) : null}
            entry={entry}
            focused={props.focusedEntry === entry.id}
            onClick={() => props.onEntryClick(entry.id)}
            tags={props.tagsFor(entry.id)}
            visibilityOf={props.visibilityOf}
            {...props.tagActionsFor(entry.id)}
          />
        ))}
      </div>
    </div>
  );
}
