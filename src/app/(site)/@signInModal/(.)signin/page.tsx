'use client';

import { useRouter } from 'next/navigation';

import styled from './SigninModal.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLongArrowRight } from '@fortawesome/sharp-regular-svg-icons';


export default function SignInModal() {
  const router = useRouter();

  return (
    <>
      <button
        className={ styled.overlay }
        onClick={() => router.back() }
      />
      <div className={ styled.positioner }>
        <form className={ styled.form }>
          <div className='input-wrapper'>
            <label htmlFor='signin-email'>Email address</label>
            <input
              autoFocus
              id='signin-email'
              placeholder='email@example.com'
              type='email'
            />
          </div>
          <button>
            { 'Sign in' }
            <FontAwesomeIcon icon={ faLongArrowRight } />
          </button>
        </form>
      </div>
    </>
  );
}
