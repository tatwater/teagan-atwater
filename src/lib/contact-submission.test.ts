import { describe, it, expect } from 'vitest';
import { parseContactSubmission } from '@/lib/contact-submission';


const valid = {
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  subject: 'Hello',
  message: 'Would you like to collaborate?',
};


function errorFor(body: unknown): string {
  const result = parseContactSubmission(body);
  if (result.ok) throw new Error('expected the submission to be rejected');

  return result.error;
}


describe('parseContactSubmission', () => {
  it('accepts a well-formed submission', () => {
    const result = parseContactSubmission(valid);

    expect(result).toEqual({ ok: true, data: { ...valid, turnstileToken: undefined } });
  });

  it('trims surrounding whitespace', () => {
    const result = parseContactSubmission({ ...valid, name: '  Ada  ', email: ' ada@example.com ' });

    expect(result.ok && result.data.name).toBe('Ada');
    expect(result.ok && result.data.email).toBe('ada@example.com');
  });

  it('falls back to a default subject when none is given', () => {
    const result = parseContactSubmission({ ...valid, subject: '   ' });

    expect(result.ok && result.data.subject).toBe('Website enquiry');
  });

  it('keeps a string captcha token and drops anything else', () => {
    expect(parseContactSubmission({ ...valid, turnstileToken: 'tok' })).toMatchObject({
      data: { turnstileToken: 'tok' },
    });
    expect(parseContactSubmission({ ...valid, turnstileToken: 42 })).toMatchObject({
      data: { turnstileToken: undefined },
    });
  });

  it('rejects a body that is not an object', () => {
    expect(errorFor(null)).toBe('Invalid request body.');
    expect(errorFor('a string')).toBe('Invalid request body.');
  });

  it('requires a name, an email, and a message', () => {
    expect(errorFor({ ...valid, name: '  ' })).toBe('Please enter your name.');
    expect(errorFor({ ...valid, email: '' })).toBe('Please enter your email address.');
    expect(errorFor({ ...valid, message: '' })).toBe('Please enter a message.');
  });

  it('rejects a malformed email address', () => {
    expect(errorFor({ ...valid, email: 'ada@' })).toBe('Please enter a valid email address.');
    expect(errorFor({ ...valid, email: 'ada example.com' })).toBe('Please enter a valid email address.');
  });

  it('rejects fields past their length limit', () => {
    const tooLong = 'One or more fields exceed the maximum length.';

    expect(errorFor({ ...valid, name: 'a'.repeat(201) })).toBe(tooLong);
    expect(errorFor({ ...valid, message: 'a'.repeat(5001) })).toBe(tooLong);
  });
});
