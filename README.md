# Personal Website v11

A performance-focused personal website built in TypeScript with Astro and React.

The site is deliberately small: a home page reel of selected work, an interactive
résumé with a printable one-page version, and a contact form. There are no
accounts and nothing to sign into — every page is public.

## Tech Stack

- **Framework**: Astro (server output) with React islands
- **Styling**: Tailwind CSS v4
- **UI**: Base UI primitives, shadcn-style components, Font Awesome Sharp icons
- **Database**: Convex (contact submissions)
- **Email**: Resend + React Email
- **Spam protection**: Cloudflare Turnstile
- **Search**: MiniSearch, powering the ⌘K command palette
- **Hosting**: Vercel

Résumé content lives in plain TypeScript modules under `src/data/resume/`, not a
content collection — the entries are structured and relational rather than prose,
and React islands import them synchronously.

## Project Structure

```
src/
├── assets/           # Logos and home page mockups (globbed for hashed URLs)
├── components/       # Shared components, incl. ui/ primitives
├── data/             # Résumé entries and home page highlights
├── emails/           # React Email templates
├── islands/          # React islands (navbar, résumé explorer, contact form)
├── layouts/          # Page layouts
├── lib/              # Utilities (convex, email, turnstile, logos, search)
├── pages/            # Routes + API routes
└── styles/           # Global CSS and theme tokens

convex/
├── schema.ts         # `contacts` table
└── contacts.ts       # submitContactMessage mutation
```

## Routes

| Route | What it is |
| --- | --- |
| `/` | Home page reel of selected work |
| `/resume` | Interactive résumé explorer |
| `/resume/print` | Printable one-page résumé |
| `/resume/[id]` | Detail page, generated only for entries with a `detailLabel` |
| `/resume/nmc` | Hand-built page collapsing both New Money Company roles |
| `/contact` | Contact form |
| `/contact/*` | 301 to `/contact` — the old per-subject URLs |
| `/api/contact/submit` | Form handler — Turnstile check, Convex write, Resend email |
| `/api/search-index.json` | Index the command palette fetches |

## Scripts

- `pnpm dev` — Start Astro dev server
- `pnpm build` — Build for production
- `pnpm preview` — Preview production build
- `pnpm convex:dev` — Start Convex dev server
- `pnpm convex:deploy` — Deploy Convex to production
- `pnpm test` — Run tests in watch mode
- `pnpm test:run` — Run tests once
- `pnpm test:ui` — Run tests with UI
- `pnpm test:coverage` — Run tests with coverage report

## Content Model

Résumé entries share one `ResumeItem` shape across experience, education, and
projects. A few flags control where an entry appears:

- `detailLabel` — opts an entry into a `/resume/{id}` detail page and the search
  index. Without it, the entry renders as plain text.
- `hidden` — keeps an entry off the top-level résumé list and the printed page.
  It does **not** hide an entry referenced as a pandemic-card sub-card; those are
  commented out of the `subCards` list separately.
- `hideFromPrint` — keeps an entry on the site but off the one-page résumé.

The home page reel is curated separately in `src/data/highlights.ts`, which
resolves résumé entries by id and gives each its own name and tagline. It reads
`hidden` entries on purpose, so work can be showcased before it is résumé-ready.

Skill tags are a closed union in `src/data/resume/types.ts`, and every tag must be
placed in exactly one category in `skills.ts` — the test suite enforces both.

## Testing

Vitest, with jsdom and Testing Library. Current coverage:

- **Skill taxonomy** — every tag categorized exactly once, no stray print tags,
  no empty categories
- **Résumé search** — tokenizing, AND semantics across terms, matching against
  tags, titles, organizations, and descriptions
- **Home page highlights** — every highlight resolves to a résumé entry, and
  every mockup has a `src` and non-empty alt text

## Environment

Copy `.env.example` to `.env.local` and fill in the values. `FONTAWESOME_NPM_TOKEN`
is required to install dependencies at all — the Sharp icon packages come from a
private registry.

`.env.local` alone is not enough for the install itself. pnpm refuses to expand
`${VAR}` in registry credentials coming from a project `.npmrc`, because that
file is committed and a hostile registry line could leak the secret. So the
committed `.npmrc` carries only the registry mapping, never the token. Put the
token in your user-level config once per machine:

```
pnpm config set "//npm.fontawesome.com/:_authToken" "$FONTAWESOME_NPM_TOKEN"
```

Deploys get the same credential from the `NPM_RC` environment variable set in
Vercel, which Vercel writes out as an `.npmrc` at build time so the token never
has to be committed. That is deliberately independent of the pnpm version:
Vercel picks pnpm 9 *or 10* from `lockfileVersion: '9.0'`, and pnpm 10 ignores
an expanded credential exactly the way the local pnpm does — so a setup relying
on that expansion would break whenever the deploy landed on 10.

Turnstile verification is skipped entirely when `TURNSTILE_SECRET_KEY` is unset,
so the contact form works locally without it.

## Deployment

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy Convex: `pnpm convex:deploy`
5. Update `CONVEX_DEPLOYMENT` and `PUBLIC_CONVEX_URL` in Vercel

## Troubleshooting

**TypeScript errors about `_generated`**: Expected until Convex generates types.
Run `pnpm convex:dev`.

**Email not sending**: Check Resend Dashboard → Logs. For dev, emails appear in
logs, not the inbox.

**`pnpm install` fails on `@fortawesome/sharp-*`**: `FONTAWESOME_NPM_TOKEN` is
missing or expired.

**`pnpm install` returns 401 with "No authorization header was set"**: the token
is missing from your user-level config — see Environment above. On Vercel, check
the `NPM_RC` environment variable instead. If the output also carries a `[WARN]
Ignored project-level auth setting` line, something has re-added an `_authToken`
to the committed `.npmrc`; that line belongs in user-level config, not here.

**`ERR_PNPM_IGNORED_BUILDS: Ignored build scripts: esbuild, msw, sharp`**: pnpm
blocks dependency install scripts until you answer for each one. On pnpm 10 this
is a warning; on pnpm 11 it fails the install, and because `pnpm run` verifies
dependencies first, it takes `pnpm dev` down with it. Answer with
`pnpm approve-builds`, or edit the gitignored `pnpm-workspace.yaml` directly:

```yaml
allowBuilds:
  esbuild: true
  sharp: true
  msw: false
```

pnpm 11 seeds that file with `set this to true or false` placeholders — those
count as unanswered, so the install keeps failing until they are real booleans.
Corepack resolves the newest pnpm when `package.json` has no `packageManager`
field, so a machine can land on pnpm 11 without anything in the repo changing.

## Specification

[SPEC.md](./SPEC.md) describes an earlier, broader plan for the site — including
Clerk authentication, user groups, and gated content — that v11 deliberately does
not implement. Treat it as historical context rather than a description of the
current build.

## License

Private project — all rights reserved.
