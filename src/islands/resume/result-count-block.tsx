import { useState } from 'react';
import { detectPlatform, MAC_MODIFIER_SYMBOLS } from '@tanstack/react-hotkeys';
import { faChevronUp } from '@fortawesome/sharp-regular-svg-icons';
import { AnimatePresence, motion } from 'motion/react';
import { Icon } from '@/components/icon';
import { Button } from '@/components/ui/button';
import { Kbd, KbdGroup } from '@/components/ui/kbd';
import { cn } from '@/lib/utils';


export function ResultCountBlock(props: {
  resultCount: number;
  totalCount: number;
  hasActiveTags: boolean;
  onClearTags: () => void;
  showInternships: boolean;
  onShowInternshipsChange: (v: boolean) => void;
}) {
  const [filterExpanded, setFilterExpanded] = useState(false);

  const isMac = detectPlatform() === 'mac';
  const metaKey = isMac
    ? MAC_MODIFIER_SYMBOLS['Meta']
    : 'Ctrl';

  return (
    <div className='flex flex-col gap-1 bg-secondary-foreground/1 -mb-px p-2 pb-3 border border-border-light'>
      <button
        className={cn(
          'flex items-center justify-between w-full text-[10px] font-mono text-muted-foreground px-1 py-0.5',
          !props.showInternships && 'hover:text-foreground transition-colors cursor-pointer',
        )}
        onClick={() => !props.showInternships && setFilterExpanded((prev) => !prev)}
        type='button'
      >
        <span>
          {props.resultCount === props.totalCount
            ? `${props.totalCount} entries`
            : `${props.resultCount} of ${props.totalCount} entries`
          }
        </span>
        {!props.showInternships && (
          <Icon
            className={cn(
              'text-[10px] transition-transform',
              filterExpanded && 'rotate-180',
            )}
            icon={faChevronUp}
          />
        )}
      </button>
      <AnimatePresence initial={false}>
        {(filterExpanded || props.showInternships) && (
          <motion.div
            className='overflow-hidden'
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15, ease: 'easeInOut' }}
          >
            <label className='flex items-center gap-2 px-1 py-1.5 text-[11px] text-muted-foreground cursor-pointer hover:text-foreground transition-colors select-none'>
              <input
                checked={props.showInternships}
                className='cursor-pointer'
                onChange={(e) => props.onShowInternshipsChange(e.target.checked)}
                type='checkbox'
              />
              {`Show internships`}
            </label>
          </motion.div>
        )}
      </AnimatePresence>
      <Button
        className='text-xs font-mono text-muted-foreground hover:bg-muted'
        disabled={!props.hasActiveTags}
        onClick={props.onClearTags}
        size='sm'
        type='button'
        variant='outline'
      >
        Clear filters
        <KbdGroup className='relative hidden sm:inline-flex -right-1'>
          <Kbd>
            {metaKey}
          </Kbd>
          <Kbd>
            {`X`}
          </Kbd>
        </KbdGroup>
      </Button>
    </div>
  );
}
