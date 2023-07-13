import { PortableTextBlock } from 'sanity';


const page = {
  name:  'page',
  title: 'Pages',
  type:  'document',
  fields: [
    {
      name:  'title',
      title: 'Title',
      type:  'string',
    },
    {
      name:  'slug',
      title: 'Slug',
      type:  'slug',
      options: {
        source:   'title',
        maxLength: 96,
      },
    },
    {
      name:  'content',
      title: 'Content',
      type:  'array',
      of: [
        {
          type: 'block',
        }
      ],
    },
  ]
}


export default page;

export type Page = {
  _id:        string;
  _createdAt: Date;
  title:      string;
  slug:       string;
  content:    PortableTextBlock[];
}
