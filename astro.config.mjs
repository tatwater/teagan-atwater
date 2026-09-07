import { defineConfig, envField } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';


/**
 * Secrets are declared here rather than read through `import.meta.env` so they
 * are resolved at runtime. Vite inlines `import.meta.env.X` at build time, so a
 * variable added to the host as runtime-only silently became `undefined` — which
 * for TURNSTILE_SECRET_KEY meant captcha verification quietly disabled itself.
 *
 * Every field is optional so a missing variable degrades the contact route with
 * a clear error instead of failing the whole site's build.
 */
const secret = () => envField.string({ access: 'secret', context: 'server', optional: true });
const publicClient = () => envField.string({ access: 'public', context: 'client', optional: true });


export default defineConfig({
  integrations: [react({ experimentalDisableStreaming: true }), sitemap()],

  env: {
    schema: {
      ADMIN_EMAIL: secret(),
      RESEND_API_KEY: secret(),
      RESEND_FROM_EMAIL: secret(),
      TURNSTILE_SECRET_KEY: secret(),

      PUBLIC_CONVEX_URL: publicClient(),
      PUBLIC_SITE_URL: publicClient(),
      PUBLIC_TURNSTILE_SITE_KEY: publicClient(),
    },
  },

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
