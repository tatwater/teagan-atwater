// import Typewriter from '@/components/Typewriter';
import ContactCTA from '@/components/ContactCTA';
import ResumeCTA from '@/components/ResumeCTA';
import Bio from '@/features/marketing/Bio';
import Sous from '@/features/marketing/currentProjects/Sous';
import BradfordHouse from '@/features/marketing/currentProjects/BradfordHouse';
import Outside from '@/features/marketing/Outside';
import Previously from '@/features/marketing/Previously';
import styled from './HomePage.module.scss';


export default function HomePage() {
  return (
    <main>
      {/* <section className='hero hero--max'>
        <h1 className={ `text-center text-8xl font-extrabold tracking-tight ${ styled.h1 } `}>Design. Build.<br />(Repeat.)</h1>
      </section> */}
      <Bio />
      <div id='recent-work'>
        <Sous />
        {/* <BradfordHouse /> */}
      </div>
      <Previously />
      <ResumeCTA />
      <div style={{ overflow: 'hidden' }}>
        <Outside />
        <ContactCTA />
      </div>
    </main>
  );
}
