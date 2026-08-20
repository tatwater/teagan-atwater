import { useReducer, useEffect } from 'react';
import { NavbarActions } from '@/islands/navbar/navbar-actions';
import TA from '@/components/ta-brand/TA';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { href: '/resume', label: 'Résumé' },
  { href: '/contact', label: 'Contact' },
];

export function Navbar() {
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';

  useEffect(() => {
    document.addEventListener('astro:after-swap', forceUpdate);
    return () => document.removeEventListener('astro:after-swap', forceUpdate);
  }, []);

  return (
    <div className='w-full border-b border-border-light'>
      <div className='px-5 md:px-8 lg:px-10'>
        <nav className='relative flex items-center justify-between max-w-7xl mx-auto pl-6 pr-2 border-x border-border-light min-h-16'>
          <div className='flex items-center gap-8'>
            <a
              className='size-10 opacity-85'
              href='/'
            >
              <TA
                color='var(--secondary-foreground)'
                strokeWidth={2}
              />
            </a>
            <nav className='hidden sm:flex items-center gap-6 font-glyph text-sm'>
              {NAV_LINKS.map(({ href, label }) => {
                const isActive = pathname.startsWith(href);
                return (
                  <a
                    key={href}
                    href={href}
                    className={cn(
                      'relative isolate transition-colors px-2 py-0.5',
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
                    {isActive && (
                      <span className='absolute -bottom-1.5 left-1/2 -translate-x-1/2 size-1 rounded-full bg-primary' />
                    )}
                  </a>
                );
              })}
            </nav>
          </div>

          <NavbarActions />

          {/* Corner squares */}
          <div className='absolute bottom-0 left-0 size-2.5 bg-background border border-border-light rounded-px translate-x-[calc(-50%-0.5px)] translate-y-[calc(50%+0.5px)] z-30' />
          <div className='absolute bottom-0 right-0 size-2.5 bg-background border border-border-light rounded-px translate-x-[calc(50%+0.5px)] translate-y-[calc(50%+0.5px)] z-30' />
        </nav>
      </div>
    </div>
  );
}
