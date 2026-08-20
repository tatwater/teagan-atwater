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
`src/lib/mockups.ts`, keyed by the same id. Videos render above that highlight's
stills, so the first one takes the top slot.
