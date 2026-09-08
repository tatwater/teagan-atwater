import { describe, it, expect } from 'vitest';
import { render } from 'react-email';
import ContactReceiptEmail from './ContactReceipt';
import ContactSubmissionEmail from './ContactSubmission';
import { SITE_URL, light } from './theme';

const props = {
  name: 'Jordan Reyes',
  email: 'jordan.reyes@example.com',
  subject: 'Design systems role',
  message: 'First paragraph.\n\nSecond paragraph.',
  submittedAt: 'September 7, 2026 at 2:14 PM',
};

const templates = [
  { name: 'receipt', renderEmail: () => render(ContactReceiptEmail(props)) },
  { name: 'submission', renderEmail: () => render(ContactSubmissionEmail(props)) },
];


describe.each(templates)('$name email', ({ renderEmail }) => {
  it('renders the submitted content', async () => {
    const html = await renderEmail();

    expect(html).toContain(props.subject);
    // The blank line, not just the two halves: `white-space: pre-wrap` is the
    // only reason a sender's paragraph breaks survive, and both halves still
    // show up in a render that has collapsed them into one run-on line.
    expect(html).toContain(props.message);
    expect(html).toContain(props.submittedAt);
  });

  it('carries the brand chrome', async () => {
    const html = await renderEmail();

    // Faces, palette and mark all have to survive the render, since a template
    // that silently loses them still sends and still looks wrong in the inbox.
    expect(html).toContain('Faculty Glyphic');
    expect(html).toContain('Geist Mono');
    expect(html).toContain(light.primary);
    expect(html).toContain(`${SITE_URL}/icons/ta-mark-light.png`);

    // react-email's own components ship default styles, and any of ours that
    // does not collide with the exact same key loses to them further down the
    // inline declaration. #eaeaea is Hr's built-in rule colour: seeing it means
    // a hairline is rendering at react-email's grey, not border-light.
    expect(html).not.toContain('#eaeaea');
    expect(html).not.toContain('#067df7'); // Link's built-in blue
  });

  it('references only absolute production URLs', async () => {
    const html = await renderEmail();

    // A relative or localhost asset URL is a broken image in a real inbox.
    const urls = html.match(/(?:src=|href=|url\()["'(]?([^"')\s]+)/g) ?? [];

    // Without this the loop below silently passes on zero matches, which is
    // exactly what happens if the markup or the regex ever drifts.
    expect(urls.length).toBeGreaterThan(0);
    for (const url of urls) {
      expect(url).toMatch(/(?:https:\/\/|mailto:)/);
    }
    expect(html).not.toMatch(/src="\/(?!\/)/);
  });

  it('pins a dark-mode palette that beats the inline styles', async () => {
    const html = await renderEmail();

    expect(html).toContain('prefers-color-scheme: dark');
    // Overrides compete with inline style attributes, so every one needs the bang.
    const darkBlock = html.slice(html.indexOf('prefers-color-scheme: dark'));
    const declarations = darkBlock.slice(0, darkBlock.indexOf('</style>')).match(/:\s*[^;{}]+;/g) ?? [];
    expect(declarations.length).toBeGreaterThan(0);
    for (const declaration of declarations) {
      expect(declaration).toContain('!important');
    }
  });

  it('darkens every surface the light background was painted on', async () => {
    const html = await renderEmail();

    // react-email's Body copies the background onto a full-width wrapper <td>
    // as well as <body>, but hands the className to <body> alone. Any painted
    // element the dark block cannot select stays white, and the message lands
    // as a dark column stranded on a white page — so check reach, by running
    // the block's own selectors against the rendered document.
    const darkCss = html.slice(html.indexOf('@media (prefers-color-scheme: dark)'));
    const darkened = [...darkCss.slice(0, darkCss.indexOf('</style>')).matchAll(/([^{}]+)\{([^{}]*)\}/g)]
      .filter(([, , declarations]) => declarations.includes('background-color'))
      .map(([, selector]) => selector.trim())
      .join(',');

    const document = new DOMParser().parseFromString(html, 'text/html');
    const painted = [...document.querySelectorAll(`[style*="background-color:${light.background}"]`)];

    expect(painted.length).toBeGreaterThan(0);
    for (const element of painted) {
      expect(element.matches(darkened)).toBe(true);
    }
  });
});


it('receipt confirms delivery without asking for anything', async () => {
  const html = await render(ContactReceiptEmail(props));

  expect(html).toContain('Received');
  expect(html).toContain('teaganatwater.com');
});


it('submission makes the sender address the actionable element', async () => {
  const html = await render(ContactSubmissionEmail(props));

  expect(html).toContain(`mailto:${props.email}`);
});
