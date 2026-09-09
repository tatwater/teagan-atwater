/**
 * A global override of `matchMedia('(pointer: coarse)')`, installed for one
 * third-party script.
 *
 * ⚠️ THIS LIES TO EVERY SCRIPT ON THE PAGE, NOT JUST THE ONE IT IS FOR. ⚠️
 * If you are here because you are adding another third-party embed, widget or
 * analytics script that adapts itself to touch devices: it will be told this is
 * a mouse device. Read the rest of this comment before you go further — and
 * docs/THIRD-PARTY-SCRIPTS.md too, if you have the internal docs checked out,
 * though everything you need to decide is here.
 *
 *
 * Why it exists
 * -------------
 * The Mockuuups player (see MOCKUP_EMBEDS in src/lib/mockups.ts) draws its
 * mockups as a live WebGL scene. Its bundle decides how many pixels to render
 * from one media query, in two places:
 *
 *     const cap = () => matchMedia('(pointer: coarse)').matches ? 1 : 2
 *     gl.setPixelRatio(Math.min(devicePixelRatio, isEmbed ? cap() : maxDpr ?? 2))
 *
 *     const textureCap = () => matchMedia('(pointer: coarse)').matches ? 4096 : 8192
 *
 * So on any touch device the scene is rasterised at a pixel ratio of 1. On a
 * phone reporting devicePixelRatio 3 that means it renders at a third of the
 * screen's resolution and is stretched back up — the mockups arrive visibly
 * soft, while the same page on a laptop is sharp. Measured over the rendered
 * frame, detail energy went 4.83 (touch) against 13.61 (desktop).
 *
 * There is no attribute for this. The player's own `maxDpr` prop is only read
 * on the non-embed path, and nothing in its observed attributes touches render
 * resolution. Reporting a fine pointer is the only lever from outside, and it
 * lifts detail energy to 7.32.
 *
 * Two things worth knowing before removing or extending this:
 *
 * The performance guard it defeats does not really apply at our size. Capped
 * at 2, the player's canvas on a phone is about 688x516 — a third of a
 * megapixel. The same component already renders 1724x1294 on a desktop without
 * trouble, so the phone ends up doing roughly six times less work than the
 * machine that was always fine. The cap looks written for full-bleed hero
 * embeds rather than a card in a reel.
 *
 * It fails safe. If Mockuuups rewrites the query or the caps, the override
 * stops matching and the player simply goes back to rendering the way it does
 * today. Nothing breaks; the mockups just soften again.
 *
 * The narrower fix is for Mockuuups to expose `maxDpr` on embeds as an
 * attribute — the plumbing already exists on their side. If they ever ship it,
 * delete this file, drop the call in src/islands/home-reel.tsx, and set the
 * attribute in MOCKUP_EMBEDS instead.
 */

const COARSE_POINTER = '(pointer: coarse)';

/** Whitespace in a media query is not significant, so compare without it. */
const normalise = (query: string) => query.replace(/\s+/g, '').toLowerCase();

const TARGET = normalise(COARSE_POINTER);

/** The vendor whose script this override is for, as it appears in a stack trace. */
const OWNER = 'mckp.live';

let installed = false;

/**
 * Report a fine pointer to callers asking about `(pointer: coarse)`.
 *
 * Every other query is handed to the real `matchMedia` untouched, and even the
 * intercepted one is answered with the genuine MediaQueryList behind a proxy,
 * so listeners and `.media` keep working — only `.matches` is rewritten.
 *
 * Safe to call more than once; only the first call patches anything.
 */
export function overrideCoarsePointer() {
  if (installed || typeof window === 'undefined' || !window.matchMedia) return;
  installed = true;

  const real = window.matchMedia.bind(window);

  window.matchMedia = (query: string): MediaQueryList => {
    if (normalise(String(query)) !== TARGET) return real(query);

    // The tripwire. Anyone other than the vendor this was installed for is
    // getting an answer we invented, which is exactly the situation the file
    // comment warns about — say so rather than hoping someone reads the docs.
    if (import.meta.env.DEV && !new Error().stack?.includes(OWNER)) {
      console.warn(
        `[pointer-override] Something other than ${OWNER} just asked for "${COARSE_POINTER}" `
        + 'and was told this is a mouse device, which may be wrong for it. Why, and what '
        + 'to do about it: src/lib/mockuuups-pointer-override.ts (and, if you have the '
        + 'internal docs checked out, docs/THIRD-PARTY-SCRIPTS.md).',
      );
    }

    return new Proxy(real(query), {
      get(target, property) {
        if (property === 'matches') return false;
        // Read with the real MediaQueryList as the receiver, not the proxy:
        // native accessors like `.media` brand-check `this` and throw an
        // "Illegal invocation" if handed anything else. Same for the methods,
        // which is why they are bound before being passed back out.
        const value = Reflect.get(target, property, target);
        return typeof value === 'function' ? value.bind(target) : value;
      },
    });
  };
}
