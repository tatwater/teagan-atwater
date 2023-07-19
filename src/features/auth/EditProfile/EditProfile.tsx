'use client';

import type { ChangeEvent, FormEvent } from 'react';
import type { Database } from '@/lib/database.types';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useState } from 'react';
import * as Form from '@radix-ui/react-form';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/sharp-regular-svg-icons';

import AvatarUpload from '@/features/auth/AvatarUpload/AvatarUpload';
import styled from './EditProfile.module.scss';


type Profiles = Database['public']['Tables']['profiles']['Row'];


export default function EditProfileForm() {
  const supabase = createClientComponentClient<Database>();
  // const { data: { user } } = await supabase.auth.getUser();
  const [avatarPath, setAvatarPath] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<Profiles['avatar_url']>(null);
  const [fullName,  setFullName]  = useState<string | null>(null);
  const [loading,   setLoading]   = useState(false);
  const [nickname,  setNickname]  = useState<string | null>(null);
  // const userId = user?.id || '';
  // const email = user?.email || "";
  const userId = '';
  const email = '';


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
            
          </div>
        </div>
      </Form.Field>
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
        className='input-wrapper'
        name='location'
      >
        <div className='instructions'>
          <Form.Label>Location</Form.Label>
        </div>
        <Form.Control asChild>
          <input
            onChange={ handleChange }
            placeholder='Boston, MA'
            type='text'
            value={ '' }
          />
        </Form.Control>
      </Form.Field>
      <Form.Field
        className='input-wrapper'
        name='organization'
      >
        <div className='instructions'>
          <Form.Label>Organization</Form.Label>
        </div>
        <Form.Control asChild>
          <input
            onChange={ handleChange }
            placeholder='Company Name'
            type='text'
            value={ '' }
          />
        </Form.Control>
      </Form.Field>
      <Form.Field
        className='input-wrapper'
        name='role'
      >
        <div className='instructions'>
          <Form.Label>Role</Form.Label>
        </div>
        <Form.Control asChild>
          <input
            onChange={ handleChange }
            placeholder='CEO'
            type='text'
            value={ '' }
          />
        </Form.Control>
      </Form.Field>
      <Form.Submit asChild>
        <button>
          <FontAwesomeIcon icon={ faCheck } />
          { 'Save' }
        </button>
      </Form.Submit>
    </Form.Root>
  );
}
