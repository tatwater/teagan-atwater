import Typewriter from '@/components/Typewriter';
import styled from './HomePage.module.scss';


export default function HomePage() {
  return (
    <main>
      <section className='hero hero--max'>
        <h1 className={ `text-center text-8xl font-extrabold tracking-tight ${ styled.h1 } `}>Design. Build.<br />(Repeat.)</h1>
      </section>
    </main>
  );
}
