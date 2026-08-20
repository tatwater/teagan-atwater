import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';


export default defineConfig({
  integrations: [react({ experimentalDisableStreaming: true }), mdx(), sitemap()],

  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      force: true,
    },
  },

  adapter: vercel(),

  output: 'server',
});
