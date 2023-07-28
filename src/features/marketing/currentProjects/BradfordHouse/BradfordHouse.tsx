import BradfordHouseLogo from '@/components/logos/BradfordHouseLogo';
import sharedStyled from '../CurrentProjects.module.scss';
import styled from './BradfordHouse.module.scss';


export default function SousSection() {
  return (
    <section className={ sharedStyled.container }>
      <div className={ styled.content }>
        <header className={ sharedStyled.header }>
          <div className={ sharedStyled.logoWrapper }>
            <span className={ styled.borderRadius }>
              <BradfordHouseLogo />
            </span>
          </div>
          <div className={ sharedStyled.heading }>
            <h2>Bradford House</h2>
          </div>
          <p className={ sharedStyled.subheading }>
            <strong>
              { 'The onset of the COVID-19 pandemic opened the door to a complete gut renovation of a cute 1908 cape.' }
            </strong>
            { ` And the perfect opportunity to use my architecture degree. Slowly but surely it's taking shape! Standing inside a house built with my own hands, alongside my father, is a very cool experience.` }
          </p>
          <div className={ styled.lineIn } />
          <div className={ styled.lineOut } />
        </header>
        <div className={ sharedStyled.contentPlaceholder }>&lt;Coming timing='soon' /&gt;</div>
      </div>
    </section>
  );
}
