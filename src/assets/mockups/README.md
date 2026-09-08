# Home page mockups

One directory per highlight, named for its résumé item id — the same id used in
`HIGHLIGHT_SOURCES` in `src/data/highlights.ts`:

    src/assets/mockups/project-sous/01-phone-on-counter.jpg
    src/assets/mockups/project-sous/02-tablet.jpg
    src/assets/mockups/nmc-swe/01-dashboard.png

Files are picked up automatically, sorted by filename, so prefix them to control
order. Any image type Vite handles works. A highlight with no directory yet falls
back to labelled placeholder frames, so the page is never broken by missing art.

Alt text is generated from the highlight name and position. If a shot needs real
alt text, add it to `MOCKUP_ALT` in `src/lib/mockups.ts`.

Videos are the exception: they are not kept here. A clip large enough to be worth
showing is large enough that committing it would weigh on the repository forever,
so they are hotlinked instead — add one to `MOCKUP_VIDEOS` in
`src/lib/mockups.ts`, keyed by the same id.

Mockuuups player embeds are the other exception, in `MOCKUP_EMBEDS` beside them:
paste the settings out of the snippet Mockuuups generates, and the reel renders
their `<mockup-player>` element. Nothing is downloaded, so the slot depends on
their service being up, and readers who prefer reduced motion are shown the
stills instead — an embed has no still frame to fall back to.

Anything that moves renders above that highlight's stills by default, so the
first one takes the top slot. To place it somewhere else, give it a `position`
that reads like one of the filenames here — `'02-app-on-phones'` files it
between the `01-` and `03-` stills — and it sorts in among them as if it were a
file in this directory.
