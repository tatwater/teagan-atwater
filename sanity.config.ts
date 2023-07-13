import { defineConfig } from 'sanity';
import { deskTool } from 'sanity/desk';

import schemas from '@/sanity/schemas';


const config = defineConfig({
  apiVersion: '2023-04-08',
  basePath:   '/admin',
  dataset:    'production',
  plugins:    [deskTool()],
  projectId:  'l4d041dh',
  schema: {
    types: schemas,
  },
  title:      'Personal Site',
});


export default config;
