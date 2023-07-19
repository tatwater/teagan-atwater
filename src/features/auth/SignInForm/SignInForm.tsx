'use client';

import type { ChangeEvent, FormEvent } from 'react';
import type { Database } from '@/lib/database.types';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import * as Form from '@radix-ui/react-form';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/sharp-light-svg-icons';
import { faLongArrowRight } from '@fortawesome/sharp-solid-svg-icons';

import styled from './SignInForm.module.scss';


export default function SignInForm() {
  const supabase = createClientComponentClient<Database>();
  const [email,           setEmail]           = useState('');
  const [showEmailPrompt, setShowEmailPrompt] = useState(false);
  const router = useRouter();
  const params = useSearchParams();
  const redirectTo = params.get('redirectTo');


  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${ location.origin }/auth/callback?redirectTo=${ redirectTo }`,
      },
    });

    if (!!data && !error) {
      setShowEmailPrompt(true);
    }
  }


  if (showEmailPrompt) {
    return (
      <div className={ styled.emailPrompt }>
        <FontAwesomeIcon icon={ faCheckCircle } />
        <span className={ styled.emailPromptText }>
          { 'Check your email for a sign in link' }
        </span>
      </div>
    );
  } else {
    return (
      <Form.Root
        className={ styled.form }
        onSubmit={ handleSubmit }
      >
        <Form.Field
          className='input-wrapper'
          name='signin-email'
        >
          <div className='instructions'>
            <Form.Label>Email address</Form.Label>
            <Form.Message
              className="message"
              match="typeMismatch"
            >
              { 'Please provide a valid email' }
            </Form.Message>
          </div>
          <Form.Control asChild>
            <input
              autoComplete='none'
              autoFocus
              onChange={ handleChange }
              placeholder='email@example.com'
              required
              type='email'
              value={ email }
            />
          </Form.Control>
        </Form.Field>
        <Form.Submit asChild>
          <button>
            { 'Sign in' }
            <FontAwesomeIcon icon={ faLongArrowRight } />
          </button>
        </Form.Submit>
      </Form.Root>
    );
  }
}
