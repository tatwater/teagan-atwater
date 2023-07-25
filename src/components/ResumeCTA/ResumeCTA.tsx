import Link from 'next/link';

import styled from './ResumeCTA.module.scss';


export default function ContactCTA() {
  return (
    <section className={ styled.container }>
      <div className={ styled.content }>
        <header className={ styled.header }>
          <h2 className={ styled.heading }>
            { 'Dig deeper.' }
          </h2>
          <p className={ styled.subheading }>Curious to learn more?</p>
        </header>
        <Link
          className='button gradient height-xlg'
          href='/'
        >
          { 'Explore my Resume' }
        </Link>
      </div>
    </section>
  );
}
