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
type Props = {
  data: {
    avatar_url:   string | null;
    created_at:   string;
    email:        string;
    full_name:    string;
    location:     string | null;
    nickname:     string;
    organization: string | null;
    role:         string | null;
  };
  userId: string;
}


export default function EditProfileForm({ data, userId }: Props) {
  const supabase = createClientComponentClient<Database>();
  const [avatarPath,   setAvatarPath]   = useState<string | null>(data.avatar_url || '');
  const [avatarUrl,    setAvatarUrl]    = useState<Profiles['avatar_url']>(data.avatar_url || '');
  const [fullName,     setFullName]     = useState<string | null>(data.full_name || '');
  const [loading,      setLoading]      = useState(false);
  const [location,     setLocation]     = useState<string | null>(data.location || '');
  const [nickname,     setNickname]     = useState<string | null>(data.nickname || '');
  const [organization, setOrganization] = useState<string | null>(data.organization || '');
  const [role,         setRole]         = useState<string | null>(data.role || '');


  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    switch (event.target.name) {
      case 'full-name':
        setFullName(event.target.value);
        break;
      case 'location':
        setLocation(event.target.value);
        break;
      case 'nickname':
        setNickname(event.target.value);
        break;
      case 'organization':
        setOrganization(event.target.value);
        break;
      case 'role':
        setRole(event.target.value);
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

        const { error } = await supabase.from('profiles').upsert({
          avatar_url: avatarUrl,
          created_at: data.created_at,
          email: data.email,
          full_name: fullName,
          location,
          nickname,
          organization,
          role,
          updated_at: now,
          user_id: userId,
        });

        if (error) {
          throw error;
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
        name='avatar'
      >
        <div className={ styled.uploadLayout }>
          <AvatarUpload
            onUpload={ handleUpload }
            image={ avatarPath }
            userId={ userId }
          />
          <div className={ styled.uploadText }>
            
          </div>
        </div>
      </Form.Field>
      <Form.Field
        className='input-wrapper'
        name='full-name'
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
        name='nickname'
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
            value={ location || '' }
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
            value={ organization || '' }
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
            value={ role || '' }
          />
        </Form.Control>
      </Form.Field>
      <Form.Submit asChild>
        <button disabled={ loading }>
          <FontAwesomeIcon icon={ faCheck } />
          { 'Save' }
        </button>
      </Form.Submit>
    </Form.Root>
  );
}
