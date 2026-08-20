/**
 * Organisation logo URLs.
 *
 * The résumé data stores bare filenames (`nmc.png`), and the components used to
 * build `/src/assets/logos/${filename}` from them. That path only resolves in
 * dev, where Vite serves the source tree; in a production build nothing is
 * served from /src and every logo 404s.
 *
 * Globbing the directory instead lets Vite emit each file as a hashed, cache
 * busted asset and hands back the real URL for both the server render and the
 * client bundle. `query: '?url'` forces a plain string for every file type, so
 * png/jpg/jpeg/webp and svg all behave the same.
 */
const LOGO_URLS = import.meta.glob('/src/assets/logos/*', {
  eager: true,
  import: 'default',
  query: '?url',
}) as Record<string, string>;


export function logoUrl(filename?: string): string | undefined {
  if (!filename)
    return undefined;

  return LOGO_URLS[`/src/assets/logos/${filename}`];
}
