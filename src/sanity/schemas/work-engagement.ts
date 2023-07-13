import { PortableTextBlock } from 'sanity';


const workEngagement = {
  name:  'workEngagement',
  title: 'Work: Engagements',
  type:  'document',
  fields: [
    {
      title: 'Name',
      name:  'name',
      type:  'string',
    },
    {
      title: 'Location',
      name:  'location',
      type:  'string',
    },
    {
      title: 'Case Study Slug',
      name:  'caseStudySlug',
      type:  'slug',
      options: {
        source:   'name',
        maxLength: 96,
      },
    }
  ]
}


export default workEngagement;

export type WorkEngagement = {
  _id: string;
  _createdAt: Date;
  name: string;
  location: string;
}
