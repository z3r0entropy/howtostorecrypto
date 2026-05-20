/**
 * Build an internal URL that respects the configured base path.
 *
 * Astro's `import.meta.env.BASE_URL` is `/` in dev and (e.g.) `/howtostorecrypto/`
 * in production. Authors write site-absolute paths like `/app/setup`; this
 * helper prepends the base so both dev and prod hosting work.
 *
 * Works in both `.astro` files and Preact `.tsx` islands — Vite exposes
 * `BASE_URL` to the client bundle too.
 */
const rawBase = import.meta.env.BASE_URL ?? "/";
const base = rawBase.replace(/\/$/, "");

export function url(path: string): string {
  if (!path) return base || "/";
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("mailto:")) {
    return path;
  }
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
