/**
 * <mockup-player>, the custom element defined by embed.mckp.live.
 *
 * The element is registered at runtime by a script that TypeScript never sees,
 * so its attributes are declared here or every use of it is a type error. React
 * 19 reads intrinsic elements from the JSX namespace it exports itself, which
 * is why this augments 'react' rather than the global JSX namespace — the shape
 * that worked under React 18 silently stops being consulted.
 *
 * Attributes are hyphenated because React 19 passes unknown props through to a
 * custom element as attributes verbatim, and the player reads them by name.
 */
import type { DetailedHTMLProps, HTMLAttributes } from 'react';

interface MockupPlayerAttributes
  extends DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> {
  'aspect-ratio'?: string;
  'background-color'?: string;
  'camera-zoom'?: string;
  'click-range'?: string;
  'cursor-affect-page'?: string;
  'cursor-range'?: string;
  'mockup-id': string;
  'trigger'?: string;
  'trigger-loop'?: string;
  'trigger-threshold'?: string;
  'width'?: string;
}

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'mockup-player': MockupPlayerAttributes;
    }
  }
}
