import { Body, Container, Head, Html, Img, Preview, Section } from 'react-email';
import type * as React from 'react';
import { SITE_URL, body, container, content, header, mark, stylesheet } from './theme';

interface FrameProps {
  /** Inbox preview line. Kept distinct from the subject so the two lines say
   *  different things instead of repeating. */
  preview: string;
  children: React.ReactNode;
}

/**
 * Shared chrome for every transactional email: the TA mark over a hairline, and
 * the railed content column the site frames all its pages with.
 *
 * The mark ships as PNG rather than the SVG in components/ta-brand — Gmail
 * strips inline <svg> entirely — in a light and a dark stroke, swapped by the
 * media query in `stylesheet`. Images are also blocked by default in plenty of
 * clients, so nothing here is load-bearing: the heading under it carries the
 * message on its own.
 */
export function Frame({ preview, children }: FrameProps) {
  return (
    <Html lang='en'>
      <Head>
        {/* react-email already sends x-apple-disable-message-reformatting, which
            turns off the shrink-to-fit iOS Mail would otherwise apply. Without a
            viewport of our own the column then lays out against a ~980px
            default and 14px copy arrives at about a third of that size. */}
        <meta content='width=device-width, initial-scale=1' name='viewport' />
        <meta content='light dark' name='color-scheme' />
        <meta content='light dark' name='supported-color-schemes' />
        <style dangerouslySetInnerHTML={{ __html: stylesheet }} />
      </Head>
      <Preview>{preview}</Preview>
      <Body className='e-body' style={body}>
        <Container className='e-rail' style={container}>
          <Section className='e-hairline' style={header}>
            <Img
              alt='Teagan Atwater'
              className='e-mark-light'
              height='38'
              src={`${SITE_URL}/icons/ta-mark-light.png`}
              style={mark}
              width='40'
            />
            <Img
              alt=''
              className='e-mark-dark'
              height='38'
              src={`${SITE_URL}/icons/ta-mark-dark.png`}
              style={{ ...mark, display: 'none' }}
              width='40'
            />
          </Section>

          <Section style={content}>{children}</Section>
        </Container>
      </Body>
    </Html>
  );
}
