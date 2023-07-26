import SousSquircle from '@/components/logos/SousSquircle';
import sharedStyled from '../CurrentProjects.module.scss';
import styled from './Sous.module.scss';


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
              { `Food is social, but a social network dedicated to passing recipes around, customizing them, and sharing the results is missing.` }
            </strong>
            { ` Or it was, before Sous. With the best recipe importer in the biz as its main dish, Sous is your own personally-curated cookbook first, topped with all the tasty social features you expect.` }
          </p>
          <div className={ styled.lineIn } />
          <div className={ styled.lineOut } />
        </header>
        <div className={ sharedStyled.contentPlaceholder }>&lt;Coming timing='soon' /&gt;</div>
      </div>
    </section>
  );
}
