import { defineConfig } from "astro/config";
import preact from "@astrojs/preact";
import mdx from "@astrojs/mdx";
import sitemap, { ChangeFreqEnum } from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

// Production hosts at the apex howtostorecrypto.com (see public/CNAME).
// SITE_URL / BASE_PATH still overridable via env if we ever move the host.
const site = process.env.SITE_URL ?? "https://howtostorecrypto.com";
const base = process.env.BASE_PATH ?? "/";

export default defineConfig({
  site,
  base,
  trailingSlash: "ignore",
  // Inline small stylesheets directly into the HTML. Saves a round-trip
  // for the first paint; large stylesheets stay external & cacheable.
  build: { inlineStylesheets: "auto" },
  integrations: [
    preact({ compat: false }),
    mdx(),
    sitemap({
      changefreq: ChangeFreqEnum.MONTHLY,
      priority: 0.7,
      lastmod: new Date(),
      // Keep noindex pages out of the sitemap so crawlers don't waste
      // budget on URLs we've explicitly told them not to index.
      filter: (page) => !page.startsWith(`${site}/brand`),
      serialize(item) {
        // Boost the landing page; it's the canonical entry point and the
        // page we actually want ranking for "how to store crypto".
        if (item.url === `${site}/` || item.url === site) {
          item.priority = 1.0;
          item.changefreq = ChangeFreqEnum.WEEKLY;
        }
        return item;
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
