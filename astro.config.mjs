import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';


export default defineConfig({
  integrations: [react({ experimentalDisableStreaming: true }), sitemap()],

  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      force: true,
    },
    ssr: {
      // Ship this in the server bundle rather than importing it at runtime.
      // It is a CommonJS package, and leaving it external makes the server
      // depend on Node's CJS named-export interop, which resolved the ESM build
      // locally but the CJS build on Vercel — crashing /resume with
      // "Named export 'WheelGesturesPlugin' not found".
      noExternal: ['embla-carousel-wheel-gestures'],
    },
  },

  adapter: vercel(),

  output: 'server',
});
