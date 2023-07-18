'use client';

import type { ChangeEvent, FormEvent } from 'react';
import type { Database } from '@/lib/database.types';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import * as Form from '@radix-ui/react-form';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLongArrowRight } from '@fortawesome/sharp-regular-svg-icons';

import styled from './WelcomeForm.module.scss';
import AvatarUpload from '../AvatarUpload/AvatarUpload';


type Profiles = Database['public']['Tables']['profiles']['Row'];
type Props = {
  email:  string;
  userId: string;
}


export default function WelcomeForm({ email, userId }: Props) {
  const supabase = createClientComponentClient<Database>();
  const [avatarUrl, setAvatarUrl] = useState<Profiles['avatar_url']>(null);
  const [fullName,  setFullName]  = useState<string | null>(null);
  const [loading,   setLoading]   = useState(false);
  const [nickname,  setNickname]  = useState<string | null>(null);
  const router = useRouter();
  const params = useSearchParams();
  const redirectTo = params.get('redirectTo');

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    switch (event.target.name) {
      case 'welcome-full-name':
        setFullName(event.target.value);
        break;
      case 'welcome-nickname':
        setNickname(event.target.value);
        break;
    }
  }

  const handleUpload = (url: Profiles['avatar_url']) => {
    setAvatarUrl(url);
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!!fullName && !!avatarUrl && !!nickname) {
      try {
        const now = new Date().toISOString();

        setLoading(true);

        let { error } = await supabase.from('profiles').upsert({
          avatar_url: avatarUrl,
          created_at: now,
          email,
          full_name: fullName,
          nickname,
          updated_at: now,
          user_id: userId,
        });

        if (error) {
          throw error;
        } else {
          const { data, error: hasProfileError } = await supabase.auth.updateUser({
            data: {
              hasProfile: true,
            },
          });
      
          if (!!data && !hasProfileError) {
            if (!!redirectTo) {
              router.push(redirectTo);
            } else {
              router.push('/');
            }
          }
        }
      } catch (error) {
        console.log(error);
        alert('Error updating the data!');
      } finally {
        setLoading(false);
      }
    }
  }


  return (
    <Form.Root
      className={ styled.form }
      onSubmit={ handleSubmit }
    >
      <Form.Field
        className='input-wrapper'
        name='welcome-full-name'
      >
        <div className='instructions'>
          <Form.Label>Full name</Form.Label>
          <Form.Message
            className="message"
            match="valueMissing"
          >
            { 'Full name required' }
          </Form.Message>
        </div>
        <Form.Control asChild>
          <input
            autoFocus
            onChange={ handleChange }
            placeholder='John Smith'
            required
            type='text'
            value={ fullName || '' }
          />
        </Form.Control>
      </Form.Field>
      <Form.Field
        className='input-wrapper'
        name='welcome-nickname'
      >
        <div className='instructions'>
          <Form.Label>What should I call you?</Form.Label>
          <Form.Message
            className="message"
            match="valueMissing"
          >
            { 'Preferred name required' }
          </Form.Message>
        </div>
        <Form.Control asChild>
          <input
            onChange={ handleChange }
            placeholder='Johnny'
            required
            type='text'
            value={ nickname || '' }
          />
        </Form.Control>
      </Form.Field>
      <Form.Field
        className={`input-wrapper ${ styled.avatarLayout }`}
        name='welcome-avatar'
      >
        <div className={ styled.uploadLayout }>
          <AvatarUpload
            onUpload={ handleUpload }
            image={ null }
            userId={ userId }
          />
          <div className={ styled.uploadText }>
            {(!!avatarUrl)
              ? (
                <>
                  <strong>Looks great!</strong>
                  <p>You can also change this photo at any time from your profile.</p>
                </>
              )
              : (
                <>
                  <strong>Put a face to the name!</strong>
                  <p>This photo will accompany any correspondence or interactions between us on this site.</p>
                </>
              )
            }
          </div>
        </div>
      </Form.Field>
      <Form.Submit asChild>
        <button>
          { 'Save and continue' }
          <FontAwesomeIcon icon={ faLongArrowRight } />
        </button>
      </Form.Submit>
    </Form.Root>
  )
}
