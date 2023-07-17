'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle as userReg } from '@fortawesome/sharp-regular-svg-icons';
import { faUserCircle as userSolid } from '@fortawesome/sharp-solid-svg-icons';

import styled from '../AuthButtons.module.scss';


export default function SignInButton() {
  const pathname = usePathname();
  const href     = `/signin?redirectTo=${ pathname }`;
  const signingIn   = pathname.startsWith('/signin');
  const activeClass = signingIn ? 'active' : '';
  const icon = signingIn ? userSolid : userReg;


  return (
    <Link
      className={ `${ styled.button } ${ activeClass }` }
      href={ href }
    >
      <FontAwesomeIcon icon={ icon } />
    </Link>
  );
}
