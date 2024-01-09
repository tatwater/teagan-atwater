'use client';

import type { User } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/lib/database.types';

import { useCallback, useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

import styled from './Header.module.scss';


export default function HeaderGreeting() {
  const supabase = createClientComponentClient<Database>();
  const [loading, setLoading] = useState(false);
  const [name,    setName]    = useState('there');
  const [user,    setUser]    = useState<User | null>(null);


  const getUser = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  }, [supabase]);

  const getProfile = useCallback(async () => {
    try {
      setLoading(true);

      const { data, error, status } = await supabase
        .from('profiles')
        .select('nickname')
        .eq('user_id', user?.id)
        .single();

      if (error && status !== 406) {
        throw error;
      }

      if (data) {
        setName(data.nickname);
      }
    } catch (error) {
      console.log('ERROR FETCHING USER PROFILE');
    } finally {
      setLoading(false);
    }
  }, [user, supabase]);


  useEffect(() => {
    getUser();
  }, [getUser]);

  useEffect(() => {
    if (user) {
      getProfile();
    }
  }, [user, getProfile]);


  return (
    <h1 className={ styled.heading }>
      { `Hey ${ name },` }
      <br />
      { `I'm Teagan.` }
    </h1>
  );
}
