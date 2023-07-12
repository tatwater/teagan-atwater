'use client';

import Typewriter from 'typewriter-effect';


export default function TypewriterText() {
  return (
    <Typewriter
      onInit={(typewriter) => {
        typewriter
          .pauseFor(3000)
          .typeString('Hi there!')
          .pauseFor(1000)
          .typeString(`<br /><br />I've got a cool new site<br />under construction.`)
          .pauseFor(1000)
          .typeString('<br /><br />Check back soon :)')
          .pauseFor(1000)
          .typeString('<br /><br />-')
          .pauseFor(200)
          .typeString('T')
          .start();
      }}
    />
  )
}
