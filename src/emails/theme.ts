/**
 * Design tokens for the transactional emails, mirrored from src/styles/global.css.
 *
 * The site authors its palette in oklch, which no mail client parses, so every
 * value below is the sRGB hex a browser resolves that token to. They are copied
 * rather than imported because these templates render on the server with no
 * Tailwind and no custom properties to bind against — if a token moves in
 * global.css, move it here too.
 */

/** Absolute origin for images and links.
 *
 * Deliberately a constant rather than PUBLIC_SITE_URL: mail is only ever sent
 * from production, and a dev-server origin baked into a real inbox is a broken
 * image, not a useful one. */
export const SITE_URL = 'https://teaganatwater.com';

export const light = {
  background: '#ffffff', // --background
  foreground: '#0a0a0a', // --foreground
  mutedForeground: '#737373', // --muted-foreground
  border: '#e5e5e5', // --border
  borderLight: '#f4f4f4', // --border-light
  primary: '#007a55', // --primary
};

const dark = {
  background: '#0a0a0a', // .dark --background
  foreground: '#fafafa', // .dark --foreground
  mutedForeground: '#a1a1a1', // .dark --muted-foreground
  border: '#232323', // .dark --border, flattened from oklch(1 0 0 / 10%)
  borderLight: '#1a1a1a', // .dark --border-light, flattened from oklch(1 0 0 / 6%)
  primary: '#00bc7d', // .dark --sidebar-primary; --primary is too dark to read as text
};

/**
 * The site's three faces, each with a fallback picked for tone rather than
 * metrics — only Apple Mail and iOS Mail load the web fonts, so the fallback is
 * what most recipients actually see. Georgia stands in for Faculty Glyphic
 * because a serif that reads wrong is still closer than a bold grotesque.
 */
const fonts = {
  glyph: "'Faculty Glyphic', Georgia, 'Times New Roman', serif",
  sans: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  mono: "'Geist Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
};

/**
 * Each face is listed twice: our own copy first, then the same cut on Google's
 * CDN.
 *
 * Fonts are subject to CORS, and a mail client renders the message from a null
 * origin, so the request needs `Access-Control-Allow-Origin`. Vercel does not
 * set one on static assets, and the Vercel adapter builds through the Build
 * Output API, which leaves no reliable place to add one. gstatic does send
 * `ACAO: *`, so it makes a working fallback — and per the CSS Fonts spec a
 * source that fails to load hands off to the next one.
 *
 * First-party is first so the Google request only fires when it has to; that
 * request is what tells Google the mail was opened.
 *
 * The files under public/fonts are byte-for-byte copies of the woff2s in
 * @fontsource/faculty-glyphic and @fontsource-variable/geist{,-mono}, which the
 * site itself imports through Vite into hashed, unguessable URLs. Bump either
 * package and re-copy the matching `files/*-latin-*.woff2`, or the inbox drifts
 * away from the site.
 */
const faces = [
  {
    family: 'Faculty Glyphic',
    msoAlt: 'Georgia',
    self: `${SITE_URL}/fonts/faculty-glyphic-latin-400-normal.woff2`,
    cdn: 'https://fonts.gstatic.com/s/facultyglyphic/v4/RrQIbot2-iBvI2mYSyKIrcgoBuQ4HO2EF1qELw.woff2',
  },
  {
    family: 'Geist',
    msoAlt: 'Helvetica',
    self: `${SITE_URL}/fonts/geist-latin-wght-normal.woff2`,
    cdn: 'https://fonts.gstatic.com/s/geist/v5/gyBhhwUxId8gMGYQMKR3pzfaWI_RnOMImpna6VEdtaiL.woff2',
  },
  {
    family: 'Geist Mono',
    msoAlt: 'Consolas',
    self: `${SITE_URL}/fonts/geist-mono-latin-wght-normal.woff2`,
    cdn: 'https://fonts.gstatic.com/s/geistmono/v6/or3yQ6H-1_WfwkMZI_qYPLs1a-t7PU0AbeE9KK5U5Cl4PuCTfNg.woff2',
  },
];

/* Every face is declared at 400 and nothing here asks for another weight. The
   self-hosted files are variable and the CDN cuts are static instances; pinning
   both to 400 is the one declaration that is honest about each. */
const fontFaces = faces
  .map(
    ({ family, msoAlt, self, cdn }) => `
  @font-face {
    font-family: '${family}';
    font-style: normal;
    font-weight: 400;
    mso-font-alt: '${msoAlt}';
    src: url(${self}) format('woff2'),
         url(${cdn}) format('woff2');
  }`
  )
  .join('\n');

/**
 * Stylesheet injected into <head>.
 *
 * Two jobs. The @font-face rules make the brand faces available to the inline
 * `fontFamily` on each element; there is no `* { font-family }` rule, so a
 * client that skips the download simply falls through the stack above.
 *
 * The dark block re-solves the palette on the dark ground, the way global.css
 * does for `.dark`. Every rule needs !important because it is competing with
 * inline styles, which is also why the two logo variants swap by display rather
 * than by src. Clients that ignore prefers-color-scheme — Gmail chief among
 * them — keep the light palette and the light mark, which is correct: they also
 * leave the explicitly white container alone.
 *
 * `.e-body` has to reach past <body>. react-email's Body copies the background
 * onto a full-width wrapper <td> as well, but puts className on <body> alone —
 * so darkening only `.e-body` leaves that <td> white and the message renders as
 * a dark column on a white page.
 */
export const stylesheet = `
${fontFaces}

  .e-mark-dark { display: none; }

  @media (prefers-color-scheme: dark) {
    .e-body,
    .e-body > table > tbody > tr > td { background-color: ${dark.background} !important; }
    .e-rail {
      background-color: ${dark.background} !important;
      border-color: ${dark.borderLight} !important;
    }
    .e-hairline { border-color: ${dark.borderLight} !important; }
    .e-title { color: ${dark.foreground} !important; }
    .e-text { color: ${dark.foreground} !important; }
    .e-muted { color: ${dark.mutedForeground} !important; }
    .e-accent { color: ${dark.primary} !important; }
    .e-box { border-color: ${dark.border} !important; }
    .e-mark-light { display: none !important; }
    .e-mark-dark { display: block !important; }
  }
`;

/* ---- shared element styles ------------------------------------------------
   Both templates are the same object: a hairline-railed column under the mark,
   Faculty Glyphic for the one heading, Geist for prose, and Geist Mono for the
   uppercase micro-labels the contact form already uses. Nothing is rounded —
   every control on the site is `rounded-none`, and a 6px radius reads as a
   different product. */

export const body = {
  backgroundColor: light.background,
  fontFamily: fonts.sans,
  margin: '0',
  padding: '0',
};

/** The site frames its content column with `border-x border-border-light`.
 *  That pair of hairlines is the most recognisable thing about the layout and
 *  survives Outlook, which renders Container as a table. */
export const container = {
  backgroundColor: light.background,
  borderLeft: `1px solid ${light.borderLight}`,
  borderRight: `1px solid ${light.borderLight}`,
  margin: '0 auto',
  maxWidth: '600px',
  width: '100%',
};

/** Echoes the navbar: the mark, then `border-b border-border-light`. */
export const header = {
  borderBottom: `1px solid ${light.borderLight}`,
  padding: '18px 40px',
};

export const mark = {
  display: 'block',
  height: '38px',
  width: '40px',
};

export const content = {
  padding: '40px 40px 32px',
};

/** Mono, uppercase, tracked — the contact form's field labels, and the send
 *  button's label, are both this treatment.
 *
 *  `lineHeight` is spelled out on every label below because react-email's Text
 *  defaults to a flat `24px`, which on a 10px label is a 2.4x line box that
 *  quietly doubles the gap the margins were tuned for. */
export const eyebrow = {
  color: light.primary,
  fontFamily: fonts.mono,
  fontSize: '10px',
  letterSpacing: '0.1em',
  lineHeight: '1.4',
  margin: '0 0 14px',
  textTransform: 'uppercase' as const,
};

/** Same treatment without the accent, for the owner-facing notification where
 *  the green belongs on the address you actually click. */
export const mutedEyebrow = {
  ...eyebrow,
  color: light.mutedForeground,
};

export const h1 = {
  color: light.foreground,
  fontFamily: fonts.glyph,
  fontSize: '30px',
  fontWeight: '400' as const,
  letterSpacing: '-0.01em',
  lineHeight: '1.2',
  margin: '0 0 14px',
  overflowWrap: 'break-word' as const,
};

export const lede = {
  color: light.mutedForeground,
  fontFamily: fonts.sans,
  fontSize: '14px',
  lineHeight: '1.65',
  margin: '0',
};

/** Stated as `borderTop`, not as borderColor/Style/Width longhands: react-email's
 *  Hr carries its own `borderTop: 1px solid #eaeaea`, and a longhand that does
 *  not collide with that key is simply overwritten by it further down the same
 *  inline declaration — the rule would render at react-email's grey while the
 *  header and rails next to it render at ours. */
export const hairline = {
  borderColor: light.borderLight,
  borderTop: `1px solid ${light.borderLight}`,
  margin: '32px 0',
};

export const fieldSection = {
  margin: '0 0 20px',
};

/** `text-[10px] font-mono uppercase tracking-widest text-muted-foreground`,
 *  copied off the live form so a returned copy looks like what was filled in. */
export const fieldLabel = {
  color: light.mutedForeground,
  fontFamily: fonts.mono,
  fontSize: '10px',
  letterSpacing: '0.1em',
  lineHeight: '1.4',
  margin: '0 0 6px',
  textTransform: 'uppercase' as const,
};

/** `overflowWrap` because the values here are whatever a stranger typed: one
 *  pasted URL with no spaces in it is wider than the 600px column, and a table
 *  cell grows to fit rather than clipping, so the whole layout goes with it. */
export const fieldValue = {
  color: light.foreground,
  fontFamily: fonts.sans,
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '0',
  overflowWrap: 'break-word' as const,
};

/** The quoted fields sit in bordered boxes because the inputs they came from
 *  do, so the receipt reads as the submitted form handed back. */
export const fieldBox = {
  border: `1px solid ${light.border}`,
  padding: '10px 12px',
};

export const quoted = {
  ...fieldValue,
  whiteSpace: 'pre-wrap' as const,
};

/** `textDecorationLine` rather than the `textDecoration` shorthand so it lands
 *  on react-email's own `textDecorationLine: none` instead of trailing after it
 *  and relying on declaration order to win. */
export const link = {
  color: light.primary,
  overflowWrap: 'break-word' as const,
  textDecorationLine: 'underline',
  textUnderlineOffset: '2px',
};

export const footer = {
  color: light.mutedForeground,
  fontFamily: fonts.sans,
  fontSize: '12px',
  lineHeight: '1.6',
  margin: '0',
};
