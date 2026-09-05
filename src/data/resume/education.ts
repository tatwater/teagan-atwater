import type { ResumeItem } from '@/data/resume/types';


export const educationItems: ResumeItem[] = [
  {
    id: 'connecticut-college',
    title: 'Bachelor of Arts — Computer Science & Architecture',
    organizationName: 'Connecticut College',
    logoShape: 'circle',
    logoSrc: 'cc.png',
    location: 'New London, CT',
    dateStart: '2012-08',
    dateEnd: '2016-05',
    descriptionHeadline: 'Double major, CS thesis: Honors with Distinction, Selected Scholar @ Ammerman Center for Arts & Technology',
    descriptionSummary: 'Double major, and a dual focus on computational thinking and design. Graduated Honors with Distinction. Selected scholar for the interdisciplinary Ammerman Center for Arts and Technology. Founded an entrepreneurship club on campus, and active in the Cycling Club.',
    descriptionFull:
      'Connecticut College gave me an unusual and generative education: a dual-track BA combining Computer Science with Architecture. The pairing wasn\'t arbitrary — both disciplines are deeply concerned with structure, systems, and how humans inhabit and interact with designed environments. CS gave me rigorous computational thinking; Architecture gave me a designer\'s eye for space, composition, and the human experience. I founded the Launch CC entrepreneurship club on campus, bringing together students interested in startups and innovation, and was an active member of the Cycling Club. The liberal arts environment encouraged me to draw unexpected connections — a habit of mind I still rely on.',
    descriptionPrint:
      'Computer Science, Honors with Distinction, and Architecture. Selected Scholar at the Ammerman Center for Arts and Technology.',
    tags: [],
    type: 'education',
  },
  {
    id: 'northfield-mount-hermon',
    title: '',
    hideFromPrint: true,
    organizationName: 'Northfield Mount Hermon',
    logoShape: 'circle',
    logoSrc: 'nmh.png',
    location: 'Mount Hermon, MA',
    dateStart: '2008-08',
    dateEnd: '2012-05',
    descriptionHeadline: '',
    descriptionSummary: '',
    descriptionFull: '',
    tags: [],
    type: 'education',
  },
];
