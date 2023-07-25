import Link from 'next/link';

import styled from './ContactCTA.module.scss';


export default function ContactCTA() {
  return (
    <section className={ styled.contactCTA }>
      <h2 className={ styled.heading }>
        { `Think I'm a good fit?` }
      </h2>
      <Link
        className='button gradient height-xlg'
        href='/'
      >
        { 'Get in Touch' }
      </Link>
    </section>
  );
}
