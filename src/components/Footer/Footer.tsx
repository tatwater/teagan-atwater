import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDribbble, faGithub, faLinkedin } from '@fortawesome/free-brands-svg-icons';

import BuildingInPublic from './BuildingInPublic/BuildingInPublic';
import styled from './Footer.module.scss';


export default function Footer() {
  return (
    <footer className={ styled.footer }>
      <section className='main'>
        <Link
          className={ styled.wordmark }
          href='/'
        >
          <span className='line'>&gt; </span>
          { 'teagan atwater' }
          <span className='cursor'>_</span>
        </Link>
        <BuildingInPublic />
      </section>
      <section>
        <div className={ styled.footerFooter }>
          <div className={ styled.copyright }>
            <span>&copy; Teagan Atwater. All rights reserved.</span>
          </div>
          <div className={ styled.legal }>
            <Link href='/'>Terms</Link>
            <Link href='/'>Privacy</Link>
          </div>
          <div className={ styled.socials }>
            <Link
              className='linkedin'
              href='https://www.linkedin.com/in/teaganatwater/'
              target='_blank'
            >
              <FontAwesomeIcon icon={ faLinkedin } />
            </Link>
            <Link
              className='github'
              href='https://github.com/tatwater'
              target='_blank'
            >
              <FontAwesomeIcon icon={ faGithub } />
            </Link>
            <Link
              className='dribbble'
              href='https://dribbble.com/tatwater'
              target='_blank'
            >
              <FontAwesomeIcon icon={ faDribbble } />
            </Link>
          </div>
        </div>
      </section>
    </footer>
  );
}
