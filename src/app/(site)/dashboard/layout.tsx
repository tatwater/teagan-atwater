import type { ReactNode } from 'react';
import type { Database } from '@/lib/database.types';

import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';

import Navigation from './Navigation';
import styled from './DashboardLayout.module.scss';
import Avatar from '@/features/auth/Avatar/Avatar';


type Props = {
  children:    ReactNode,
  currentPage: ReactNode,
}

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({ children, currentPage }: Props) {
  const supabase = createServerComponentClient<Database>({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id || '';

  const { data, error } = await supabase
    .from('profiles')
    .select(`
      avatar_url,
      email,
      full_name
    `)
    .eq('user_id', userId)
    .single();
  
  if (error) {
    console.log('DashboardLayout failed to load profile:', error);
  }


  return (
    <div className={ styled.dashboardContainer }>
      <header className={ styled.dashboardHeader }>
        <Avatar
          avatarUrl={ data?.avatar_url || '' } 
          fullName={ data?.full_name || '' }
          sizeREM='4'
        />
        <div className='text'>
          <span className='name'>{ data?.full_name } / { currentPage }</span>
          <span className='email'>{ data?.email }</span>
        </div>
      </header>
      <div className={ styled.dashboardLayout }>
        <Navigation currentPage={ currentPage } />
        <main className={ styled.dashboardContent }>
          { children }
        </main>
      </div>
    </div>
  );
}
