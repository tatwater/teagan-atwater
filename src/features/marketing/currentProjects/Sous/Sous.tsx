import SousSquircle from '@/components/logos/SousSquircle';
import sharedStyled from '../CurrentProjects.module.scss';
import styled from './Sous.module.scss';
import Image from 'next/image';


export default function SousSection() {
  return (
    <section className={ sharedStyled.container }>
      <div className={ styled.content }>
        <header className={ sharedStyled.header }>
          <div className={ sharedStyled.logoWrapper }>
            <SousSquircle />
          </div>
          <div className={ sharedStyled.heading }>
            <h2>Sous</h2>
          </div>
          <p className={ sharedStyled.subheading }>
            <strong>
              { `Food is social. But a focused social network, dedicated to our favorite recipes and the meals we make together, is missing.` }
            </strong>
            { ` Introducing Sous, the tool you'll reach for most in your whole kitchen. Based around a strongly type-safe recipe scraper and transformer, Sous is your own personally-curated cookbook first. But it doesn't stop there. Follow your friends, discover (and trust) the recipes they depend on, share the meals you make, and tag the recipes you use so others can quickly save them for later.` }
          </p>
          <div className={ styled.lineIn } />
          <div className={ styled.lineOut } />
        </header>
        {/* <div className={ sharedStyled.contentPlaceholder }>
          <Image
            alt='Demo recipe'
            height={ 1521 }
            src='/recipe.png'
            width={ 1424 }
          />
        </div> */}
      </div>
    </section>
  );
}
