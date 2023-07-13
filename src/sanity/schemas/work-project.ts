import { PortableTextBlock } from 'sanity';


const workProject = {
  name:  'workProject',
  title: 'Work: Projects',
  type:  'document',
  fields: [
    {
      name:  'title',
      title: 'Title',
      type:  'string',
    },
    {
      name: 'engagement',
      title: 'Engagement',
      type: 'reference',
      to: [{type: 'workEngagement'}]
    },
    {
      title: 'Starting Month',
      name: 'monthStart',
      type: 'date',
      options: {
        dateFormat: 'MM-YYYY',
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      title: 'Ending Month',
      name: 'monthEnd',
      type: 'date',
      options: {
        dateFormat: 'MM-YYYY',
      },
      validation: (Rule: any) => Rule.min(Rule.valueOfField('monthStart')),
    },
  ]
}


export default workProject;

export type WorkProject = {
  _id: string;
  _createdAt: Date;
  title: string;
}
