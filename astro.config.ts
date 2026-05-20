import { defineConfig } from "astro/config";
import preact from "@astrojs/preact";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://howtostorecrypto.example",
  integrations: [preact({ compat: false }), mdx(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
