import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLongArrowRight, faMapMarkerAlt } from '@fortawesome/sharp-regular-svg-icons';

import SkillBadge from '@/features/resume/SkillBadge/SkillBadge';
import SousLogo from '@/components/logos/sous';

import styles from './Resume.module.scss';


export default async function ResumePage() {
  return (
    <main>
      <header className={ styles.header }>
        <h1 className='h1'>My Résumé</h1>
      </header>
      <div className={ styles.resume }>
        <aside className={ styles.sidebar }>
          <h2 className='h4'>Skills</h2>
          <div className=''>
            <h4>Programming Languages</h4>
            <div className='flex flex-wrap gap-2 mt-2 mb-4'>
              <SkillBadge>TypeScript</SkillBadge>
              <SkillBadge>TSX</SkillBadge>
              <SkillBadge>Sass</SkillBadge>
              <SkillBadge>GraphQL</SkillBadge>
              <SkillBadge>PostgREST</SkillBadge>
            </div>
          </div>
          <h4>Libraries & Frameworks</h4>
          <p>React, NextJS, Redux, Styled-Components, RadixUI, Formik & Yup, Tailwind, React-Spring, Framer Motion, Prisma, Stripe, Gatsby</p>
          <h4>Databases</h4>
          <p>Supabase (Postgres)<br />MongoDB, FaunaDB, Firebase (NoSQL)</p>
          <h4>Headless CMS</h4>
          <p>Sanity</p>
          <h4>Auth</h4>
          <p>Supabase Auth, Next-Auth, Auth0, Firebase Auth</p>
          <h4>Tools & Platforms</h4>
          <p>Git, Jest, Turborepo, GitHub, Vercel, Netlify, Docker, Lighthouse, ESLint, Rome, JIRA, Linear, Notion</p>
          <h4>Methodologies</h4>
          <p>PWAs, SSR/ISR, DRY/BEM/OOCSS, Mobile-first & Responsive design, JAMstack, Islands architecture, Agile/Scrum/Lean, Kanban, Gantt</p>
          <h4>Design Process</h4>
          <p>UX&gt;UI, Content strategy & modeling, Information Architecture, Accessibility, User testing, QA testing</p>
          <h4>Design Software</h4>
          <p>Figma, Adobe XD, Webflow, Sketch, InVision, Framer</p>
          <h4>Languages</h4>
          <p>English (native)<br />Spanish (intermediate, rusty)</p>
          <span className={ styles.divider } />
          <h4 className={ styles.light }>Previously</h4>
          <p className={ styles.light }>
            <SkillBadge>JavaScript</SkillBadge>
            <SkillBadge>HTML5+</SkillBadge>
            <SkillBadge>CSS3+</SkillBadge>
            Twig/Jade/Pug/Haml, Less/Stylus, Gulp/Grunt, Jekyll, Drupal/WordPress/SilverStripe, Angular, PHP, Ruby on Rails
          </p>
        </aside>
        <div className={ styles.content }>
          <section className={ styles.section }>
            <h2 className='h4'>Experience</h2>
            <div className={ styles.cta }>
              <h3>&lt;Something new /&gt;</h3>
              <p>I'm looking for a post-covid fresh start at a growing company on a mission. Sound like yours? Get in touch.</p>
            </div>
            <div className={ styles.covid }>
              <article className={ styles.entry }>
                <header>
                  <SousLogo />
                  <div className={ styles.organization }>
                    <span>
                      Sous
                      <span className={ styles.location }>
                        <FontAwesomeIcon icon={ faMapMarkerAlt } />
                        Plainfield, NH
                      </span>
                    </span>
                    <Link className={ styles.caseStudy } href='/resume'>View the case study <FontAwesomeIcon icon={ faLongArrowRight } /></Link>
                  </div>
                  <h3>
                    Creator
                    <span>April 2020 - Present</span>
                  </h3>
                </header>
                <div className={ styles.description }>View the case study</div>
              </article>
              <article className={ styles.entry }>
                <header>
                  <div className={ styles.organization }>
                    <span>
                      Bradford House
                      <span className={ styles.location }>
                        <FontAwesomeIcon icon={ faMapMarkerAlt } />
                        Plainfield, NH
                      </span>
                    </span>
                    <Link className={ styles.caseStudy } href='/resume'>View the case study <FontAwesomeIcon icon={ faLongArrowRight } /></Link>
                  </div>
                  <h3>
                    Design & Build
                    <span>April 2020 - Present</span>
                  </h3>
                </header>
                <div className={ styles.description }>View the case study</div>
              </article>
              <article className={ styles.entry }>
                <header>
                  <div className={ styles.organization }>
                    <span>
                      Shadow Art Studios
                      <span className={ styles.location }>
                        <FontAwesomeIcon icon={ faMapMarkerAlt } />
                        Plainfield, NH
                      </span>
                    </span>
                  </div>
                  <h3>
                    Freelance Web Developer
                    <span>August 2011 - Present</span>
                  </h3>
                </header>
              </article>
              <article className={ styles.entry }>
                <header>
                  <div className={ styles.organization }>
                    <span>
                      Worthy Kitchen
                      <span className={ styles.location }>
                        <FontAwesomeIcon icon={ faMapMarkerAlt } />
                        Woodstock, VT
                      </span>
                    </span>
                  </div>
                  <h3>
                    Front of House
                    <span>August 2022 - Present</span>
                  </h3>
                </header>
                <div className={ styles.description }>
                  <ul>
                    <li>Class 1 license to serve alcohol</li>
                    <li>Host: manage reservations, table turnover, and restaurant pacing; work the phone & greet guests</li>
                    <li>Bartender: set up / break down the bar, manage stock & menu boards, take all food orders, navigate dietary restrictions, and make & serve drinks</li>
                    <li>Floor: run food and reset tables, assist guests as needed</li>
                  </ul>
                </div>
              </article>
              <article className={ styles.entry }>
                <header>
                  <div className={ styles.organization }>
                    <span>
                      OHO Interactive
                      <span className={ styles.location }>
                        <FontAwesomeIcon icon={ faMapMarkerAlt } />
                        Somerville, MA
                      </span>
                    </span>
                  </div>
                  <h3>
                    Freelance React Engineer
                    <span>CHECK - January 2023</span>
                  </h3>
                </header>
                <div className={ styles.description }>
                  <h4>Previously</h4>
                  <h3>
                    Freelance Web Developer
                    <span>December 2014 - January 2015</span>
                  </h3>
                  <h3>
                    Web Development Intern
                    <span>June 2014 - August 2014</span>
                  </h3>
                </div>
              </article>
            </div>
            <article className={ styles.entry }>
              <header>
                  <div className={ styles.organization }>
                    <span>
                      Osler Health
                      <span className={ styles.location }>
                        <FontAwesomeIcon icon={ faMapMarkerAlt } />
                        Hanover, NH
                      </span>
                    </span>
                    <Link className={ styles.caseStudy } href='/resume'>View the case study <FontAwesomeIcon icon={ faLongArrowRight } /></Link>
                  </div>
                <h3>
                  CTO & Co-Founder
                  <span>Dec 2018 - April 2020</span>
                </h3>
              </header>
              <div className={ styles.description }>View the case study</div>
            </article>
            <article className={ styles.entry }>
              <header>
                  <div className={ styles.organization }>
                    <span>
                      Fiber
                      <span className={ styles.location }>
                        <FontAwesomeIcon icon={ faMapMarkerAlt } />
                        Somerville, MA
                      </span>
                    </span>
                    <Link className={ styles.caseStudy } href='/resume'>View the case study <FontAwesomeIcon icon={ faLongArrowRight } /></Link>
                  </div>
                <h3>
                  CTO & Co-Founder
                  <span>July 2017 - October 2018</span>
                </h3>
              </header>
              <div className={ styles.description }>View the case study</div>
            </article>
            <article className={ styles.entry }>
              <header>
                <span className={ styles.organization }>Moove-it (Montevideo, Uruguay)</span>
                <h3>
                  Web Development Intern
                  <span>June 2015 - July 2015</span>
                </h3>
              </header>
            </article>
            <article className={ styles.entry }>
              <header>
                <span className={ styles.organization }>Connecticut College (New London, CT)</span>
                <h3>
                  Web Development Intern
                  <span>August 2013 - May 2015</span>
                </h3>
              </header>
            </article>
            <article className={ styles.entry }>
              <header>
                <span className={ styles.organization }>Bluehouse Group (Burlington, VT)</span>
                <h3>
                  Web Development Intern
                  <span>June 2013 - July 2013</span>
                </h3>
              </header>
            </article>
          </section>
          <section className={ styles.section }>
            <h2>Academics</h2>
            <article className={ styles.entry }>
              <header>
                <span className={ styles.organization }>Connecticut College</span>
                <h3>
                  Bachelor of Arts
                  <span>August 2012 - May 2016</span>
                </h3>
              </header>
              <div className={ styles.description }>
                <div className={ styles.row }>
                  <div>
                    <h4>Majors</h4>
                    <ul>
                      <li>Computer Science (Honors Thesis &raquo; Honors with Distinction)</li>
                      <li>Architectural Studies (Senior Capstone)</li>
                    </ul>
                  </div>
                  <div>
                    <h4>Selected Scholar</h4>
                    <ul>
                      <li>Ammerman Center for Arts and Technology</li>
                    </ul>
                  </div>
                </div>
                <div>
                  <h4>Awarded</h4>
                  <ul>
                    <li>Bridget Baird Award for Excellence in Research in Arts and Technology</li>
                  </ul>
                </div>
                <div>
                  <h4>Leadership</h4>
                  <ul>
                    <li>Co-founded Launch, a student organization for entrepreneurship</li>
                    <li>One of two students in a faculty committee to bring entrepreneurship to campus academically</li>
                    <li>Helped guide the college's website redesign, sat on the committee interfacing with the agency</li>
                    <li>Founded a cycling club and led rides across SE Connecticut</li>
                    <li>Taught informal weekend yoga classes</li>
                    <li>Resident Assistant for 2(+) years</li>
                  </ul>
                </div>
              </div>
            </article>
            <article className={ styles.entry }>
              <header>
                <span className={ styles.organization }>Northfield Mount Hermon</span>
                <h3>
                  College Prep
                  <span>August 2008 - May 2012</span>
                </h3>
              </header>
              <div className={ styles.description }>
                <div>
                  <h4>Awarded</h4>
                  <ul>
                    <li>Look this up</li>
                  </ul>
                </div>
                <div>
                  <h4>Leadership</h4>
                  <ul>
                    <li>Resident Assistant for 2 years</li>
                  </ul>
                </div>
              </div>
            </article>
          </section>
        </div>
      </div>
    </main>
  );
}
