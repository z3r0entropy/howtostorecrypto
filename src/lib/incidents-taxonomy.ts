/**
 * Controlled vocabularies for the incidents corpus.
 *
 * Adding values is a deliberate editorial decision — once 50+ incidents
 * are tagged with a vocabulary item, renaming it is a multi-file edit.
 * Keep the set small and meaningful.
 */

/**
 * How the loss happened. Drives `/incidents/categories/[vector]` pages.
 */
export const ATTACK_VECTORS = [
  "phishing",
  "exchange-hack",
  "clipboard-malware",
  "fake-wallet-app",
  "seed-phrase-leak",
  "inheritance-loss",
  "physical-coercion",
  "lost-key",
  "supply-chain",
  "social-engineering",
  "protocol-exploit",
  "sim-swap",
] as const;
export type AttackVector = (typeof ATTACK_VECTORS)[number];

/**
 * The underlying mistake or condition that enabled the loss. Maps to
 * entries on the `/mistakes/` page — incident pages link out to the
 * matching mistake so readers can see the abstract lesson.
 */
export const ROOT_CAUSES = [
  "single-location",
  "digital-copy",
  "cloud-backup",
  "told-someone",
  "untested-recovery",
  "memorized-only",
  "bought-used-hardware",
  "installed-unverified-software",
  "clicked-phishing-link",
  "exchange-custody",
  "no-inheritance-plan",
  "weak-passphrase",
  "kyc-data-leak",
] as const;
export type RootCause = (typeof ROOT_CAUSES)[number];

/**
 * Slugs of the methods pages (`/methods/[slug]`). Used by `preventedBy`
 * so each incident links to specific prevention paths with rich anchor
 * text. Update as methods pages are built out.
 */
export const METHOD_SLUGS = [
  "methods/stamped-steel",
  "methods/multisig",
  "methods/shamir",
  "methods/sealed-paper",
  "methods/passphrase",
  "methods/self-custody",
  "methods/air-gapped-signer",
  "methods/verified-software",
  "methods/sealed-letter",
] as const;
export type MethodSlug = (typeof METHOD_SLUGS)[number];

/**
 * Human-readable label + one-line description for each method. The
 * label becomes the anchor text on incident pages; the description is
 * the secondary line under the link in `preventedBy` cards.
 */
export const METHOD_META: Record<MethodSlug, { label: string; blurb: string }> = {
  "methods/stamped-steel": {
    label: "Stamped steel backup",
    blurb: "Seed cold-stamped into 316 stainless. Survives fire, flood, decades.",
  },
  "methods/multisig": {
    label: "Multisig (m-of-n)",
    blurb: "Multiple keys, multiple locations, threshold to spend. No single point of failure.",
  },
  "methods/shamir": {
    label: "Shamir shares",
    blurb: "Split the seed into m-of-n shares. Reconstruct only with the threshold.",
  },
  "methods/sealed-paper": {
    label: "Sealed paper backup",
    blurb: "Printed phrase in a tamper-evident sleeve in a fire-rated safe — for redundancy only.",
  },
  "methods/passphrase": {
    label: "BIP-39 passphrase (25th word)",
    blurb: "An optional 25th word stored separately makes the 24 words alone insufficient.",
  },
  "methods/self-custody": {
    label: "Self-custody",
    blurb: "Hold your own keys. Exchange and custodial failures don't affect you.",
  },
  "methods/air-gapped-signer": {
    label: "Air-gapped signer",
    blurb: "Signing device never online. Compromised UIs cannot extract the seed.",
  },
  "methods/verified-software": {
    label: "Verified, audited software",
    blurb: "Open-source wallets with signed releases. Install only from official sources.",
  },
  "methods/sealed-letter": {
    label: "Sealed inheritance letter",
    blurb: "Locations and restore procedure held by an attorney or trusted relative.",
  },
};

/**
 * Visible status of an incident — surfaced as a tag on every page.
 * Order is rough confidence: confirmed (highest) → legendary (lowest).
 */
export const INCIDENT_STATUSES = [
  "confirmed",
  "recovered",
  "partially-recovered",
  "alleged",
  "disputed",
  "unverified",
  "legendary",
] as const;
export type IncidentStatus = (typeof INCIDENT_STATUSES)[number];

/**
 * Human-readable labels and short descriptions for each status.
 * Used by the status tag component and by SERP-visible status notes.
 */
export const STATUS_META: Record<
  IncidentStatus,
  { label: string; tone: "ok" | "warn" | "neutral" | "accent"; blurb: string }
> = {
  confirmed: {
    label: "Confirmed",
    tone: "accent",
    blurb:
      "Primary sources (court records, on-chain proof, official statements) corroborate the incident and the figures.",
  },
  recovered: {
    label: "Recovered",
    tone: "ok",
    blurb: "Funds were returned to the victim(s) — fully or substantially.",
  },
  "partially-recovered": {
    label: "Partially recovered",
    tone: "ok",
    blurb: "A portion of the stolen funds was recovered; most remains lost.",
  },
  alleged: {
    label: "Alleged",
    tone: "warn",
    blurb: "Claimed by the victim or an insider; plausible but not independently verified.",
  },
  disputed: {
    label: "Disputed",
    tone: "warn",
    blurb: "Accounts contradict, or the named platform denies the incident.",
  },
  unverified: {
    label: "Unverified",
    tone: "neutral",
    blurb: "Community report without corroboration. Included for the pattern, not the specifics.",
  },
  legendary: {
    label: "Legendary",
    tone: "neutral",
    blurb: "Widely cited but possibly embellished in retelling. Treat the figures with caution.",
  },
};
