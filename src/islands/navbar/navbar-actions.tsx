import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import type { ThemePreference } from '@/islands/navbar/types';

import { useState, useEffect, useRef } from 'react';
import { faCircleUser, faLoader } from '@fortawesome/sharp-regular-svg-icons';
import { faCircleUser as faCircleUserSolid } from '@fortawesome/sharp-solid-svg-icons';
import { useAuth } from '@clerk/astro/react';
import { Menu } from '@base-ui/react/menu';
import { CommandPalette } from '@/islands/navbar/command-palette';
import { Icon } from '@/components/icon';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { THEMES } from '@/islands/navbar/constants';


function getStoredTheme(): ThemePreference {
  if (typeof localStorage === 'undefined') return 'system';
  const v = localStorage.getItem('theme');
  if (v === 'light' || v === 'dark' || v === 'system') return v;
  return 'system';
}

function applyTheme(pref: ThemePreference) {
  const root = document.documentElement;
  root.classList.add('theme-switching');
  const isDark =
    pref === 'dark' ||
    (pref !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  root.classList.toggle('dark', isDark);
  localStorage.setItem('theme', pref);
  requestAnimationFrame(() => requestAnimationFrame(() => {
    root.classList.remove('theme-switching');
  }));
}


function ThemeItem({ value, icon, label }: { value: string; icon: IconDefinition; label: string }) {
  return (
    <Menu.RadioItem
      value={value}
      aria-label={label}
      className={cn(
        'size-7 text-sm rounded-full',
        'flex items-center justify-center cursor-pointer outline-none transition-all',
        'text-muted-foreground hover:bg-primary/10 hover:text-foreground',
        'data-highlighted:bg-primary/10 data-highlighted:text-foreground',
        'data-checked:text-foreground data-checked:ring-1 data-checked:ring-primary',
        'data-checked:ring-offset-1 data-checked:ring-offset-popover',
      )}
    >
      <Icon icon={icon} />
    </Menu.RadioItem>
  );
}


export function NavbarActions() {
  const [mounted, setMounted] = useState(false);
  const [isAuthPage, setIsAuthPage] = useState(false);
  const [theme, setTheme] = useState<ThemePreference>('system');
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const menuPopupRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);

  const { isLoaded, isSignedIn } = useAuth();
  const [clerkUser, setClerkUser] = useState<{ imageUrl?: string; fullName?: string | null } | null>(null);

  useEffect(() => {
    setMounted(true);
    setTheme(getStoredTheme());
    const p = window.location.pathname;
    setIsAuthPage(p.startsWith('/sign-in') || p.startsWith('/sign-up'));
  }, []);

  useEffect(() => {
    if (!themeMenuOpen) return;
    // Run after base-ui's own focus-first-item logic so we can override it
    const id = requestAnimationFrame(() => {
      menuPopupRef.current?.querySelector<HTMLElement>('[data-checked]')?.focus();
    });
    return () => cancelAnimationFrame(id);
  }, [themeMenuOpen]);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      const clerk = (window as any).Clerk;
      if (clerk?.user) setClerkUser({ imageUrl: clerk.user.imageUrl, fullName: clerk.user.fullName });
    } else {
      setClerkUser(null);
    }
  }, [isLoaded, isSignedIn]);

  useEffect(() => {
    if (!avatarOpen) return;
    function onClickOutside(e: MouseEvent) {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) {
        setAvatarOpen(false);
      }
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') setAvatarOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      document.removeEventListener('keydown', onEsc);
    };
  }, [avatarOpen]);

  function handleThemeChange(value: string) {
    const pref = value as ThemePreference;
    setTheme(pref);
    applyTheme(pref);
    setThemeMenuOpen(false);
  }

  return (
    <div className='flex items-center gap-2'>
      <CommandPalette />

      {/* Theme toggle */}
      <Menu.Root open={themeMenuOpen} onOpenChange={setThemeMenuOpen}>
        <Menu.Trigger
          render={
            <button
              className={cn(
                'size-8 text-sm rounded-full',
                'flex items-center justify-center cursor-pointer outline-none',
                'text-muted-foreground hover:text-foreground hover:bg-muted transition-colors',
                'focus-visible:ring-1 focus-visible:ring-ring',
                'aria-expanded:bg-muted aria-expanded:text-foreground',
              )}
              aria-label={mounted ? `Theme: ${THEMES[theme].label}` : 'Loading theme'}
            />
          }
        >
          {mounted ? (
            <Icon icon={THEMES[theme].icon} />
          ) : (
            <Icon icon={faLoader} className='animate-spin' />
          )}
        </Menu.Trigger>
        <Menu.Portal>
          <Menu.Positioner side='bottom' align='center' sideOffset={-35} className='z-50'>
            <Menu.Popup
              ref={menuPopupRef}
              className={cn(
                'flex flex-col gap-1 outline-none',
                'origin-(--transform-origin)',
                'data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95',
                'data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95',
              )}
            >
              <Menu.RadioGroup
                value={theme}
                onValueChange={handleThemeChange}
                className='contents'
              >
                <div className='bg-popover border border-border rounded-full shadow-sm p-1 flex flex-col gap-1'>
                  <ThemeItem value='light' icon={THEMES['light'].icon} label={THEMES['light'].label} />
                  <ThemeItem value='dark' icon={THEMES['dark'].icon} label={THEMES['dark'].label} />
                </div>
                <div className='bg-popover border border-border rounded-full shadow-sm p-1'>
                  <ThemeItem value='system' icon={THEMES['system'].icon} label={THEMES['system'].label} />
                </div>
              </Menu.RadioGroup>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>

      {/* Avatar / sign-in — wrapper always rendered so -mr-2 is stable before Clerk loads */}
      {isLoaded && (
        isSignedIn ? (
          <div ref={avatarRef} className='relative'>
            <button
              type='button'
              className={cn(
                'size-8 rounded-full overflow-hidden ml-1 mr-2 flex items-center justify-center cursor-pointer',
                'text-muted-foreground hover:text-foreground transition-colors',
                'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
              )}
              onClick={() => setAvatarOpen(v => !v)}
              aria-label='User menu'
              aria-expanded={avatarOpen}
            >
              {clerkUser?.imageUrl ? (
                <img src={clerkUser.imageUrl} alt={clerkUser.fullName ?? 'User'} className='size-7 object-cover' />
              ) : (
                <Icon icon={faCircleUser} className='size-5' />
              )}
            </button>
            {avatarOpen && (
              <div className='absolute right-0 top-full mt-1 w-44 bg-popover border border-border shadow-md z-50'>
                <a
                  href='/profile'
                  className='block w-full text-left px-3 py-2 text-xs text-foreground hover:bg-muted transition-colors'
                  onClick={() => setAvatarOpen(false)}
                >
                  Profile settings
                </a>
                <div className='h-px bg-border' />
                <button
                  type='button'
                  className='w-full text-left px-3 py-2 text-xs text-foreground hover:bg-muted transition-colors cursor-pointer'
                  onClick={() => (window as any).Clerk?.signOut({ redirectUrl: window.location.href })}
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        ) : (
          <Button
            className={cn(
              'rounded-full hover:text-foreground',
              isAuthPage ? 'text-emerald-800' : 'text-muted-foreground',
            )}
            size='icon-lg'
            variant='ghost'
            aria-label='Sign in'
            aria-current={isAuthPage ? 'page' : undefined}
            render={
              <a href={isAuthPage
                ? '/sign-in'
                : `/sign-in?redirect_url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.pathname + window.location.search : '')}`
              } />
            }
          >
            <Icon
              icon={isAuthPage ? faCircleUserSolid : faCircleUser}
              size='lg'
            />
          </Button>
        )
      )}
    </div>
  );
}
