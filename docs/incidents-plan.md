# Incidents corpus — content & SEO plan

The single largest content initiative for the site. An ongoing, sourced,
JSON-driven database of crypto loss/theft incidents, used both as a
standalone reference and as the connective tissue between the abstract
guidance pages (`/methods`, `/mistakes`) and the conversion pages
(setup wizard, audit).

## Why this exists

1. **Original data.** Google ranks original research disproportionately
   well. Almost nobody maintains a structured, sourced, ongoing database
   of self-custody losses. `rekt.news` covers DeFi exploits;
   `web3isgoinggreat.com` is journalism. Nobody owns the "how individuals
   lose self-custodied crypto" niche.
2. **Long-tail keyword surface.** Each incident is a ranking surface for
   a low-volume, high-intent query.
3. **Backlink magnet.** Journalists, YouTubers, Wikipedia editors all
   need a canonical citation page per incident. Be that page.
4. **Topical authority.** Comprehensive coverage of a niche is the
   strongest signal Google has for "this site is THE source."

It also reinforces the brand: every incident is a concrete demonstration
of why the rest of the site exists.

## Information architecture

```
/incidents/                                ← hub: filterable timeline + leaderboard
/incidents/[slug]                          ← individual incident page (the workhorse)
/incidents/2024/                           ← year archive
/incidents/categories/phishing             ← category page (ranks for the category term)
/incidents/categories/exchange-hack
/incidents/categories/clipboard-malware
/incidents/categories/fake-wallet-app
/incidents/categories/seed-phrase-leak
/incidents/categories/inheritance-loss
/incidents/categories/physical-coercion    (the $5 wrench attack)
/incidents/categories/lost-key
/incidents/biggest-losses-of-all-time      ← evergreen leaderboard
/incidents/year-in-review/[year]           ← annual recap, refreshable, link-bait
/incidents/methodology                     ← sourcing/verification policy (E-E-A-T)
```

Every incident page cross-links to:

- the matching `/mistakes/` entry (the underlying lesson),
- the recommended `/methods/` page (what would have prevented it),
- 2–3 related incidents,
- the setup wizard / audit (conversion).

This funnels external backlinks toward conversion pages.

## Data model

JSON-driven so the hub and category pages can sort, filter, and run
aggregations (totals by year, totals by vector, etc.) entirely client-side
or at build time. One file per incident under `src/content/incidents/`.

```ts
type IncidentStatus =
  | "confirmed"        // primary sources, court records, on-chain proof
  | "alleged"          // victim/insider claim, plausible, not independently verified
  | "disputed"         // contradictory accounts, or affected party denies
  | "unverified"       // community report, no corroboration, included for pattern value
  | "legendary"        // widely-cited but possibly apocryphal; use sparingly with caveat
  | "recovered"        // funds fully returned
  | "partially-recovered";

type IncidentEntry = {
  slug: string;                          // "atomic-wallet-mass-drain-2023"
  title: string;
  status: IncidentStatus;                // ALWAYS visible on the page; never bury it
  statusNote?: string;                   // free text — what's verified, what isn't, by whom

  occurredOn?: string;                   // ISO date or year
  reportedOn?: string;
  amountUsd?: number;                    // best estimate at time of incident
  amountUsdNote?: string;                // "estimated", "across X victims", etc.
  asset?: string[];                      // ["BTC"], ["ETH","USDC"]
  victimType: "individual" | "exchange" | "dao" | "protocol" | "mixed";
  attackVector: string;                  // taxonomy — drives /categories/ pages
  rootCause: string[];                   // taxonomy — maps to /mistakes/ slugs

  summary: string;                       // 1–2 sentence elevator pitch
  body: string;                          // MDX — full writeup with citations inline

  preventedBy: Array<{
    method: string;                      // "methods/multisig", "methods/sealed-paper"
    explanation: string;                 // WHY this specific method would have prevented THIS specific incident
  }>;

  sources: Array<{
    url: string;
    publisher: string;                   // "CoinDesk", "DOJ filing", "Chainalysis report"
    publishedOn?: string;
    tier: 1 | 2 | 3;                     // 1=primary, 2=established journalism, 3=community
  }>;

  perpetrators?: Array<{
    name: string;
    status: "charged" | "convicted" | "alleged" | "unknown";
  }>;

  recoveredUsd?: number;
  relatedIncidents?: string[];           // slugs

  // For grouped/clustered entries — see "Cluster entries" below
  cluster?: {
    count: number | "many";              // approximate number of sub-incidents
    timeRange: { from: string; to?: string };
    subIncidents?: Array<{               // optional, partial entries
      occurredOn?: string;
      amountUsd?: number;
      summary: string;
      sources?: string[];
    }>;
  };
};
```

### `status` is a first-class citizen

Every incident page must surface `status` visibly — a colored tag in the
header. Never bury it. Readers (and crawlers) should be able to tell at
a glance whether they're looking at court-documented fact or community
folklore. Categories of `status`:

- **confirmed** — primary sources exist (court docs, on-chain evidence,
  victim statement corroborated by platform).
- **alleged** — the victim or a credible insider claims it happened, but
  no independent corroboration. Common for self-custody losses where the
  only witness is the victim.
- **disputed** — accounts contradict each other, or the named platform
  denies the incident.
- **unverified** — community report (Reddit, Bitcointalk). Included only
  when the *pattern* is instructive even if the specific case isn't
  provable.
- **legendary** — widely cited but probably apocryphal. Used sparingly,
  with a strong caveat — e.g. the canonical "guy threw away pizza-paid
  hard drive" stories that get embellished in retelling.
- **recovered / partially-recovered** — outcome modifier on top of the
  above.

`statusNote` captures the nuance: *"Amount disputed; Atomic Wallet team
confirmed the incident but contests the $100M figure cited by Elliptic."*

### `preventedBy` requires explanations, not just refs

This is the single most important field for the site's mission and for
SEO (it's what makes every incident page link out to the methods pages
with semantic anchor text). Each entry is `{ method, explanation }`:

```ts
preventedBy: [
  {
    method: "methods/multisig",
    explanation:
      "A 2-of-3 multisig would have prevented loss even with the seed " +
      "phrase leaked, because the attacker would still need access to a " +
      "second signer held at a different location."
  },
  {
    method: "methods/passphrase",
    explanation:
      "A BIP-39 passphrase (the optional 25th word) would have made the " +
      "leaked 24 words insufficient on their own — but only if the " +
      "passphrase itself was stored separately from the seed."
  }
]
```

These render as a section on each incident page ("What would have
prevented this") and each `explanation` becomes the surrounding context
for an internal link with method-page anchor text. Massive internal
linking signal.

### Cluster entries — for grouping smaller incidents

Many small incidents share the same vector and resolution. Don't create
500 thin pages for "victim of fake Ledger Live app #437." Group them:

- A **cluster entry** represents N similar sub-incidents.
- Lives at a single URL with a single page.
- Has aggregate stats (total amount, range of dates, approximate victim
  count) and optionally an array of `subIncidents` with minimal data
  per case.
- Examples:
  - `fake-ledger-live-app-cluster-2023` — 50+ reports, same vector, similar amounts.
  - `clipboard-malware-cluster-2024` — ongoing, pattern-level documentation.
  - `seed-photo-icloud-leak-pattern` — pattern entry, with `subIncidents`
    listing the most-cited specific examples.

Schema for clusters: the same `IncidentEntry` plus a `cluster` field
populated. Use `cluster.count` (number or `"many"`) and
`cluster.timeRange`. `amountUsd` becomes the aggregate. Individual
sub-incidents go in `cluster.subIncidents` if we have enough data on
each to bother.

Cluster entries also work for **patterns** — e.g. "lost-to-house-fire"
isn't really one incident, but it's a documentable pattern with several
known cases. Treat it as a cluster.

### Taxonomy — keep it tight

`attackVector` and `rootCause` are controlled vocabularies. Defining
them upfront is more important than getting them perfect — once 50
incidents are tagged, retroactive renaming is annoying. Starting set:

**attackVector** (drives `/categories/` pages):
`phishing`, `exchange-hack`, `clipboard-malware`, `fake-wallet-app`,
`seed-phrase-leak`, `inheritance-loss`, `physical-coercion`,
`lost-key`, `supply-chain`, `social-engineering`, `protocol-exploit`,
`sim-swap`.

**rootCause** (maps to `/mistakes/` slugs):
`single-location`, `digital-copy`, `cloud-backup`, `told-someone`,
`untested-recovery`, `memorized-only`, `bought-used-hardware`,
`installed-unverified-software`, `clicked-phishing-link`,
`exchange-custody`, `no-inheritance-plan`.

Adding a new vector or root-cause requires editorial review — that's
fine. The point is to keep the controlled set small and meaningful.

## Page templates

### Individual incident page

Above the fold:

- Title
- Status tag (color-coded)
- Date, amount lost (with note), victim type
- One-line summary

Below:

- Full writeup (MDX, inline citations)
- "What would have prevented this" — `preventedBy` rendered as cards
  with anchor links into the methods pages.
- Sources panel
- Related incidents
- CTA: setup wizard / audit

JSON-LD per page: `Article` (the writeup itself) + `NewsArticle` (for
news-style indexing) + `BreadcrumbList`. Cite primary sources via
`citation` in JSON-LD.

### Hub (`/incidents/`)

- Sortable table: date, title, amount, vector, status
- Filter chips: status, year, vector
- Timeline visualization (year-by-year totals)
- Top-of-page narrative: "What this database is, what it isn't, how we
  source incidents." Two paragraphs max — the data is the content.
- Targets: *crypto hacks list*, *crypto theft database*, *biggest crypto losses*.

### Category page (`/incidents/categories/[vector]`)

- Long-form essay on the vector — how it works, who it targets, the
  prevention pattern.
- Underneath: filtered list of all incidents tagged with the vector.
- Targets: *how people lose crypto to phishing*, *clipboard malware crypto*, etc.

### Year-in-review (`/incidents/year-in-review/[year]`)

- Total amount lost, # of incidents, biggest single loss, dominant
  vector, recovery stats.
- Top 10 of the year with one-paragraph summaries each.
- Published every January. Reliably picks up January news-cycle backlinks.

### Leaderboard (`/incidents/biggest-losses-of-all-time`)

- Top 50 of all time, sortable. Pure data viz.
- Refreshed quarterly. Link-bait.

## Sourcing

Tier 1 (must-cite when available): primary sources — court filings (SEC,
DOJ, bankruptcy), on-chain transaction evidence, official statements
from the affected platform, Chainalysis/Elliptic published reports.

Tier 2: established crypto journalism — CoinDesk, The Block, Bloomberg
crypto desk, Molly White's tracker.

Tier 3: community reports — Reddit, Bitcointalk archives, X threads.
Only included when (a) the pattern itself is instructive, and (b) status
is set to `unverified` or the entry is folded into a cluster.

A `/incidents/methodology` page documents this policy publicly. It's
both E-E-A-T signal and legal cover.

## Phasing

| Phase | Outcome | Estimated time |
|---|---|---|
| 1 | Schema + Astro content collection setup; 5 anchor incidents (Mt. Gox, Bitfinex 2016, Ledger 2020 leak, Atomic Wallet 2023, Stefan Thomas) to validate format. | ~1 week |
| 2 | Hub page with timeline + filter; 6 category pages with stub content. | ~1 week |
| 3 | Bulk-add 50 well-documented incidents covering all major vectors. | 2–3 weeks |
| 4 | Leaderboard page; first year-in-review (2025). | ~1 week |
| 5 | Steady-state editorial cadence: 1–2 new incidents/week, monthly digest post. | ongoing |

After phase 4: ~60 incident pages, 6 category pages, hub, leaderboard,
year-in-review. Enough surface area to start ranking and pulling
backlinks. Phase 5 compounds for years.

## Trade-offs & risks

1. **Defamation.** Naming individual perpetrators (especially "alleged")
   needs an editorial policy. Realistic options: name only the
   convicted/charged, or anonymize everyone but the platforms
   themselves. Get this wrong and you eat legal letters.
2. **Verification ceiling.** Many community losses are unverifiable.
   Either reject them (lower volume, higher trust) or cluster them with
   `status: unverified` (higher volume, more risk). Recommended: use
   clusters for unverified patterns, reject standalone unverified
   individual entries.
3. **Sustained editorial work.** This only ranks if it stays alive. A
   frozen database in 2027 reads as abandoned. Plan for 4–8 hours/week
   ongoing.
4. **The journalism drift.** Stay anchored to the prevention angle —
   every incident page exists to teach a lesson the rest of the site
   already names. Otherwise it becomes a sad-news blog and stops
   serving the site's actual purpose.

## Starting work

The next concrete step is Phase 1:

1. Decide on the final `attackVector` and `rootCause` taxonomies (~30 min).
2. Set up `src/content/incidents/` as an Astro content collection with
   the schema above.
3. Write the 5 anchor incidents in MDX with full `preventedBy`
   explanations and source citations.
4. Build the individual-incident page template.
5. Wire JSON-LD per incident.

That alone is publishable — and validates every part of the system
before committing to bulk content.
