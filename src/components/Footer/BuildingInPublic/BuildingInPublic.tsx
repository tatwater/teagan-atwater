import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/sharp-solid-svg-icons';
import { faScrewdriverWrench } from '@fortawesome/sharp-regular-svg-icons';


import styled from './BuildingInPublic.module.scss';
import SignUpForm from './SignUpForm';


export default function BuildingInPublic() {
  return (
    <aside className={ styled.buildInPublic }>
      <header>
        <Link
          className='github'
          href='https://github.com/tatwater/teagan-atwater'
          target='_blank'
        >
          <FontAwesomeIcon icon={ faStar } />
          { 'Star this site on GitHub' }
        </Link>
        <div className='heading'>
          <span className='icon-wrapper'>
            <FontAwesomeIcon icon={ faScrewdriverWrench } />
          </span>
          <span className='text'>I'm building in the open</span>
        </div>
        <p>Sign up to be the first to know when I drop new features & content!</p>
      </header>
      <SignUpForm />
    </aside>
  );
}
