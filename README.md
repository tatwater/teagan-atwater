# Personal Website v11

A modern, performance-focused personal website built in TypeScript with Astro and React.

## Tech Stack

- **Framework**: Astro with React Islands
- **Styling**: Tailwind CSS v4
- **Authentication**: Clerk
- **Database**: Convex
- **Email**: Resend + React Email
- **Hosting**: Vercel
- **Content**: MDX Content Collections
- **Search**: MiniSearch (planned)

See [SPEC.md](./SPEC.md) for complete specification.

## Project Structure

```
src/
├── components/        # Static Astro components
├── content/          # MDX content collections
├── emails/           # React Email templates
├── islands/          # React islands (client-side)
├── layouts/          # Page layouts
├── lib/              # Utilities (auth, convex, email)
├── pages/            # Routes + API routes
└── middleware.ts     # Auth & access control

convex/
├── schema.ts         # Database schema
└── contacts.ts       # Contact CRUD functions
```

## Scripts

- `pnpm dev` - Start Astro dev server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build
- `pnpm convex:dev` - Start Convex dev server
- `pnpm convex:deploy` - Deploy Convex to production
- `pnpm test` - Run tests in watch mode
- `pnpm test:run` - Run tests once
- `pnpm test:ui` - Run tests with UI
- `pnpm test:coverage` - Run tests with coverage report

## Key Features Implemented

✅ Authentication with Clerk
✅ Protected routes (middleware)
✅ Admin role checking
✅ Contact form with history
✅ Email notifications
✅ Content collections with access control
✅ Sign-in / sign-up pages
✅ TypeScript strict mode
✅ Vitest testing

## Testing

Current test coverage:
- **Auth helpers** - User authentication, admin checks, content access control
- **Contact form** - Form submission, validation, error handling, accessibility
- **Content visibility** - Published/draft filtering, group-based access

## Next Steps

- [ ] Build admin dashboard UI
- [ ] Implement Command-K search
- [ ] Design homepage
- [ ] Create project pages
- [ ] Add navigation/footer
- [ ] Implement theme toggle

## Deployment

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy Convex: `pnpm convex:deploy`
5. Update `CONVEX_DEPLOYMENT` and `PUBLIC_CONVEX_URL` in Vercel

## Troubleshooting

**TypeScript errors about `_generated`**: Expected until Convex generates types. Run `pnpm convex:dev`.

**Admin routes forbidden**: Verify your Clerk user ID is in `ADMIN_USER_IDS` and restart dev server.

**Email not sending**: Check Resend Dashboard → Logs. For dev, emails appear in logs, not inbox.

## License

Private project - all rights reserved.
