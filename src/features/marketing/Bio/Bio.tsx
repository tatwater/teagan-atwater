import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowDown, faBiohazard } from '@fortawesome/sharp-regular-svg-icons';

import FiberLogo from '@/components/logos/FiberLogo';
import OslerLogo from '@/components/logos/OslerLogo';
import SousWordmark from '@/components/logos/SousWordmark';

import Header from './Header';
import styled from './Bio.module.scss';


const daysSince = (date: Date) => {
  const today = new Date();
  const millisecondsToDays = 1000 * 60 * 60 * 24;
  const diffInMilliseconds = today.getTime() - date.getTime();

  return Math.trunc(diffInMilliseconds / millisecondsToDays);
}
const yearsSince = (date: Date) => {
  const today = new Date();
  const millisecondsToYears = 1000 * 60 * 60 * 24 * 365.25;
  const diffInMilliseconds = today.getTime() - date.getTime();

  return Math.trunc(diffInMilliseconds / millisecondsToYears);
}


export default function BioSection() {
  const myAge = yearsSince(new Date(1994, 2, 28));
  const webYears = yearsSince(new Date(2007, 2, 28));
  const reactYears = yearsSince(new Date(2016, 1, 1));
  const myAgeInDays = yearsSince(new Date(1994, 2, 28));
  const webDays = yearsSince(new Date(2007, 2, 28));

  return (
    <section className={ styled.container }>
      <Header />
      <article className={ styled.about } id='about-me'>
        <p><strong>I’m a { myAge } year-old software engineer, and I've been building for the web for *checks notes* ~{ Math.round(webDays / myAgeInDays * 100) }% of my life.</strong> I picked up PHP in 2007, and built too many sites in the bad old days before HTML5 and CSS3 had broad browser support. I've been on the responsive & mobile-first bandwagon since <a href='https://ethanmarcotte.com/' target='_new'>Ethan Marcotte</a> wrote about it in my favorite weblog, <a href='https://alistapart.com/article/responsive-web-design/' target='_new'>A List Apart</a>, in 2010. I rejoiced when my agency finally dropped support for IE 6 & 7. I spent a short time learning MVC with Ruby on Rails, before returning to a post-jQuery <del>Java</del><ins>Type</ins>Script landscape, and quickly found myself at home in a sea of React components.</p>
        <p>I have been building with React for the past { reactYears } years, on top of frameworks like Meteor, Vulcan, Gatsby, and Next.js. I've built static sites and full-stack progressive web apps, and experiences that blur the lines between the two (like this one!)</p>
        <p>After VS Code, my next go-to tool is Figma. A love of good design has always been a core motivation (I was going to be an architect, more on that in a bit) and I design accessible user interfaces as well as build them. I've also been known to do brand & print work for select clients.</p>
        <p>There's nothing quite as rewarding as building a better means for other people to accomplish their goals. Design and engineering are two inseparable sides of the same problem-solving coin, and I can't get enough of all of it.</p>
      </article>
      <article className={ styled.engineering } id='software-engineering'>
        <div className={ styled.appIcons }>
          <div className={ styled.appIcon }>
            <div className={ styled.logoWrapper }>
              <FiberLogo />
            </div>
          </div>
          <div className={ styled.appIcon }>
            <div className={ styled.logoWrapper }>
              <OslerLogo />
            </div>
          </div>
          <div className={ styled.appIcon }>
            <div className={ styled.logoWrapper }>
              <SousWordmark />
            </div>
          </div>
        </div>
        <p><strong>Since 2017 I've started three companies</strong>, building on passions for social equity, healthcare, and making food.</p>
        <p>...</p>
        {/* <p>More information about all three, focused on common themes and ties to personal interests.</p> */}
      </article>
      {/* <article className={ styled.architecture } id='architecture'> */}
        {/* <pre><FontAwesomeIcon icon={ faBiohazard } /> PANDEMIC</pre> */}
        {/* <p>I've had a lifelong passion for architecture. Before I got into software engineering, I was on track to become an architect. My Bachelor of Arts is even in both computer science and architectural studies. There is a ton of overlap; both are technical fields solving spacial and task-oriented challenges for humans.</p>
      </article> */}
    </section>
  );
}
