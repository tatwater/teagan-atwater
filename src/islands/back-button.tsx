import { faArrowLeft, faDeleteLeft } from '@fortawesome/sharp-regular-svg-icons';
import { useHotkey } from '@tanstack/react-hotkeys';
import { navigate } from 'astro:transitions/client';

import { Icon } from '@/components/icon';
import { Kbd, KbdGroup } from '@/components/ui/kbd';
import { cn } from '@/lib/utils';


const FALLBACK_HREF = '/';


/**
 * The escape hatch on the 404 page.
 *
 * A 404 is the one page with no structurally correct destination, so this walks
 * the visitor back rather than guessing at one. Browsers never expose the
 * history stack — `history.back()` needs no such access, and it beats any fixed
 * guess. Someone who arrived from off-site will leave the site, which is what
 * "back" means.
 *
 * `history.length` is 1 for a tab opened straight onto a dead link, which is the
 * case the fallback href covers. That href also keeps the control a real link:
 * it survives a JS failure and still opens in a new tab on middle click.
 */
export function BackButton() {
  function goBack(event?: React.MouseEvent<HTMLAnchorElement>) {
    if (typeof window === 'undefined' || window.history.length <= 1) return;

    event?.preventDefault();
    window.history.back();
  }

  useHotkey('Backspace', () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
      return;
    }

    navigate(FALLBACK_HREF);
  }, { ignoreInputs: true });

  return (
    <a
      autoFocus
      className={cn(
        'group/detail shrink-0 flex items-center justify-center gap-2 -my-px h-8 pr-2 text-xs font-mono font-medium whitespace-nowrap border border-transparent',
        'text-muted-foreground transition-colors',
        'border-emerald-700 text-emerald-700 hover:bg-primary/10 focus-within:bg-primary/10 focus-within:text-emerald-700',
        'pl-6 sm:pl-2',
      )}
      href={FALLBACK_HREF}
      onClick={goBack}
    >
      <Icon icon={faArrowLeft} />
      Go back
      <KbdGroup>
        <Kbd className='w-5'>
          <Icon icon={faDeleteLeft} />
        </Kbd>
      </KbdGroup>
    </a>
  );
}
