import type { Database } from '@/lib/database.types';

import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';

import EditProfileForm from '@/features/auth/EditProfile/EditProfile';
import styled from '../DashboardPage.module.scss';


export const dynamic = 'force-dynamic';

export default async function DashboardEditProfilePage() {
  const supabase = createServerComponentClient<Database>({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id || '';

  const { data, error } = await supabase
    .from('profiles')
    .select(`
      avatar_url,
      created_at,
      email,
      full_name,
      location,
      nickname,
      organization,
      role
    `)
    .eq('user_id', userId)
    .single();

  if (error) {
    throw error;
  }


  return (
    <div className={ styled.card }>
      <EditProfileForm data={ data } userId={ userId } />
    </div>
  );
}
