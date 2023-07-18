// import type { Database } from '@/lib/database.types'

// import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
// import { NextResponse } from 'next/server'
// import { cookies } from 'next/headers'


// export async function GET(request: Request) {
//   const supabase = createRouteHandlerClient<Database>({ cookies });
//   const { searchParams } = new URL(request.url);
//   const path = searchParams.get('path');

//   if (!path) {
//     return NextResponse.json({ error: 'Missing Required Path' }, { status: 400 });
//   }

//   try {
//     const { data, error } = await supabase.storage.from('avatars').download(path);

//     if (error) {
//       throw error;
//     }

//     console.log('data:', data)
//     const url = URL.createObjectURL(data);
//     console.log('url:', url);

//     // return NextResponse.
//     return NextResponse.json(data);
//   } catch (error) {
//     console.log(error);
//     return NextResponse.json({ error: 'Download Error' }, { status: 500 });
//   }
// }

// export async function PUT(request: Request) {
//   const supabase = createRouteHandlerClient<Database>({ cookies });
//   const { file, path } = await request.json();

//   if (!file || !path) {
//     return NextResponse.error();
//   }

//   try {
//     const { error } = await supabase.storage.from('avatars').upload(path, file);

//     if (error) {
//       throw error;
//     }
//   } catch (error) {
//     console.log(error);
//   }
// }
