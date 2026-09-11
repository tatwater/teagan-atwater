import { useState, useEffect } from 'react';
import { NavbarActions } from '@/islands/navbar/navbar-actions';
import TA from '@/components/ta-brand/TA';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { href: '/resume', label: 'Résumé' },
  { href: '/contact', label: 'Contact' },
];

// `astro:transitions/client` re-exports the router functions and the plain
// types, but not the event classes, so the one field we read is declared here.
type NavigationEvent = Event & { to: URL };

const currentPath = () => (typeof window === 'undefined' ? '' : window.location.pathname);

export function Navbar() {
  const [pathname, setPathname] = useState(currentPath);

  useEffect(() => {
    // `astro:before-preparation` fires the moment a link is clicked, before the
    // new document has been requested. Moving the indicator here rather than on
    // `astro:after-swap` means the navbar answers the click immediately instead
    // of sitting on the old page for the length of the round trip.
    const onStart = (event: Event) => setPathname((event as NavigationEvent).to.pathname);

    // Re-sync from the real URL on arrival: a swap can happen without a
    // preparation phase, and a navigation that fails mid-flight would otherwise
    // strand the indicator on a page that was never reached.
    const onSettled = () => setPathname(currentPath());

    document.addEventListener('astro:before-preparation', onStart);
    document.addEventListener('astro:after-swap', onSettled);
    document.addEventListener('astro:page-load', onSettled);

    return () => {
      document.removeEventListener('astro:before-preparation', onStart);
      document.removeEventListener('astro:after-swap', onSettled);
      document.removeEventListener('astro:page-load', onSettled);
    };
  }, []);

  return (
    // Only the inner list of links is a navigation landmark. The bar itself is
    // the page's banner, and the element between them is pure layout — nesting a
    // second <nav> inside the first gave a screen reader two unlabelled
    // navigation landmarks to choose between where there is only one list.
    <header className='w-full border-b border-border-light'>
      <div className='px-5 md:px-8 lg:px-10'>
        <div className='relative flex items-center justify-between max-w-7xl mx-auto pl-6 pr-2 border-x border-border-light min-h-16'>
          <div className='flex items-center gap-5 sm:gap-8'>
            <a
              aria-label='Home'
              className={cn(
                'size-10 opacity-85 rounded-xs',
                'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
              )}
              data-astro-prefetch='load'
              href='/'
            >
              <TA
                color='var(--secondary-foreground)'
                strokeWidth={2}
              />
            </a>
            <nav aria-label='Primary' className='flex items-center gap-3 sm:gap-6 font-glyph text-sm'>
              {NAV_LINKS.map(({ href, label }) => {
                const isActive = pathname.startsWith(href);
                return (
                  <a
                    key={href}
                    aria-current={isActive ? 'page' : undefined}
                    href={href}
                    // Only three routes exist, so fetch both siblings once this
                    // page has settled rather than waiting for a hover. Astro
                    // drops back to `tap` on save-data and slow connections.
                    data-astro-prefetch='load'
                    className={cn(
                      'relative isolate transition-colors px-2 py-0.5 whitespace-nowrap rounded-xs',
                      'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
                      isActive
                        ? 'text-foreground'
                        : 'text-secondary-foreground/70 hover:text-secondary-foreground',
                    )}
                  >
                    {isActive && (
                      <>
                        <span
                          aria-hidden
                          className='absolute -inset-x-6 -inset-y-3 -z-10 pointer-events-none'
                          style={{
                            background: 'radial-gradient(ellipse 72% 58% at 44% 47%, color-mix(in oklch, var(--primary) 14%, transparent) 0%, transparent 68%)',
                            transform: 'rotate(-12deg)',
                          }}
                        />
                        <span
                          aria-hidden
                          className='absolute -inset-x-4 -inset-y-4 -z-10 pointer-events-none'
                          style={{
                            background: 'radial-gradient(ellipse 54% 76% at 56% 53%, color-mix(in oklch, var(--primary) 10%, transparent) 0%, transparent 72%)',
                            transform: 'rotate(16deg)',
                          }}
                        />
                      </>
                    )}
                    {label}
                  </a>
                );
              })}
            </nav>
          </div>

          <NavbarActions />

          {/* Corner squares */}
          <div className='absolute bottom-0 left-0 size-2.5 bg-background border border-border-light rounded-px translate-x-[calc(-50%-0.5px)] translate-y-[calc(50%+0.5px)] z-30' />
          <div className='absolute bottom-0 right-0 size-2.5 bg-background border border-border-light rounded-px translate-x-[calc(50%+0.5px)] translate-y-[calc(50%+0.5px)] z-30' />
        </div>
      </div>
    </header>
  );
}
