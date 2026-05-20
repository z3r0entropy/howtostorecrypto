# How to Store Crypto

> ## ⚠ Under heavy construction
>
> **This site is a work-in-progress draft.** Content, structure, and
> recommendations are not yet stable. The "honest" tone is real, but the
> specifics have not been independently reviewed and may be wrong, outdated,
> or rough around the edges. **Do not act on anything here without
> independent verification.**
>
> If you found this somehow — thanks for the curiosity. Come back later.

A patient, vendor-neutral guide to storing your crypto so you don't lose it.
Methods, walkthrough, common mistakes, recovery testing, inheritance — plus
an interactive setup wizard, a backup-location reference database, a
knowledge quiz, and a current-setup audit.

Live: <https://howtostorecrypto.com>

---

## Stack

- [Astro 6](https://astro.build) (static export)
- [Preact 10](https://preactjs.com) for the interactive islands
- [Tailwind v4](https://tailwindcss.com)
- TypeScript everywhere

Three page layers:

| Layer | Purpose | Route examples |
|---|---|---|
| Marketing | Static long-form content | `/`, `/brand` |
| Tools | Interactive Preact islands | `/app`, `/app/setup`, `/app/locations`, `/app/quiz/*` |
| Reference | Typed data modules powering both | `src/data/*.ts` |

## Local development

```bash
npm install
npm run dev          # http://localhost:4321
npm run dev -- --host  # also accessible on your LAN
```

```bash
npm run build        # static output to ./dist
npm run preview      # serve the built site
```

## Deploy

Pushes to `main` build and publish via the workflow at
`.github/workflows/deploy.yml`. Hosted on **GitHub Pages** at
**howtostorecrypto.com** (apex). The `public/CNAME` file tells Pages which
domain to serve.

### First-time setup

1. **DNS** — at your domain registrar, point `howtostorecrypto.com` at GitHub Pages:

   Either four A records on the apex:

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

   And the `www` subdomain as a CNAME:

   ```
   CNAME  www  z3r0entropy.github.io.
   ```

2. **GitHub** — Repo **Settings → Pages**:
   - Source: **GitHub Actions**
   - Custom domain: `howtostorecrypto.com`
   - Enforce HTTPS: ✅ (after DNS propagates and the cert provisions)

3. **Push to `main`** — the workflow builds and deploys.

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
│   └── url.ts        # Internal-link helper (handles GH Pages base path)
├── pages/
│   ├── index.astro   # Landing
│   ├── brand.astro   # Design system reference
│   └── app/          # Interactive tools section
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

## Status

Heavy draft. Expect frequent breaking changes to copy, taxonomy, and route
structure until the disclaimer comes down.
