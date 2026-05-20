import { defineConfig } from "astro/config";
import preact from "@astrojs/preact";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

// Production hosts at the apex howtostorecrypto.com (see public/CNAME).
// SITE_URL / BASE_PATH still overridable via env if we ever move the host.
const site = process.env.SITE_URL ?? "https://howtostorecrypto.com";
const base = process.env.BASE_PATH ?? "/";

export default defineConfig({
  site,
  base,
  trailingSlash: "ignore",
  integrations: [preact({ compat: false }), mdx(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
