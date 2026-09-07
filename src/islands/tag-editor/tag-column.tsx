import type { SkillVisibility } from '@/data/resume/skills';
import type { Draft, DraftCategory } from '@/islands/tag-editor/state';

import { useMemo, useState } from 'react';
import { faCircleCheck, faPlus } from '@fortawesome/sharp-regular-svg-icons';
import { RUNG, RUNGS } from '@/islands/tag-editor/rungs';
import { Icon } from '@/components/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';


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


/** The live count, with shelved carriers shown dim beside it. */
function CoverageCount(props: { count: number; shelved: number }) {
  const title = [
    `${props.count} live ${props.count === 1 ? 'entry carries' : 'entries carry'} this tag`,
    props.shelved > 0 && `, plus ${props.shelved} shelved`,
    props.count === 0 && ' — it sorts nothing on the résumé',
  ].filter(Boolean).join('');

  return (
    <span
      className={cn(
        'shrink-0 w-6 text-right text-[10px] font-mono tabular-nums',
        props.count === 0 ? 'text-destructive/70' : 'text-muted-foreground/60',
      )}
      title={title}
    >
      {props.count}
      {props.shelved > 0 && (
        <span className='text-muted-foreground/35'>
          {`+${props.shelved}`}
        </span>
      )}
    </span>
  );
}


/**
 * One tag. Reads as a row of its own when nothing is focused; becomes a
 * checkbox against the focused entry when one is selected, which is the
 * entry → tags direction of the mapping.
 */
function TagRow(props: {
  checked: boolean | null;
  count: number;
  focused: boolean;
  onClick: () => void;
  onVisibilityChange: (value: SkillVisibility) => void;
  shelvedCount: number;
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
          props.checked ? 'border-emerald-700 bg-emerald-700 text-white' : 'border-border',
        )}>
          {props.checked && <Icon icon={faCircleCheck} />}
        </span>
      )}

      <span className={cn(
        'flex-1 min-w-0 truncate text-xs font-mono',
        props.tag.visibility === 'hidden'
          && 'text-muted-foreground/50 line-through decoration-muted-foreground/30',
      )}>
        {props.tag.name}
      </span>

      <CoverageCount count={props.count} shelved={props.shelvedCount} />

      <RungSelect onChange={props.onVisibilityChange} value={props.tag.visibility} />
    </div>
  );
}


/** The add-a-tag form pinned to the bottom of the column. */
function AddTagForm(props: {
  categories: DraftCategory[];
  onAdd: (category: string, name: string) => void;
}) {
  const [category, setCategory] = useState('');
  const [name, setName] = useState('');

  const submit = () => {
    if (!name.trim()) return;

    props.onAdd(category || props.categories[0]?.name || '', name);
    setName('');
  };

  return (
    <div className='shrink-0 flex items-center gap-1 px-2 py-2 border-t border-border-light'>
      <select
        className='h-7 px-1 border border-border bg-muted/50 text-[10px] font-mono cursor-pointer max-w-28'
        onChange={(e) => setCategory(e.target.value)}
        value={category || props.categories[0]?.name || ''}
      >
        {props.categories.map((c) => (
          <option key={c.name} value={c.name}>
            {c.name}
          </option>
        ))}
      </select>

      <Input
        className='h-7 flex-1 text-xs bg-muted/50'
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
        placeholder='New tag…'
        value={name}
      />

      <Button
        className='font-sans shrink-0'
        disabled={!name.trim()}
        onClick={submit}
        size='icon'
        variant='outline'
      >
        <Icon className='text-xs' icon={faPlus} />
      </Button>
    </div>
  );
}


/**
 * The taxonomy side of the editor: every tag, grouped by category, filterable,
 * with its rung and its coverage. Clicking a tag focuses it — unless an entry is
 * already focused, in which case clicking assigns instead.
 */
export function TagColumn(props: {
  allCounts: Map<string, number>;
  counts: Map<string, number>;
  draft: Draft;
  focusedEntry: string | null;
  focusedTag: string | null;
  hasTag: (tag: string) => boolean;
  onAddTag: (category: string, name: string) => void;
  onTagClick: (tag: string) => void;
  onVisibilityChange: (tag: string, value: SkillVisibility) => void;
}) {
  const [filter, setFilter] = useState('');
  const [unusedOnly, setUnusedOnly] = useState(false);

  const categories = useMemo(() => {
    const needle = filter.trim().toLowerCase();

    return props.draft.categories
      .map((category) => ({
        ...category,
        tags: category.tags.filter((tag) => {
          if (needle && !tag.name.toLowerCase().includes(needle)) return false;
          if (unusedOnly && (props.counts.get(tag.name) ?? 0) > 0) return false;
          return true;
        }),
      }))
      .filter((category) => category.tags.length > 0);
  }, [filter, props.counts, props.draft.categories, unusedOnly]);

  return (
    <div className='flex flex-col min-h-0 border-r border-border'>
      <div className='shrink-0 flex flex-col gap-2 px-3 py-2 border-b border-border-light'>
        <div className='flex items-center justify-between gap-2'>
          <span className='text-[10px] font-mono uppercase tracking-widest text-muted-foreground'>
            {props.focusedEntry ? 'Tags — click to assign' : 'Tags'}
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
          onChange={(e) => setFilter(e.target.value)}
          placeholder='Filter tags…'
          value={filter}
        />
      </div>

      <div className='flex-1 overflow-y-auto min-h-0 px-2 py-2 flex flex-col gap-3'>
        {categories.map((category) => (
          <div key={category.name} className='flex flex-col gap-0.5'>
            <span className='px-1.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60'>
              {category.name}
            </span>

            {category.tags.map((tag) => (
              <TagRow
                key={tag.name}
                checked={props.focusedEntry ? props.hasTag(tag.name) : null}
                count={props.counts.get(tag.name) ?? 0}
                focused={props.focusedTag === tag.name}
                onClick={() => props.onTagClick(tag.name)}
                onVisibilityChange={(value) => props.onVisibilityChange(tag.name, value)}
                shelvedCount={
                  (props.allCounts.get(tag.name) ?? 0) - (props.counts.get(tag.name) ?? 0)
                }
                tag={tag}
              />
            ))}
          </div>
        ))}

        {categories.length === 0 && (
          <p className='px-1.5 py-4 text-xs text-muted-foreground'>
            {`No tags match that filter.`}
          </p>
        )}
      </div>

      <AddTagForm categories={props.draft.categories} onAdd={props.onAddTag} />
    </div>
  );
}
