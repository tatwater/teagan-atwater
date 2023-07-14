'use client';

import type { ChangeEvent, FormEvent } from 'react';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Form from '@radix-ui/react-form';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLongArrowRight } from '@fortawesome/sharp-regular-svg-icons';
import { faCheckCircle } from '@fortawesome/sharp-light-svg-icons';

import styled from './SigninModal.module.scss';


export default function SignInModal() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const params = useSearchParams();
  const redirectTo = params.get('redirectTo');
  const [email, setEmail] = useState('');
  const [showEmailPrompt, setShowEmailPrompt] = useState(false);


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


  return (
    <Dialog.Root
      onOpenChange={(open: boolean) => !open && router.back() }
      open={ true }
    >
      <Dialog.Portal>
        <Dialog.Overlay className={ styled.overlay } />
        <Dialog.Content className={ styled.content }>
          { showEmailPrompt
            ? (
              <div className={ styled.emailPrompt }>
                <FontAwesomeIcon icon={ faCheckCircle } />
                <span className={ styled.emailPromptText }>
                  { 'Check your email for a sign in link' }
                </span>
              </div>
            )
            : (
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
            )
          }
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
