import { useEffect, useRef, useState } from 'react';
import { faPaperPlane, faCircleCheck, faTriangleExclamation } from '@fortawesome/sharp-regular-svg-icons';
import { Icon } from '@/components/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';


type Status = 'idle' | 'submitting' | 'success' | 'error';

const TURNSTILE_SCRIPT = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';


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
  const turnstileRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  // Load and render the Turnstile widget only when a site key is configured.
  useEffect(() => {
    if (!props.turnstileSiteKey || !turnstileRef.current) return;

    let cancelled = false;

    function renderWidget() {
      const turnstile = (window as any).turnstile;
      if (cancelled || !turnstile || !turnstileRef.current || widgetIdRef.current) return;

      widgetIdRef.current = turnstile.render(turnstileRef.current, {
        sitekey: props.turnstileSiteKey,
        theme: 'auto',
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
      const id = window.setInterval(() => {
        if ((window as any).turnstile) {
          window.clearInterval(id);
          renderWidget();
        }
      }, 100);
      return () => window.clearInterval(id);
    }

    return () => {
      cancelled = true;
    };
  }, [props.turnstileSiteKey]);


  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('submitting');
    setError(null);

    const form = event.currentTarget;
    const data = new FormData(form);
    const turnstileToken = props.turnstileSiteKey
      ? String(data.get('cf-turnstile-response') ?? '')
      : undefined;

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

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(result.error ?? 'Something went wrong. Please try again.');
        setStatus('error');
        (window as any).turnstile?.reset(widgetIdRef.current ?? undefined);
        return;
      }

      form.reset();
      setStatus('success');
    } catch {
      setError('Could not reach the server. Please check your connection and try again.');
      setStatus('error');
      (window as any).turnstile?.reset(widgetIdRef.current ?? undefined);
    }
  }


  if (status === 'success') {
    return (
      <div className='flex flex-col items-start gap-3 border border-border p-6'>
        <Icon className='text-lg text-primary' icon={faCircleCheck} />
        <div className='flex flex-col gap-1'>
          <p className='text-sm font-medium'>
            {`Message sent.`}
          </p>
          <p className='text-xs text-muted-foreground'>
            {`Thanks for reaching out — I'll get back to you at the address you provided.`}
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
    <form className='flex flex-col gap-5' noValidate onSubmit={handleSubmit}>
      <div className='grid gap-5 sm:grid-cols-2'>
        <Field htmlFor='contact-name' label='Name'>
          <Input
            autoComplete='name'
            id='contact-name'
            maxLength={200}
            name='name'
            placeholder='Your name'
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
        <div ref={turnstileRef} />
      )}

      {error && (
        <div className='flex items-start gap-2 border border-destructive/40 bg-destructive/10 px-3 py-2'>
          <Icon className='mt-0.5 text-xs text-destructive' icon={faTriangleExclamation} />
          <p className='text-xs text-destructive'>
            {error}
          </p>
        </div>
      )}

      <div className='flex items-center gap-3'>
        <Button
          className={cn('font-mono', status === 'submitting' && 'opacity-70')}
          disabled={status === 'submitting'}
          type='submit'
        >
          <Icon className='text-xs' icon={faPaperPlane} />
          {status === 'submitting' ? 'Sending…' : 'Send message'}
        </Button>
      </div>
    </form>
  );
}
