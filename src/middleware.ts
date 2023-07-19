import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse, userAgent } from 'next/server';

import type { NextRequest } from 'next/server';
import type { Database } from '@/lib/database.types';


export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient<Database>({ req, res });
  const pathname = req.nextUrl.pathname;
  const redirectTo = req.nextUrl.searchParams.get('redirectTo');
  const { data: { user } } = await supabase.auth.getUser();
  const { device, os } = userAgent(req);

// console.log(os.name);
// console.log(device.type);  // console, mobile, tablet, smarttv, wearable, embedded, undefined

  if (!!user) {
    // Divert new users to make a profile
    if (!user.user_metadata.hasProfile && pathname !== '/welcome') {
      const oldUrl = new URL(req.url);

      if (oldUrl.pathname.startsWith('/_next') || oldUrl.pathname.endsWith('.ico')) {
        return res;
      }

      return NextResponse.redirect(new URL(`/welcome?redirectTo=${ redirectTo || oldUrl.pathname }`, req.url))
    }
    
    // Prevent signed in users from visiting signin page
    else if (['/signin'].includes(pathname)) {
    // if (pathname === '/resume') {
    //   console.log(req.referrer);
    // }
      return NextResponse.redirect(new URL('/', req.url))
    }
  } else {
    if (['/welcome'].includes(pathname)) {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  return res;
}
