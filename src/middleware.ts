import { clerkMiddleware, createRouteMatcher } from '@clerk/astro/server';


const isProtectedRoute = createRouteMatcher([
  '/admin(.*)',
  '/profile(.*)',
]);

const isAdminRoute = createRouteMatcher([
  '/admin(.*)',
]);

function isAdmin(userId: string | null): boolean {
  if (!userId) return false;
  const adminIds = import.meta.env.ADMIN_USER_IDS?.split(',').map((id: string) => id.trim()) || [];
  return adminIds.includes(userId);
}


export const onRequest = clerkMiddleware(async (auth, context, next) => {
  const { userId, redirectToSignIn } = await auth();

  if (isProtectedRoute(context.request)) {
    if (!userId) {
      return redirectToSignIn();
    }

    if (isAdminRoute(context.request)) {
      if (!isAdmin(userId)) {
        return new Response('Forbidden: Admin access required', { status: 403 });
      }
    }
  }

  context.locals.auth = auth;
  context.locals.userId = userId;
  context.locals.isAdmin = isAdmin(userId);

  return next();
});
