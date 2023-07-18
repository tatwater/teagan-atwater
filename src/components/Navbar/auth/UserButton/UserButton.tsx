'use client';

import type { User } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/lib/database.types';

import { useCallback, useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle } from '@fortawesome/sharp-regular-svg-icons';

import ProfileModal from '@/features/auth/ProfileModal';
import downloadAvatar from '@/utils/downloadAvatar';
import styled from '../AuthButtons.module.scss';


type Props = {
  user: User | null,
}


export default function UserButton({ user }: Props) {
  const supabase = createClientComponentClient<Database>();
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [avatarPath, setAvatarPath] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);


  const getProfile = useCallback(async () => {
    try {
      setLoading(true);

      let { data, error, status } = await supabase
        .from('profiles')
        .select(`
          avatar_url,
          email,
          full_name
        `)
        .eq('user_id', user?.id)
        .single();

      if (error && status !== 406) {
        throw error;
      }

      if (data) {
        setAvatarPath(data.avatar_url);
        setEmail(data.email || '');
        setFullName(data.full_name || '');
      }
    } catch (error) {
      alert('Error loading user data!');
    } finally {
      setLoading(false);
    }
  }, [user, supabase])


  useEffect(() => {
    getProfile()
  }, [user, getProfile]);

  useEffect(() => {
    async function download(path: string) {
      const url = await downloadAvatar(path, supabase);
      setAvatarUrl(url);
    }

    if (!!avatarPath) download(avatarPath);
  }, [avatarPath, supabase]);


  if (!!loading || !user?.user_metadata.hasProfile) {
    return (
      <div className={ styled.welcomePlaceholder }>
        <FontAwesomeIcon icon={ faUserCircle } />
      </div>
    );
  } else {
    return (
      <ProfileModal
        avatarUrl={ avatarUrl || '' }
        email={ email || '' }
        fullName={ fullName || user?.email || '' }
      />
    );
  }
}
