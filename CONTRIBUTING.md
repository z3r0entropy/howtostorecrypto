# Contributing

If you want to suggest a correction, an addition to the incident ledger,
or a new method / location / question — open an issue or PR. Be specific;
cite sources where you can.

For people working on the code itself: the rest of this file is the dev
manual.

## Stack

- [Astro 6](https://astro.build) (static export)
- [Preact 10](https://preactjs.com) for the interactive islands
- [Tailwind v4](https://tailwindcss.com)
- TypeScript everywhere

Three page layers:

| Layer     | Purpose                          | Route examples                                       |
| --------- | -------------------------------- | ---------------------------------------------------- |
| Marketing | Static long-form content         | `/`, `/brand`                                        |
| Tools     | Interactive Preact islands       | `/app`, `/app/setup`, `/app/locations`, `/app/quiz/*`|
| Reference | Typed data modules powering both | `src/data/*.ts`                                      |

## Local development

```bash
npm install
npm run dev               # http://localhost:4321
```

## Quality gates

```bash
npm run typecheck   # astro check
npm run lint        # biome check
npm run check       # both, in order

npm run lint:fix    # auto-fix lint + format
npm run format      # format only
```

CI (`.github/workflows/ci.yml`) runs `lint`, `typecheck`, and a
production build on every PR.

## Build

```bash
npm run build          # static output to ./dist
npm run build:bundle   # zip dist/ -> dist/offline.zip (run after build)
npm run preview        # serve the built site locally
```

## Deploy

Pushes to `main` build and publish via `.github/workflows/deploy.yml`.
Hosted on **GitHub Pages** at <https://howtostorecrypto.com> (apex,
configured via `public/CNAME`).

To set up the first deploy on a fresh fork or clone:

1. **DNS** — at your registrar, point the apex at GitHub Pages:

   Four A records on the apex:

   ```
   A  @  185.199.108.153
   A  @  185.199.109.153
   A  @  185.199.110.153
   A  @  185.199.111.153
   ```

   Or an ALIAS / ANAME record (if your DNS provider supports it):

   ```
   ALIAS  @  z3r0entropy.github.io.
   ```

   Plus `www` as a CNAME (optional):

   ```
   CNAME  www  z3r0entropy.github.io.
   ```

2. **GitHub** — repo **Settings → Pages**:
   - Source: **GitHub Actions**
   - Custom domain: `howtostorecrypto.com`
   - Enforce HTTPS: ✅ (after DNS + cert provision)

3. **Push to `main`** — workflow runs, deploys.

## Cutting a release

Pushes to `main` always update the live site, and `https://howtostorecrypto.com/offline.zip`
is rebuilt with every deploy. That copy is great for casual use but isn't
pinned — it changes whenever `main` does.

For a permanent, citable download (e.g. when the construction banner
eventually comes down, or when you want a known-good snapshot), tag a
release:

```bash
git tag v0.1.0
git push --tags
```

The `.github/workflows/release.yml` workflow builds the bundle and
attaches `offline.zip` to a GitHub Release at that tag. Releases are
retained indefinitely. The stable URL pattern is:

```
https://github.com/z3r0entropy/howtostorecrypto/releases/download/<tag>/offline.zip
https://github.com/z3r0entropy/howtostorecrypto/releases/latest/download/offline.zip
```

You can also cut a release without tagging via **Actions → Release → Run workflow**.

## Custom domain or fork

`astro.config.ts` reads `SITE_URL` and `BASE_PATH` from env vars so you
can re-host without code changes. For a project page (`username.github.io/repo`),
set `SITE_URL` to the org URL and `BASE_PATH` to `/<repo>`.

## Project layout

```
src/
├── components/       # Preact islands (.tsx)
│   ├── SetupWizard.tsx
│   ├── LocationsBrowser.tsx
│   ├── KnowledgeQuiz.tsx
│   └── AuditQuiz.tsx
├── data/             # Typed source-of-truth modules
│   ├── strategies.ts
│   ├── locations.ts
│   ├── quiz-knowledge.ts
│   └── quiz-audit.ts
├── layouts/
│   └── Layout.astro  # Shared shell — nav, footer, construction banner
├── lib/
│   └── url.ts        # Internal-link helper (handles base path)
├── pages/
│   ├── index.astro
│   ├── 404.astro
│   ├── brand.astro
│   └── app/
│       ├── index.astro
│       ├── setup.astro
│       ├── locations.astro
│       └── quiz/
│           ├── index.astro
│           ├── knowledge.astro
│           └── audit.astro
└── styles/
    └── global.css    # Design tokens + utility classes
```

## Editing content

Most copy and data lives in the typed modules under `src/data/`. You can
add a new backup location, audit question, or strategy variant without
touching components.

## Editorial conventions

- **Voice & tone** rules live at <https://howtostorecrypto.com/brand>
  (section 12). Patient, vendor-neutral, plain language.
- **Tailwind v4** important-modifier syntax is the suffix form (`px-4!`,
  not `!px-4`).
- **Internal links** must go through `~/lib/url` so they work both at
  the apex domain and at a project-page base path. Hash fragments and
  external URLs are fine raw.
