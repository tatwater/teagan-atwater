import { PortableTextBlock } from 'sanity';


const project = {
  name:  'project',
  title: 'Projects',
  type:  'document',
  fields: [
    {
      name:  'name',
      title: 'Name',
      type:  'string',
    },
    {
      name:  'slug',
      title: 'Slug',
      type:  'slug',
      options: {
        source: 'name',
      },
    },
    {
      name:  'image',
      title: 'Image',
      type:  'image',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name:  'alt',
          title: 'Alt',
          type:  'string',
        }
      ]
    },
    {
      name:  'url',
      title: 'URL',
      type:  'url',
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
  ],
}


export default project;

export type Project = {
  _id:        string;
  _createdAt: Date;
  name:       string;
  slug:       string;
  image:      string;
  url:        string;
  content:    PortableTextBlock[];
}

