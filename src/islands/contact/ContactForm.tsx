import { useCallback, useEffect, useRef, useState } from 'react';
import { detectPlatform, MAC_MODIFIER_SYMBOLS, useHotkey } from '@tanstack/react-hotkeys';
import { faPaperPlane, faCircleCheck, faTriangleExclamation } from '@fortawesome/sharp-regular-svg-icons';
import { Icon } from '@/components/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Kbd, KbdGroup } from '@/components/ui/kbd';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { rateLimitMessage } from '@/lib/rate-limit-message';


type Status = 'idle' | 'submitting' | 'success' | 'error';
type ResolvedTheme = 'light' | 'dark';

const TURNSTILE_SCRIPT = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

/**
 * Ceiling on how long a submission waits for a captcha token. Generous, because
 * the wait covers a visitor solving an interactive challenge — it exists to
 * surface a wedged widget, not to rush anyone.
 */
const TOKEN_TIMEOUT_MS = 45_000;


/**
 * Turnstile follows the OS colour scheme when told `theme: 'auto'`, which is the
 * wrong signal here: the site has its own three-way toggle, so someone on a dark
 * machine who picks the light theme would get a dark widget in a light form.
 * Read the resolved theme off the `dark` class that `navbar/theme.ts` writes.
 */
function currentTheme(): ResolvedTheme {
  if (typeof document === 'undefined') return 'light';

  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}


function Field(props: {
  children: React.ReactNode;
  htmlFor: string;
  label: string;
}) {
  return (
    <div className='flex flex-col gap-1.5'>
      <label
        className='text-[10px] font-mono uppercase tracking-widest text-muted-foreground'
        htmlFor={props.htmlFor}
      >
        {props.label}
      </label>
      {props.children}
    </div>
  );
}


export default function ContactForm(props: {
  turnstileSiteKey?: string;
}) {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const [receiptSent, setReceiptSent] = useState(false);
  const [needsInteraction, setNeedsInteraction] = useState(false);
  const [theme, setTheme] = useState<ResolvedTheme>('light');

  // Null until mounted, which is what keeps the hint out of the server's
  // markup: the platform cannot be read there, and a ⌘ rendered for a visitor
  // on Windows is worse than no hint at all.
  const [metaKey, setMetaKey] = useState<string | null>(null);

  useEffect(() => {
    setMetaKey(detectPlatform() === 'mac' ? MAC_MODIFIER_SYMBOLS['Meta'] : 'Ctrl');
  }, []);

  const turnstileRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const tokenRef = useRef<string | null>(null);
  const waitersRef = useRef<Array<(token: string | null) => void>>([]);

  const formRef = useRef<HTMLFormElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);

  // The widget is hidden until Cloudflare wants an interaction, so the form is
  // unmounted on success and remounted for "Send another" — a Turnstile token is
  // single-use, and a stale one would be rejected as a duplicate.
  const formVisible = status !== 'success';


  /**
   * Start in the first field, so the page can be filled in without touching
   * anything first. Runs on arrival and again on "Send another", which is the
   * same moment wearing a different hat.
   *
   * Only where the pointer is fine. On a touch device the reward for this is
   * the on-screen keyboard thrown up over two thirds of the page before the
   * visitor has read what the form is for. `preventScroll` covers the rest: a
   * visitor who arrived deep-linked and part-way down should keep their place,
   * not be yanked to a field they have not looked at yet.
   */
  useEffect(() => {
    if (!formVisible) return;
    if (!window.matchMedia('(pointer: fine)').matches) return;

    nameRef.current?.focus({ preventScroll: true });
  }, [formVisible]);


  /**
   * The way out of a long textarea without reaching for the mouse or tabbing
   * past Turnstile's privacy links. Guarded against the command palette, which
   * opens over this page and would otherwise send a half-written message from
   * behind its own dialog.
   */
  useHotkey('Mod+Enter', (event) => {
    if ((event.target as Element | null)?.closest?.('[role="dialog"]')) return;

    formRef.current?.requestSubmit();
  }, { enabled: formVisible && status !== 'submitting' });


  // A failure that only paints red somewhere below the button is a failure a
  // keyboard reader has to go looking for. `role='alert'` reads it out; moving
  // focus puts the reader at the thing they now have to act on.
  useEffect(() => {
    if (status === 'error') errorRef.current?.focus();
  }, [status]);


  // The form the reader was standing in has just been replaced. Land them on
  // what replaced it rather than back at the top of the document.
  useEffect(() => {
    if (status === 'success') successRef.current?.focus();
  }, [status]);


  /** Hand a token (or a failure) to anything waiting on one. */
  const settleToken = useCallback((token: string | null) => {
    tokenRef.current = token;

    const waiters = waitersRef.current;
    waitersRef.current = [];
    waiters.forEach((resolve) => resolve(token));
  }, []);


  /**
   * Resolve with the current token, or wait for the widget to produce one.
   * `appearance: 'interaction-only'` still executes on render, but the token
   * arrives asynchronously — without this, a fast typist submits an empty token
   * and gets a captcha error with nothing on screen to explain it.
   */
  const awaitToken = useCallback((timeoutMs: number) => {
    return new Promise<string | null>((resolve) => {
      if (tokenRef.current) {
        resolve(tokenRef.current);
        return;
      }

      let timer = 0;

      const waiter = (token: string | null) => {
        window.clearTimeout(timer);
        resolve(token);
      };

      timer = window.setTimeout(() => {
        waitersRef.current = waitersRef.current.filter((entry) => entry !== waiter);
        resolve(null);
      }, timeoutMs);

      waitersRef.current.push(waiter);
    });
  }, []);


  // Track the site's resolved theme so the widget can be re-rendered to match.
  useEffect(() => {
    setTheme(currentTheme());

    const observer = new MutationObserver(() => setTheme(currentTheme()));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);


  // Load and render the Turnstile widget only when a site key is configured.
  // Re-runs on a theme change because Turnstile cannot be re-themed in place.
  useEffect(() => {
    if (!props.turnstileSiteKey || !formVisible) return;

    let cancelled = false;
    let pollId = 0;

    function renderWidget() {
      const turnstile = (window as any).turnstile;
      if (cancelled || !turnstile || !turnstileRef.current || widgetIdRef.current) return;

      widgetIdRef.current = turnstile.render(turnstileRef.current, {
        sitekey: props.turnstileSiteKey,
        theme,
        // Fills the form width on the rare occasion it is shown, rather than
        // sitting as an orphaned 300px box under full-width inputs.
        size: 'flexible',
        // Invisible unless Cloudflare decides a human check is warranted.
        appearance: 'interaction-only',
        callback: (token: string) => settleToken(token),
        'expired-callback': () => {
          tokenRef.current = null;
        },
        'error-callback': () => {
          // Settle rather than hang, so a submission in flight fails fast.
          settleToken(null);
        },
        'before-interactive-callback': () => setNeedsInteraction(true),
        'after-interactive-callback': () => setNeedsInteraction(false),
      });
    }

    if ((window as any).turnstile) {
      renderWidget();
    } else if (!document.querySelector(`script[src='${TURNSTILE_SCRIPT}']`)) {
      const script = document.createElement('script');
      script.src = TURNSTILE_SCRIPT;
      script.async = true;
      script.defer = true;
      script.onload = renderWidget;
      document.head.appendChild(script);
    } else {
      pollId = window.setInterval(() => {
        if ((window as any).turnstile) {
          window.clearInterval(pollId);
          renderWidget();
        }
      }, 100);
    }

    return () => {
      cancelled = true;
      window.clearInterval(pollId);

      if (widgetIdRef.current) {
        try {
          (window as any).turnstile?.remove(widgetIdRef.current);
        } catch {
          // The container may already be gone; nothing to clean up.
        }

        widgetIdRef.current = null;
      }

      tokenRef.current = null;
      setNeedsInteraction(false);
    };
  }, [props.turnstileSiteKey, formVisible, theme, settleToken]);


  function resetWidget() {
    tokenRef.current = null;

    if (widgetIdRef.current) {
      (window as any).turnstile?.reset(widgetIdRef.current);
    }
  }


  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('submitting');
    setError(null);

    const form = event.currentTarget;
    const data = new FormData(form);

    let turnstileToken: string | undefined;

    if (props.turnstileSiteKey) {
      const token = await awaitToken(TOKEN_TIMEOUT_MS);

      if (!token) {
        setError('We could not confirm you are human. Please try again.');
        setStatus('error');
        resetWidget();
        return;
      }

      turnstileToken = token;
    }

    try {
      const response = await fetch('/api/contact/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.get('name'),
          email: data.get('email'),
          subject: data.get('subject'),
          message: data.get('message'),
          turnstileToken,
        }),
      });

      // A WAF block never reaches the route, so this 429 carries no JSON body.
      // Read the wait off the header instead of showing "try again", which would
      // invite the one retry certain to fail.
      if (response.status === 429) {
        setError(rateLimitMessage(response.headers.get('Retry-After')));
        setStatus('error');
        resetWidget();
        return;
      }

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(result.error ?? 'Something went wrong. Please try again.');
        setStatus('error');
        resetWidget();
        return;
      }

      form.reset();
      setReceiptSent(Boolean(result.receiptSent));
      setStatus('success');
    } catch {
      setError('Could not reach the server. Please check your connection and try again.');
      setStatus('error');
      resetWidget();
    }
  }


  if (status === 'success') {
    return (
      <div
        className='flex flex-col items-start gap-3 border border-border p-6 focus:outline-none'
        ref={successRef}
        role='status'
        tabIndex={-1}
      >
        <Icon className='text-lg text-primary' icon={faCircleCheck} />
        <div className='flex flex-col gap-1'>
          <p className='text-sm font-medium'>
            {`Message sent.`}
          </p>
          <p className='text-xs text-muted-foreground'>
            {receiptSent
              ? `Thanks for reaching out — a confirmation is on its way to your inbox, and I'll get back to you at that address.`
              : `Thanks for reaching out — I'll get back to you at the address you provided.`}
          </p>
        </div>
        <Button
          className='mt-2 font-mono'
          onClick={() => setStatus('idle')}
          size='sm'
          type='button'
          variant='outline'
        >
          {`Send another`}
        </Button>
      </div>
    );
  }


  return (
    <form className='flex flex-col gap-5' noValidate onSubmit={handleSubmit} ref={formRef}>
      <div className='grid gap-5 sm:grid-cols-2'>
        <Field htmlFor='contact-name' label='Name'>
          <Input
            autoComplete='name'
            id='contact-name'
            maxLength={200}
            name='name'
            placeholder='Your name'
            ref={nameRef}
            required
          />
        </Field>

        <Field htmlFor='contact-email' label='Email'>
          <Input
            autoComplete='email'
            id='contact-email'
            maxLength={320}
            name='email'
            placeholder='you@example.com'
            required
            type='email'
          />
        </Field>
      </div>

      <Field htmlFor='contact-subject' label='Subject'>
        <Input
          id='contact-subject'
          maxLength={200}
          name='subject'
          placeholder='What is this about?'
        />
      </Field>

      <Field htmlFor='contact-message' label='Message'>
        <Textarea
          className='min-h-40'
          id='contact-message'
          maxLength={5000}
          name='message'
          placeholder='Tell me more…'
          required
        />
      </Field>

      {props.turnstileSiteKey && (
        <div className='flex flex-col gap-2'>
          {/*
            Turnstile reserves ~72px even when `interaction-only` keeps the
            challenge hidden, which leaves an empty gap in the form. Collapse the
            host until `before-interactive-callback` says a challenge is coming.
          */}
          <div
            className={cn(!needsInteraction && 'h-0 overflow-hidden')}
            ref={turnstileRef}
          />

          {needsInteraction && (
            <p className='text-xs text-muted-foreground'>
              {`Please complete the check above to send your message.`}
            </p>
          )}
        </div>
      )}

      {error && (
        <div
          className='flex items-start gap-2 border border-destructive/40 bg-destructive/10 px-3 py-2 focus:outline-none'
          ref={errorRef}
          role='alert'
          tabIndex={-1}
        >
          <Icon className='mt-0.5 text-xs text-destructive' icon={faTriangleExclamation} />
          <p className='text-xs text-destructive'>
            {error}
          </p>
        </div>
      )}

      <div className='flex flex-wrap items-center gap-x-3 gap-y-2'>
        <Button
          aria-keyshortcuts='Meta+Enter Control+Enter'
          className={cn('font-mono', status === 'submitting' && 'opacity-70')}
          disabled={status === 'submitting'}
          type='submit'
        >
          <Icon className='text-xs' icon={faPaperPlane} />
          {status === 'submitting' ? 'Sending…' : 'Send message'}
          {/* Same hint the print button and the palette use — announced once,
              by aria-keyshortcuts above, and hidden from the tree here. */}
          {metaKey && status !== 'submitting' && (
            <KbdGroup aria-hidden='true' className='relative hidden sm:inline-flex -right-1'>
              <Kbd>{metaKey}</Kbd>
              <Kbd>{`↵`}</Kbd>
            </KbdGroup>
          )}
        </Button>

        {/* Trails the button, flush with the right edge of the fields above. */}
        {props.turnstileSiteKey && (
          <p className='text-[11px] text-muted-foreground'>
            {`Protected by Turnstile · `}
            <a
              className='underline underline-offset-2 hover:text-foreground'
              href='https://www.cloudflare.com/privacypolicy/'
              rel='noopener noreferrer'
              target='_blank'
            >
              {`Privacy`}
            </a>
            {` · `}
            <a
              className='underline underline-offset-2 hover:text-foreground'
              href='https://www.cloudflare.com/website-terms/'
              rel='noopener noreferrer'
              target='_blank'
            >
              {`Terms`}
            </a>
          </p>
        )}
      </div>
    </form>
  );
}
