import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowDown } from '@fortawesome/sharp-regular-svg-icons';
import { faGrid2 } from '@fortawesome/sharp-solid-svg-icons';

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
            <h6 className={ styled.subnavHeading }><FontAwesomeIcon icon={ faGrid2 } /> In Brief</h6>
            <Link href='#about-me'>I'm an Engineer</Link>
            <Link href='#software-engineering'>I'm a Founder</Link>
            <Link href='#architecture'>* I make physical spaces too</Link>
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
