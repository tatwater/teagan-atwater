import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLongArrowLeft } from '@fortawesome/sharp-regular-svg-icons';

import SignInForm from '@/features/auth/SignInForm/SignInForm';
import styled from './SignInPage.module.scss';


export default async function SignInPage() {
  return (
    <>
      <main className={ styled.centerCenter }>
        <h1 className='h2'>Sign in</h1>
        <SignInForm />
      </main>
      <aside className={ styled.featured }>
        Hi there
      </aside>
    </>
  );
}
