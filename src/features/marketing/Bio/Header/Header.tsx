import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowDown } from '@fortawesome/sharp-regular-svg-icons';

import Greeting from './Greeting';
import styled from './Header.module.scss';


export default function BioHeader() {
  return (
    <header className={ styled.container }>
      <div className={ styled.positioner }>
        <div className={ styled.content }>
          <div className={ styled.header }>
            <Greeting />
            <p className={ styled.subheading }>I make accessible digital<sup>*</sup> spaces to help people do their best work.</p>
          </div>
          <nav className={ styled.subnav }>
            <h6 className={ styled.subnavHeading }>In Brief</h6>
            <Link href='#about-me'>As an Engineer</Link>
            <Link href='#software-engineering'>As a Founder</Link>
            {/* <Link href='#architecture'>Physical Spaces</Link> */}
          </nav>
          <Link
            className={ styled.skipButton }
            href='#recent-work'
          >
            { 'Jump to recent work' }
            <span>
              <FontAwesomeIcon icon={ faArrowDown } />
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
