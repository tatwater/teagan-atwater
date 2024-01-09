
# v1.0.0

## Features

- [ ] PWA
- [x] ES6+ and TypeScript
- [x] React 18, server components
- [x] Next 13 with app/
- [x] Custom fonts with next/font
- [x] Route prefetching with next/link
- [x] FontAwesome icons -- AS LIBRARY
- [ ] Styled Components / Tailwind
- [ ] Container queries
- [x] Light and dark themes with toggle and localStorage
- [x] CMD-K search, navigation, and theme toggle
- [x] Sanity studio route
- [x] Custom accessible Radix components

- [ ] Content from Sanity
- [ ] State managed by Redux
- [ ] Toast notifications
- [ ] Resume print CTA, printer styles
- [ ] Entrance, scroll, & interaction animations (react-spring/Framer)
- [ ] Page transition animations (react-spring/Framer)

- [x] Authentication & authorization with Supabase Auth
- [x] Modal route for signin
- [ ] Prisma? Or just Supabase?
- [ ] Supabase realtime?

- [ ] Image lazy-loading with next/image
- [ ] Loading states
- [ ] 404 page
- [ ] 100% lighthouse score
- [ ] No terminal errors
- [ ] Accessibility tested for keyboard, screen reader, legibility
- [x] Responsive

## Content

- Skip to Content links
- Brief about / positioning statement
- Design. Build. (Repeat.)
- Resume

-----

## Update Supabase type defs with linked (hosted) db

`supabase gen types typescript --linked > src/lib/database.types.ts`

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

## Notes

- `encoding` package is temp fix for module not found error in node-fetch with Supabase [Issue](https://github.com/supabase/supabase-js/issues/612)

- When profile is deleted, be sure to remove user_metadata.hasProfile from corresponding `user`
