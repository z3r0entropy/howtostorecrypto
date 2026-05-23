/**
 * Database of backup locations. Each entry is one *place* where a copy
 * of a backup can live. The wizard offers these as picks; the /locations
 * page lets users browse and filter.
 *
 * Every storage decision trades off two distinct risks (see axisMeta):
 *  - LOSS-OF-ACCESS: you can no longer reach the backup.
 *  - THEFT: an adversary reaches the backup.
 * Most decisions improve one and worsen the other. Surfacing both
 * dimensions explicitly is half the point of this site.
 */

export type Category =
  | "home"
  | "institutional"
  | "trusted-person"
  | "commercial"
  | "outdoor"
  | "office"
  | "body"
  | "digital";

export type Resistance = 0 | 1 | 2 | 3; // 0 = none, 3 = excellent
export type LossResistance = Resistance;
export type TheftResistance = Resistance;
export type Access = "instant" | "hours" | "days" | "weeks";

/**
 * Where the backup physically lives relative to you.
 *  - on-site: same address you live at (home, in-house safe, etc.)
 *  - off-site: a different address (bank, vault, friend, attorney, etc.)
 *
 * "On-site" backups are convenient but co-located with you and your
 * possessions — a single fire/burglary can wipe them out. The whole
 * point of an off-site copy is that a single local event cannot.
 */
export type Siting = "on-site" | "off-site";

/**
 * Who holds the backup, if not you alone.
 *
 * `none` is "you and only you" — a safe in your home, a buried cache,
 * a property you own. Everything else introduces a counterparty whose
 * reliability, longevity, and behaviour are now part of your threat
 * model.
 */
export type ThirdParty =
  | "none"
  | "family"
  | "friend"
  | "attorney"
  | "bank"
  | "commercial-vault"
  | "trustee"
  | "employer"
  | "cloud-provider";

export type LocationRow = {
  slug: string;
  name: string;
  category: Category;
  tagline: string;
  pros: string[];
  cons: string[];
  bestFor: ("primary" | "secondary" | "tertiary")[];
  /** Composite axes — the primary lens. */
  lossResistance: LossResistance;
  theftResistance: TheftResistance;
  /** Granular ratings the wizard can reason over. */
  fire: Resistance;
  water: Resistance;
  access: Access;
  /** Human-readable cost label, e.g. "$40 – $200 / yr" or "$0". */
  costAnnualUsd: string;
  /**
   * Structured annual cost in USD for sorting / filtering. `min` = 0 for
   * free; `max` = same as `min` for fixed prices. Recurring annual only —
   * one-time setup costs are mentioned in `costAnnualUsd` prose where
   * relevant.
   */
  priceAnnualUsd: { min: number; max: number };
  recommendedFor: ("modest" | "significant" | "life-defining")[];

  /** On-site (same address you live at) vs off-site (different address). */
  siting: Siting;
  /**
   * True if the backup is reachable over a network. For self-custody this
   * is almost always a red flag — `online: true` means an attacker on the
   * other side of the world can attempt access. The only legitimate
   * `online: true` location on this site is an encrypted, self-hosted
   * copy, and even that's tertiary-only.
   */
  online: boolean;
  /**
   * If reaching the backup depends on someone else — bank, lawyer,
   * family, vault — record who they are and whether the dependence is
   * structural (you literally cannot use the backup without them) or
   * incidental (they only matter if you're incapacitated).
   */
  thirdParty: {
    type: ThirdParty;
    /**
     * `true` = the third party is required for any retrieval (bank,
     * lawyer, vault). `false` = they only matter in inheritance / under
     * specific conditions.
     */
    required: boolean;
    notes?: string;
  };

  /**
   * Tamper detection — distinct from theft resistance. A sealed envelope
   * with a broken seal tells you the secret is compromised *even if no
   * funds have moved*. A safe does not. 0 = no signal at all; 3 = strong
   * tamper-evidence (sealed package, audited vault).
   */
  tamperEvidence: Resistance;
  tamperEvidenceNotes?: string;

  /**
   * Coercion resistance — distinct from passive theft. How protected are
   * you if an adversary *forces* you (or a custodian) to hand the backup
   * over? Two things drive this rating:
   *
   *   1. Is the backup's existence/location known or knowable? A visible
   *      home safe is obvious; a buried cache is not.
   *   2. Even if known, can you actually comply under duress? A bank box
   *      is closed outside business hours; a multisig with an off-site
   *      trustee cannot be single-signed no matter who's holding the
   *      wrench.
   *
   * 0 = the seed is effectively on display under duress (tattoo, sticky
   * note, brain wallet); 3 = unknown to the attacker, or impossible to
   * surrender even if known (trustee multisig, attorney with legal
   * process required).
   */
  coercionResistance: Resistance;
  coercionNotes?: string;

  /**
   * Jurisdiction-dependent legal exposure: probate freeze, UCC liens,
   * treasure-trove laws, attorney-client privilege scope, etc. Free-form
   * because legal context varies by country and by year.
   */
  legalNotes?: string;

  /**
   * Optional grouping for closely-related variants (e.g. self-storage
   * basic vs climate-controlled). The browser can collapse entries with
   * the same `groupSlug` under one heading.
   */
  groupSlug?: string;

  /**
   * `true` = this entry exists primarily to warn people off it. Things
   * like tattooing the mnemonic, brain-wallet-only, or keeping a sticky
   * note under the keyboard. Surfaced visibly as a "Don't" treatment.
   * Entries get a page anyway because that's how people searching for
   * the "clever idea" find us telling them no.
   */
  isAntiPattern?: boolean;
  /** Short one-line reason this is an anti-pattern. Headline-friendly. */
  antiPatternWhy?: string;

  notes?: string;
  /** Plain-English risk notes per axis. Optional but helpful in the UI. */
  lossNotes?: string;
  theftNotes?: string;
};

export const categoryMeta: Record<Category, { label: string; emoji: string }> = {
  home: { label: "Home", emoji: "🏠" },
  institutional: { label: "Institutional", emoji: "🏦" },
  "trusted-person": { label: "Trusted person", emoji: "👥" },
  commercial: { label: "Commercial vault", emoji: "🔐" },
  outdoor: { label: "Outdoor", emoji: "🌳" },
  office: { label: "Office", emoji: "🏢" },
  body: { label: "On the body", emoji: "🧠" },
  digital: { label: "Digital", emoji: "💾" },
};

export const axisMeta = {
  loss: {
    label: "Loss-of-access resistance",
    short: "Loss",
    explain:
      "How well the location protects against you no longer being able to reach the backup — fire, flood, forgotten location, custodian folding, your own death without a procedure.",
    color: "var(--accent)",
  },
  theft: {
    label: "Theft resistance",
    short: "Theft",
    explain:
      "How well the location protects against an adversary reaching the backup *without your involvement* — burglary, opportunistic discovery, an indiscreet third party, insider access at a facility.",
    color: "var(--warn)",
  },
  coercion: {
    label: "Coercion resistance",
    short: "Coercion",
    explain:
      "How protected you are when an adversary forces you (or a custodian) to hand the backup over. A visible safe is obvious — the attacker knows to demand it. A buried cache they don't know about cannot be coerced out of you. A multisig with an off-site signer cannot be single-signed under any duress.",
    color: "var(--coerce)",
  },
  tamper: {
    label: "Tamper evidence",
    short: "Tamper",
    explain:
      "Whether you can *tell* the backup was inspected even if nothing has moved yet. A sealed envelope with a broken seal is a warning; a safe that's been opened and closed shows you nothing. High tamper-evidence buys you the chance to rotate the seed before the attacker uses it.",
    color: "var(--accent-deep)",
  },
} as const;

export const resistanceLabel = (r: Resistance) => ["None", "Weak", "Decent", "Strong"][r];

export const sitingMeta: Record<Siting, { label: string; blurb: string }> = {
  "on-site": {
    label: "On-site",
    blurb:
      "Same address as you. Convenient — but exposed to the same local events that affect you.",
  },
  "off-site": {
    label: "Off-site",
    blurb:
      "Different address. The whole point: a single local event cannot reach both you and the backup.",
  },
};

export const thirdPartyMeta: Record<ThirdParty, { label: string; blurb: string }> = {
  none: {
    label: "You alone",
    blurb: "No counterparty. You and only you decide what happens to this backup.",
  },
  family: {
    label: "Family member",
    blurb: "A relative holds it. Trust is high but they inherit your threat model.",
  },
  friend: {
    label: "Trusted friend",
    blurb:
      "A non-family person you trust. Adds geographic separation; lifespan of the arrangement varies.",
  },
  attorney: {
    label: "Attorney",
    blurb: "Professional duty of care, bonded, succession plan. Excellent for inheritance.",
  },
  bank: {
    label: "Bank",
    blurb: "Safety deposit box. Regulated, audited, but subject to bank policies and seizure.",
  },
  "commercial-vault": {
    label: "Commercial vault",
    blurb:
      "Purpose-built bearer-asset storage (Brink's, IBV, Loomis). Highest non-government tier.",
  },
  trustee: {
    label: "Collaborative-custody trustee",
    blurb: "Holds one key in a multisig. Cannot spend alone; can co-sign with the heir.",
  },
  employer: {
    label: "Employer",
    blurb: "Office safe / company premises. Strongly discouraged — you don't control access.",
  },
  "cloud-provider": {
    label: "Cloud provider",
    blurb:
      "Network-reachable storage you don't physically control. Only ever encrypted, only ever tertiary.",
  },
};

export const locations: LocationRow[] = [
  {
    slug: "fire-rated-safe",
    name: "Fire-rated home safe",
    category: "home",
    tagline: "A UL-rated safe bolted to the floor of a room that won't flood.",
    pros: ["Always available", "Reasonably fire-resistant", "Cheap once owned"],
    cons: ["Theft-vulnerable if found", "Single location", "Quality varies wildly"],
    bestFor: ["primary"],
    lossResistance: 2,
    theftResistance: 1,
    fire: 2,
    water: 2,
    access: "instant",
    costAnnualUsd: "$0 (after $150–$500 one-time)",
    priceAnnualUsd: { min: 0, max: 0 },
    recommendedFor: ["modest", "significant", "life-defining"],
    siting: "on-site",
    online: false,
    thirdParty: { type: "none", required: false },
    tamperEvidence: 1,
    tamperEvidenceNotes:
      "A safe shows you nothing about whether it's been opened — unless you add a tamper-evident bag *inside* the safe, in which case the bag carries the signal.",
    coercionResistance: 1,
    coercionNotes:
      "Visible, bolted to your floor, known to anyone who's been in your home. Under duress you'd open it; there is no structural reason you couldn't.",
    legalNotes:
      "No specific legal exposure. Insurance policies typically exclude bearer assets / cryptocurrency by default; check yours before treating it as covered.",
    notes:
      "Look for UL Class 350 ratings. Cheap 'fire safes' from big-box stores are mostly for paper documents at ~1 hour.",
    lossNotes: "Survives short fires and minor water. Not survivable across a house-loss event.",
    theftNotes:
      "A determined burglar with time defeats most home safes. Bolt-down helps; concealment helps more.",
  },
  {
    slug: "bank-deposit-box",
    name: "Bank safety deposit box",
    category: "institutional",
    tagline: "Old, slow, regulated. Excellent as a second location.",
    pros: ["High theft resistance", "Independent of your home", "Cheap"],
    cons: [
      "Banks have flooded and been seized",
      "Access is business-hours only",
      "Not safe as a single location",
    ],
    bestFor: ["secondary", "tertiary"],
    lossResistance: 2,
    theftResistance: 3,
    fire: 3,
    water: 2,
    access: "hours",
    costAnnualUsd: "$40 – $200 / yr",
    priceAnnualUsd: { min: 40, max: 200 },
    recommendedFor: ["modest", "significant", "life-defining"],
    siting: "off-site",
    online: false,
    thirdParty: {
      type: "bank",
      required: true,
      notes:
        "Bank holds the only key to the box room. Their hours, policies, and continued operation gate retrieval.",
    },
    tamperEvidence: 2,
    tamperEvidenceNotes:
      "Banks keep an access log of every visit to your box. A sealed package inside the box adds a second layer — the broken seal tells you the bank's audit trail isn't enough.",
    coercionResistance: 2,
    coercionNotes:
      "Closed outside business hours. An attacker can force you to take them there, but the public, audited setting, identity check, and presence of staff materially slow things down.",
    legalNotes:
      "In many jurisdictions the box freezes on the death of the holder until a probate court releases it — often weeks or months. Several US states have historically allowed law enforcement to drill boxes on suspicion alone. Bank insurance typically excludes contents.",
    notes: "Never the only location — bank policies, seizures, and floods all happen.",
    lossNotes:
      "Bank can fold, get seized, deny access during disputes, or close the branch. Treat it as a strong second, not a fortress.",
    theftNotes: "Excellent — armed staff, vault, audit trail, no smash-and-grab.",
  },
  {
    slug: "parents-house",
    name: "Parents' / sibling's house",
    category: "trusted-person",
    tagline: "Family safe in a different city or building, sealed package.",
    pros: ["Free", "Geographically separate", "Available in emergencies"],
    cons: [
      "Requires trust and discretion",
      "Their house has its own risks",
      "Cannot be tampered with — sealed package required",
    ],
    bestFor: ["secondary"],
    lossResistance: 1,
    theftResistance: 2,
    fire: 1,
    water: 1,
    access: "days",
    costAnnualUsd: "$0",
    priceAnnualUsd: { min: 0, max: 0 },
    recommendedFor: ["modest", "significant"],
    siting: "off-site",
    online: false,
    thirdParty: {
      type: "family",
      required: true,
      notes:
        "Relative physically holds the sealed package. They don't need to know what's inside to be a valid second location.",
    },
    tamperEvidence: 3,
    tamperEvidenceNotes:
      "The sealed tamper-evident package is the whole point — if the family member opens it (out of curiosity, under pressure, or because someone else asked), you know the moment you retrieve it.",
    coercionResistance: 2,
    coercionNotes:
      "An attacker needs to know about the second location to coerce you about it. Discretion reduces but does not eliminate the risk; the family member is a separate coercion target.",
    legalNotes:
      "In most jurisdictions a sealed envelope handed for safekeeping creates no special legal duties on the holder. If they die or become incapacitated the package becomes part of their estate temporarily; document a chain of custody in your sealed letter.",
    notes: "Tamper-evident bag with instructions: 'Do not open. Hand to me only.' Test annually.",
    lossNotes:
      "Their house has its own fire, flood, decluttering, divorce, and probate risks. You inherit their failure modes.",
    theftNotes:
      "Reasonable if sealed and they're trustworthy. They are now a coercion target alongside you.",
  },
  {
    slug: "lawyer-vault",
    name: "Attorney's vault / safe",
    category: "trusted-person",
    tagline: "Sealed envelope held by your estate attorney. Excellent for inheritance.",
    pros: ["Legally bound custody", "Survives you (the whole point)", "Independent location"],
    cons: ["Costs money", "Slow access — by appointment", "Need to choose a serious attorney"],
    bestFor: ["tertiary"],
    lossResistance: 3,
    theftResistance: 3,
    fire: 3,
    water: 3,
    access: "days",
    costAnnualUsd: "$100 – $500 / yr",
    priceAnnualUsd: { min: 100, max: 500 },
    recommendedFor: ["significant", "life-defining"],
    siting: "off-site",
    online: false,
    thirdParty: {
      type: "attorney",
      required: true,
      notes:
        "Professional duty of care, succession plan, bonded — but choose a firm, not a solo practitioner near retirement.",
    },
    tamperEvidence: 3,
    tamperEvidenceNotes:
      "Sealed envelopes held by an attorney sit in a vault with a chain of custody. Both the seal and the firm's procedural log give you signal if anyone touched it.",
    coercionResistance: 3,
    coercionNotes:
      "The attorney releases the envelope only on documented authorisation — a notarised request, a death certificate, an estate proceeding. There is no fast path for an adversary at the door.",
    legalNotes:
      "Attorney-client privilege does not automatically cover the *contents* of a sealed envelope held in safekeeping — only the related advice. The estate-planning relationship does protect access and inheritance flow. Choose a firm with explicit succession arrangements for solo attorneys.",
    notes:
      "Best paired with a will or trust that references the envelope's contents and the recovery procedure.",
    lossNotes:
      "Strong, but choose a firm with succession plans. A retiring solo lawyer can become a single point of failure.",
    theftNotes:
      "Excellent — bonded, audited, professional duty. The contents are sealed and treated as privileged.",
  },
  {
    slug: "second-property",
    name: "Second property (vacation home, etc.)",
    category: "home",
    tagline: "If you have one, it's a near-perfect second location.",
    pros: ["True geographic separation", "Same convenience as home", "No third party involved"],
    cons: [
      "Requires owning a second property",
      "Empty for long stretches → theft risk",
      "Insurance may not cover bearer assets",
    ],
    bestFor: ["secondary"],
    lossResistance: 2,
    theftResistance: 1,
    fire: 2,
    water: 2,
    access: "days",
    costAnnualUsd: "$0 (presuming you already own it)",
    priceAnnualUsd: { min: 0, max: 0 },
    recommendedFor: ["significant", "life-defining"],
    siting: "off-site",
    online: false,
    thirdParty: { type: "none", required: false },
    tamperEvidence: 1,
    tamperEvidenceNotes:
      "A house you visit only seasonally has no inherent tamper signal. Put the backup in a sealed package inside a safe — the package gives you the signal the property cannot.",
    coercionResistance: 2,
    coercionNotes:
      "If the property is publicly tied to you (deed records, social media) it can be coerced about. Anonymity in ownership and discretion about its contents both raise the bar.",
    legalNotes:
      "Property insurance almost universally excludes bearer assets and cryptocurrency. Check whether your title and your estate plan treat the property and its contents the way you'd want for inheritance.",
    lossNotes:
      "Survives the typical disasters; you're exposed to a long absence and unnoticed damage.",
    theftNotes:
      "Empty homes attract opportunists. A safe well bolted-down helps; a hidden one helps more.",
  },
  {
    slug: "commercial-vault",
    name: "Commercial vault (Brink's, IBV, Loomis)",
    category: "commercial",
    tagline: "Purpose-built bearer-asset storage. Bullion-grade.",
    pros: [
      "Best-in-class physical security",
      "Insured (within limits)",
      "Designed for exactly this use case",
    ],
    cons: ["Annual fees", "Slow access", "Counterparty introduced", "Concentrated in major cities"],
    bestFor: ["secondary", "tertiary"],
    lossResistance: 3,
    theftResistance: 3,
    fire: 3,
    water: 3,
    access: "days",
    costAnnualUsd: "$200 – $1,500 / yr",
    priceAnnualUsd: { min: 200, max: 1500 },
    recommendedFor: ["life-defining"],
    siting: "off-site",
    online: false,
    thirdParty: {
      type: "commercial-vault",
      required: true,
      notes:
        "Bonded, audited, insured to a contracted limit. Read that limit before assuming 'insured' means 'whole'.",
    },
    tamperEvidence: 3,
    tamperEvidenceNotes:
      "Vault visits are logged, escorted, video-recorded. A sealed package inside the box adds redundancy — and many vaults will accept a customer-sealed package and re-verify the seal at each visit on request.",
    coercionResistance: 3,
    coercionNotes:
      "Vault visits are by appointment, escorted, video-recorded. An attacker cannot rush you in and out unnoticed; armed staff and procedural friction make duress impractical.",
    legalNotes:
      "Read the bailment contract carefully. Most vaults limit liability per box (often $500–$10k regardless of declared value); separate insurance is sold for higher coverage. Customer death triggers contracted release procedures that vary by vendor — confirm the inheritance flow before relying on it.",
    notes: "Read the contract — many limit liability to a fixed dollar amount per box.",
    lossNotes:
      "Purpose-built fire/flood/EMP protection. The remaining risk is the vendor folding or being acquired.",
    theftNotes: "Highest tier available outside government facilities. Audited, bonded, armed.",
  },
  {
    slug: "buried-cache",
    name: "Buried / hidden cache",
    category: "outdoor",
    tagline: "A waterproof container buried in a memorable location.",
    pros: ["Free", "Excellent against burglary", "Doesn't depend on anyone else"],
    cons: [
      "Loss of the location knowledge = loss",
      "Construction, weather, animals can move it",
      "Hard to test or rotate",
    ],
    bestFor: ["tertiary"],
    lossResistance: 1,
    theftResistance: 3,
    fire: 3,
    water: 2,
    access: "weeks",
    costAnnualUsd: "$0",
    priceAnnualUsd: { min: 0, max: 0 },
    recommendedFor: ["life-defining"],
    siting: "off-site",
    online: false,
    thirdParty: { type: "none", required: false },
    tamperEvidence: 0,
    tamperEvidenceNotes:
      "A buried cache gives you no signal until you dig it up. By the time you discover tampering, the seed is long compromised.",
    coercionResistance: 3,
    coercionNotes:
      "An attacker only knows to demand what they know exists. A buried cache you've told no one about cannot be coerced out of you — at the price of being the lossiest storage method on this list.",
    legalNotes:
      "Burying on land you don't own is trespass in most jurisdictions and may also implicate treasure-trove or found-property statutes that vary wildly by country. Burying on your own land is fine; check zoning if it touches anything substantial.",
    notes:
      "Document the location in your sealed letter; pin against a permanent landmark, not vegetation.",
    lossNotes:
      "Highest loss-of-access risk on this list. Forgetting the location, construction changes, animals — all silent failures.",
    theftNotes: "Excellent — no one looks where they don't know to look.",
  },
  {
    slug: "office-safe",
    name: "Office safe",
    category: "office",
    tagline: "Generally a poor choice. Mentioned because people ask.",
    pros: ["Geographically separate from home"],
    cons: [
      "You don't control access",
      "Job change = lost backup",
      "Cleaners, IT, colleagues all touch the space",
    ],
    bestFor: [],
    lossResistance: 0,
    theftResistance: 0,
    fire: 1,
    water: 1,
    access: "hours",
    costAnnualUsd: "$0",
    priceAnnualUsd: { min: 0, max: 0 },
    recommendedFor: [],
    siting: "off-site",
    online: false,
    thirdParty: {
      type: "employer",
      required: true,
      notes: "Your continued employment, and the employer's continued operation, gate retrieval.",
    },
    tamperEvidence: 1,
    tamperEvidenceNotes:
      "Buildings have cameras and access logs, but you don't control them. The employer can review them; you typically cannot. A sealed package inside a personal locked container partially compensates.",
    coercionResistance: 1,
    coercionNotes:
      "Effectively as bad as a home safe — visible, known to colleagues — with the added wrinkle that the employer also has effective access. No structural defence under duress.",
    legalNotes:
      "Most employment contracts give the employer ownership of, or unrestricted access to, anything stored on the premises — particularly inside company-issued furniture or safes. On termination, anything left behind may be legally yours but practically inaccessible.",
    notes: "Don't.",
    lossNotes: "A job change, layoff, office move, or company failure all sever your access.",
    theftNotes:
      "Cleaners, IT, colleagues, security staff all have plausible reasons to be in the space. Audit trails are weak.",
  },
  {
    slug: "trusted-friend",
    name: "Trusted friend, different city",
    category: "trusted-person",
    tagline: "Tamper-evident envelope, never opened, geographically separate.",
    pros: ["Free", "Real geographic separation", "Reasonable for inheritance fallback"],
    cons: ["Requires real trust", "Their security is your security", "Awkward when life changes"],
    bestFor: ["secondary", "tertiary"],
    lossResistance: 1,
    theftResistance: 2,
    fire: 1,
    water: 1,
    access: "days",
    costAnnualUsd: "$0",
    priceAnnualUsd: { min: 0, max: 0 },
    recommendedFor: ["modest", "significant"],
    siting: "off-site",
    online: false,
    thirdParty: {
      type: "friend",
      required: true,
      notes:
        "Trust + discretion + longevity of the relationship. They don't open the package; they only hold it.",
    },
    tamperEvidence: 3,
    tamperEvidenceNotes:
      "Same logic as the family case — the sealed tamper-evident package is the signal. Friends, unlike close family, may be more likely to investigate out of curiosity; the seal matters more here, not less.",
    coercionResistance: 2,
    coercionNotes:
      "Discretion reduces the attacker's knowledge of the second location. The friend is a separate coercion target — and unlike family, an attacker may have an easier time getting to them without anyone noticing.",
    legalNotes:
      "No special legal duty is created by handing a friend a sealed envelope for safekeeping. If they pre-decease you the package becomes part of their estate temporarily — name a backup recipient and document the chain in your sealed letter.",
    lossNotes:
      "Friends move, fall out of touch, change phones. Schedule annual contact specifically to confirm the envelope.",
    theftNotes:
      "Their household security becomes yours. Sealed package required; opened = compromised.",
  },
  {
    slug: "self-storage-basic",
    name: "Self-storage unit — basic",
    category: "commercial",
    groupSlug: "self-storage",
    tagline:
      "Cheap, anonymous, exposed. Acceptable only as a tertiary, and even then with caveats.",
    pros: ["Cheap", "Independent of your home", "Anonymous to anyone who knows you"],
    cons: [
      "Variable security per facility",
      "No climate control — humidity, heat, dust accelerate paper degradation",
      "Cut-the-lock burglaries are routine",
      "Auctioned if you stop paying",
    ],
    bestFor: ["tertiary"],
    lossResistance: 1,
    theftResistance: 1,
    fire: 1,
    water: 1,
    access: "hours",
    costAnnualUsd: "$150 – $600 / yr",
    priceAnnualUsd: { min: 150, max: 600 },
    recommendedFor: ["significant"],
    siting: "off-site",
    online: false,
    thirdParty: {
      type: "commercial-vault",
      required: true,
      notes:
        "Generic storage facility — lower security than a bonded vault, vulnerable to auction if you miss payment.",
    },
    tamperEvidence: 1,
    tamperEvidenceNotes:
      "Staff have master access for emergency openings. A sealed tamper-evident package inside the unit is essentially required to get any signal at all.",
    coercionResistance: 2,
    coercionNotes:
      "Off-site and not publicly tied to you. An adversary needs to know the facility and unit number; staff would not normally enable an emergency open without identification and process.",
    legalNotes:
      "Missed payment leads to lien and auction under the Self-Service Storage Facility Act (US) or equivalent. The facility owes you no special duty of care for unusual contents. Renter's insurance for self-storage usually excludes bearer assets.",
    notes:
      "If you must use one, choose a facility with electronic logs and individual alarms. A stamped steel plate is much more tolerant of bad conditions than paper.",
    lossNotes:
      "Miss a payment → the unit is auctioned and your backup with it. Set autopay and a dead-man review.",
    theftNotes:
      "Cut-the-lock burglaries are routine; facility staff have master access. Choose carefully.",
  },
  {
    slug: "self-storage-climate-controlled",
    name: "Self-storage unit — climate-controlled, access-controlled",
    category: "commercial",
    groupSlug: "self-storage",
    tagline:
      "Same category, materially better operationally: climate control, individual alarms, electronic access logs.",
    pros: [
      "Stable climate protects paper",
      "Individual unit alarms",
      "Per-unit electronic access logs",
      "Independent of your home",
    ],
    cons: [
      "More expensive than a basic unit",
      "Still subject to staff master-access and auction risk",
      "Higher cost makes it harder to justify vs a bank box for the same money",
    ],
    bestFor: ["tertiary"],
    lossResistance: 2,
    theftResistance: 2,
    fire: 2,
    water: 2,
    access: "hours",
    costAnnualUsd: "$400 – $1,500 / yr",
    priceAnnualUsd: { min: 400, max: 1500 },
    recommendedFor: ["significant", "life-defining"],
    siting: "off-site",
    online: false,
    thirdParty: {
      type: "commercial-vault",
      required: true,
      notes:
        "Same facility category, but the higher-tier offering shifts the threat model. Still not a vault.",
    },
    tamperEvidence: 2,
    tamperEvidenceNotes:
      "Per-unit electronic access logs combined with a sealed package inside give you two independent signals if anything is touched.",
    coercionResistance: 2,
    coercionNotes:
      "Same coercion profile as the basic unit. Operational upgrades — climate, alarms, logs — don't materially change the duress story.",
    legalNotes:
      "Same legal exposure as a basic unit — lien + auction on non-payment, no special duty of care for unusual contents. The operational upgrade does not change the legal layer.",
    notes:
      "At the upper end of this price band, a bank deposit box is comparable and often a stronger choice; budget accordingly.",
    lossNotes:
      "Climate control + electronic logs materially improve loss resistance. Auction risk is unchanged — autopay and an annual review remain non-negotiable.",
    theftNotes:
      "Individual alarms deter opportunistic break-ins. Staff master-access still exists; the package seal is your only insurance against insider abuse.",
  },
  {
    slug: "in-floor-safe",
    name: "In-floor / in-wall safe",
    category: "home",
    tagline: "Concealed safe set into the slab or framing.",
    pros: [
      "Excellent against opportunistic theft",
      "Always available",
      "Survives most fires if positioned well",
    ],
    cons: ["Requires installation", "Not portable when you move", "Still a single location"],
    bestFor: ["primary"],
    lossResistance: 1,
    theftResistance: 3,
    fire: 3,
    water: 1,
    access: "instant",
    costAnnualUsd: "$0 (after $400–$1,500 install)",
    priceAnnualUsd: { min: 0, max: 0 },
    recommendedFor: ["significant", "life-defining"],
    siting: "on-site",
    online: false,
    thirdParty: { type: "none", required: false },
    tamperEvidence: 1,
    tamperEvidenceNotes:
      "A concealed safe shows no signal that it's been opened. Add a sealed package inside if you want tamper-evidence on the contents.",
    coercionResistance: 2,
    coercionNotes:
      "Concealment is the whole point — an attacker who doesn't suspect a safe exists cannot demand it. If they do suspect, the in-floor location buys delay but the seed is gettable.",
    legalNotes:
      "Permanent installations may need to be disclosed at sale of the home and may form part of the real-estate transaction. Insurance typically excludes bearer assets.",
    lossNotes:
      "Slab floods, in-wall leaks, and total house-loss events still apply. Single location.",
    theftNotes: "Excellent against opportunistic burglary — you can't steal what you can't find.",
  },
  {
    slug: "co-signer-trustee",
    name: "Collaborative-custody trustee",
    category: "commercial",
    tagline: "A regulated firm holds one multisig key. Never enough to spend alone.",
    pros: [
      "Heir-initiated recovery without exposing seeds",
      "Insured custody of one key",
      "Annual rehearsal supported",
    ],
    cons: ["Annual fee", "Counterparty re-introduced (constrained)", "Vendor selection matters"],
    bestFor: ["tertiary"],
    lossResistance: 2,
    theftResistance: 3,
    fire: 3,
    water: 3,
    access: "days",
    costAnnualUsd: "$200 – $500 / yr",
    priceAnnualUsd: { min: 200, max: 500 },
    recommendedFor: ["life-defining"],
    siting: "off-site",
    online: false,
    thirdParty: {
      type: "trustee",
      required: true,
      notes:
        "Holds exactly one key in your multisig. Cannot spend alone. Required to co-sign in inheritance.",
    },
    tamperEvidence: 3,
    tamperEvidenceNotes:
      "Trustees keep an access log per key. Any unauthorised use attempt should be visible in the audit trail and surfaced to you under the service contract.",
    coercionResistance: 3,
    coercionNotes:
      "The trustee will not co-sign under duress; the multisig structure means you literally cannot spend alone, however much pressure you're under. The strongest coercion defence on this list.",
    legalNotes:
      "Read the service agreement closely: trustee insolvency, acquisition, or change of jurisdiction may trigger your right to migrate the key. Some trustees operate under specific licensing (e.g. trust company charters in some US states) that meaningfully affects bankruptcy remoteness.",
    notes: "Only meaningful inside a multisig setup; pointless for single-sig.",
    lossNotes:
      "The trustee can fold or be acquired. The multisig means it's not catastrophic — you still have other keys.",
    theftNotes:
      "Their key alone can't move funds. Even a full compromise of the trustee is not catastrophic.",
  },
  {
    slug: "encrypted-cloud",
    name: "Self-hosted encrypted cloud copy",
    category: "digital",
    tagline: "An encrypted backup file on a vault you control. Tertiary only.",
    pros: ["Survives total physical destruction", "Free or near-free", "Restorable from anywhere"],
    cons: [
      "Only as strong as your passphrase",
      "Adds a second secret",
      "Hot — connected to the network by definition",
    ],
    bestFor: ["tertiary"],
    lossResistance: 2,
    theftResistance: 2,
    fire: 3,
    water: 3,
    access: "instant",
    costAnnualUsd: "$0 – $80 / yr",
    priceAnnualUsd: { min: 0, max: 80 },
    recommendedFor: ["significant", "life-defining"],
    siting: "off-site",
    online: true,
    thirdParty: {
      type: "cloud-provider",
      required: true,
      notes:
        "Provider can fold, lock the account, or be compromised. Your encryption is the only thing between them and the seed.",
    },
    tamperEvidence: 2,
    tamperEvidenceNotes:
      "Cloud providers log access (sometimes). A separately-tracked file hash, signed with a local key, gives you the strongest signal — any difference at fetch time means tampering or corruption.",
    coercionResistance: 1,
    coercionNotes:
      "If you can be forced to log in, the encrypted file can be downloaded. If the encryption passphrase is also coercible, the seed is gone. A strong passphrase, stored separately, is the only mitigation.",
    legalNotes:
      "Cloud providers regularly close accounts unilaterally, comply with subpoenas, and may not give meaningful notice of account closure. Encryption with a strong, separately-stored passphrase is the only real protection — and means the legal exposure of the provider is largely irrelevant.",
    notes:
      "Acceptable as a tertiary if (a) the file is encrypted with a strong, separately-stored passphrase, and (b) the storage is on something you self-host.",
    lossNotes:
      "Survives physical loss. Forgotten passphrase is total loss; cloud provider folding is total loss without a local copy.",
    theftNotes:
      "A connected, sync-able copy. The encryption is the only thing between an attacker and the seed. Strong passphrase, separately stored.",
  },
  {
    slug: "diff-currency-room",
    name: "Different room in same home",
    category: "home",
    tagline: "Not a separate location. Mentioned to be ruled out.",
    pros: ["Easy to set up"],
    cons: [
      "Not geographically separate at all",
      "Single fire / flood / burglary destroys all copies",
      "False sense of redundancy",
    ],
    bestFor: [],
    lossResistance: 0,
    theftResistance: 1,
    fire: 1,
    water: 1,
    access: "instant",
    costAnnualUsd: "$0",
    priceAnnualUsd: { min: 0, max: 0 },
    recommendedFor: [],
    siting: "on-site",
    online: false,
    thirdParty: { type: "none", required: false },
    tamperEvidence: 1,
    tamperEvidenceNotes:
      "Inside your own home you're likely to notice gross disturbance, but subtle tampering (someone copying a sheet then replacing it) gives no signal at all.",
    coercionResistance: 1,
    coercionNotes:
      "Same building, same coercion event — both copies surrendered together. No structural protection against duress.",
    legalNotes:
      "No specific legal exposure. The redundancy is illusory; the legal status doesn't compensate.",
    notes: "Two copies in the same building is one copy.",
    lossNotes:
      "Provides no redundancy against the events redundancy is for. Two copies, one event, both gone.",
    theftNotes: "A burglar with time finds both. Same as one copy.",
  },
  {
    slug: "spouse-key",
    name: "Spouse / partner key",
    category: "trusted-person",
    tagline: "One multisig key held by a spouse — only useful in multisig setups.",
    pros: [
      "Trust is already established",
      "Heir-flow without involving a stranger",
      "Geographically separate from your daily routines",
    ],
    cons: [
      "Coercion against you affects both",
      "Divorce is the edge case",
      "Spouse must learn the procedure",
    ],
    bestFor: ["secondary"],
    lossResistance: 1,
    theftResistance: 2,
    fire: 1,
    water: 1,
    access: "instant",
    costAnnualUsd: "$0",
    priceAnnualUsd: { min: 0, max: 0 },
    recommendedFor: ["significant", "life-defining"],
    siting: "on-site",
    online: false,
    thirdParty: {
      type: "family",
      required: true,
      notes:
        "Spouse holds one multisig key. Cannot spend alone; required to co-sign in your absence.",
    },
    tamperEvidence: 2,
    tamperEvidenceNotes:
      "Inside the household, tamper-evident packaging still works — but a household-internal break-in or coercion event likely hits both you and the spouse together, defeating the signal.",
    coercionResistance: 1,
    coercionNotes:
      "A coercion event at home likely targets both spouses simultaneously. The multisig structure only helps if a third signer is reachably off-site and the attacker is on a clock.",
    legalNotes:
      "Divorce proceedings can freeze or split joint assets, including the key material the spouse holds. Prenup or postnup language explicitly addressing crypto custody is the cleanest answer for significant holdings.",
    notes:
      "Only inside a multisig. Never give a spouse the entire single-sig seed for 'safety' — it doesn't add safety, it doubles attack surface.",
    lossNotes:
      "Divorce or estrangement is the practical loss mode. The legal share-out can freeze access for months.",
    theftNotes:
      "Their key alone can't spend. A robbery at home while you're both present can compromise two keys at once — keep one of the three keys off-site.",
  },

  // ============================================================
  // Anti-patterns — entries that exist primarily to tell people
  // *not* to do this. Each is something a real person has tried,
  // and each is a search query we want to own the canonical "no,
  // here's why" answer to.
  // ============================================================
  {
    slug: "tattoo-mnemonic",
    name: "Tattoo the seed phrase on your body",
    category: "body",
    isAntiPattern: true,
    antiPatternWhy: "Permanent in all the wrong senses, exposed in all the wrong situations.",
    tagline:
      "The classic 'clever' answer to seed storage. It fails for a long list of mundane physical reasons before you even get to the threat model.",
    pros: ["Hard to misplace", "Always with you", "Sounds cinematic"],
    cons: [
      "Skin discolors, scars, and stretches — words become unreadable over years",
      "Tattoo artists routinely misspell long word lists; one wrong word and the seed is dead",
      "Anyone who sees you undressed has the seed (doctors, gym, pool, intimacy, morgue)",
      "Surreptitious photography in any of the above contexts is trivial",
      "Surgery, burns, accidents can obliterate part of the seed",
      "Hundreds of dollars and several hours of pain for a worse outcome than a $20 paper backup",
      "Cannot be rotated without more tattoos",
    ],
    bestFor: [],
    lossResistance: 1,
    theftResistance: 0,
    fire: 0,
    water: 2,
    access: "instant",
    costAnnualUsd: "$0 (after $200–$800 one-time)",
    priceAnnualUsd: { min: 0, max: 0 },
    recommendedFor: [],
    siting: "on-site",
    online: false,
    thirdParty: { type: "none", required: false },
    tamperEvidence: 0,
    tamperEvidenceNotes:
      "A photographed tattoo is indistinguishable from an unphotographed one. You have no way of knowing your seed has been copied.",
    coercionResistance: 0,
    coercionNotes:
      "The seed is on your skin during the coercion event. The attacker doesn't even need your cooperation — they need a phone camera.",
    legalNotes:
      "Some hospitals photograph patients for medical records; some morgues do. In both cases the photographs are accessible to staff and, eventually, to anyone who gains access to those records. Tattoos are not legally treated as private under most jurisdictions when visible.",
    notes:
      "If this idea is genuinely appealing, the underlying intent — 'a backup I cannot lose' — is solved better by a stamped steel plate plus a second copy off-site. Total cost: under $100. Total exposure: zero.",
    lossNotes:
      "Skin is not a permanent medium. The seed begins degrading the moment it heals; ten years out it's typically partially unreadable.",
    theftNotes:
      "Effectively a public broadcast. Anyone with line of sight or a phone camera, ever, has the seed.",
  },
  {
    slug: "brain-wallet-only",
    name: "Memorise the seed phrase only",
    category: "body",
    isAntiPattern: true,
    antiPatternWhy: "Human memory is the least reliable storage device ever invented.",
    tagline:
      "The 'I'll just remember it' approach. The seductive logic: if it's only in my head, no one can steal it. The actual outcome: you forget it.",
    pros: ["No physical artefact to lose or be found", "Truly secret while you remember it"],
    cons: [
      "You will forget some part of it; the only question is when",
      "Stress, illness, head injury, dementia, and ordinary ageing all degrade recall",
      "No way to test recovery without the risk of locking yourself out",
      "If you're coerced, the seed comes out anyway — secrecy in your head provides no protection",
      "Heirs inherit nothing — the seed dies with you",
      "Documented as the cause of permanent loss in the Stefan Thomas case and many others",
    ],
    bestFor: [],
    lossResistance: 0,
    theftResistance: 3,
    fire: 3,
    water: 3,
    access: "instant",
    costAnnualUsd: "$0",
    priceAnnualUsd: { min: 0, max: 0 },
    recommendedFor: [],
    siting: "on-site",
    online: false,
    thirdParty: { type: "none", required: false },
    tamperEvidence: 0,
    tamperEvidenceNotes:
      "A memory you've shared under coercion, or forgotten, gives no signal. You may not even realise something is wrong until you try to recover.",
    coercionResistance: 0,
    coercionNotes:
      "The canonical $5 wrench attack. The seed is in your head; you will produce it under sufficient duress. There is no defence — only the partial relief that the attacker has to physically reach you.",
    legalNotes:
      "No legal mechanism exists to recover funds whose seed lives only in a deceased person's mind. Heirs lose everything.",
    notes:
      "Memorisation is a fine *supplement* to a written backup — it lets you spot-check that the backup matches what you remember. As the *only* backup, it is functionally identical to throwing the coins away on a delayed timer.",
    lossNotes:
      "The most common cause of permanent self-custody loss in the cases this site documents. See: stefan-thomas-ironkey.",
    theftNotes:
      "Excellent against passive theft. Useless against a $5 wrench. The privacy benefit is real but doesn't compensate for the loss-of-access guarantee.",
  },
  {
    slug: "hidden-in-book",
    name: "Hollowed-out book on a shelf",
    category: "home",
    isAntiPattern: true,
    antiPatternWhy: "Burglars do not skip the bookshelf.",
    tagline:
      "The hiding spot every burglar has known about since the 1950s. Plus a long list of accidental disposal modes.",
    pros: ["Free", "Looks normal", "Easy to set up"],
    cons: [
      "Books get donated, lent, sold, or thrown out during moves and de-cluttering",
      "Spouse or family member may pick up the book without knowing",
      "Children discover everything eventually",
      "House fire destroys it as completely as paper",
      "Burglars trained to look for it",
      "No tamper signal — someone can copy it and replace it indistinguishably",
    ],
    bestFor: [],
    lossResistance: 1,
    theftResistance: 1,
    fire: 0,
    water: 0,
    access: "instant",
    costAnnualUsd: "$0",
    priceAnnualUsd: { min: 0, max: 0 },
    recommendedFor: [],
    siting: "on-site",
    online: false,
    thirdParty: { type: "none", required: false },
    tamperEvidence: 0,
    coercionResistance: 1,
    coercionNotes:
      "An attacker who knows you have crypto and is willing to search will find a book hiding spot. Concealment buys time, not protection.",
    legalNotes: "No specific legal exposure beyond ordinary household risks.",
    notes:
      "Hiding works against a low-effort opportunist for a while. It does not work against a determined search, against time, or against your own life — moving house, de-cluttering, dying — all of which are guaranteed to happen eventually.",
    lossNotes:
      "The non-theft loss modes (donation, accidental disposal, fire, kids) account for the majority of how this fails in practice.",
    theftNotes: "Anyone who's read a heist novel or watched a procedural knows to check the shelf.",
  },
  {
    slug: "sticky-note-monitor",
    name: "Sticky note on / under the monitor or keyboard",
    category: "home",
    isAntiPattern: true,
    antiPatternWhy: "The literal meme. Don't.",
    tagline:
      "The canonical example of 'I'll just put it here for a second.' That second becomes years.",
    pros: ["Trivial to set up"],
    cons: [
      "Everyone who's ever been in your home, office, or video call has seen it",
      "Cleaners, IT, repair technicians, in-laws, kids all touch the space",
      "A single photograph on social media in the background and it's compromised",
      "Video calls — every meeting, every Zoom, every shared screen",
      "Cleaning staff routinely discard sticky notes thinking they're trash",
      "Spouse may toss it during cleaning",
    ],
    bestFor: [],
    lossResistance: 0,
    theftResistance: 0,
    fire: 0,
    water: 0,
    access: "instant",
    costAnnualUsd: "$0",
    priceAnnualUsd: { min: 0, max: 0 },
    recommendedFor: [],
    siting: "on-site",
    online: false,
    thirdParty: { type: "none", required: false },
    tamperEvidence: 0,
    coercionResistance: 0,
    coercionNotes:
      "Visible to anyone in the room before any coercion is even attempted. There is no scenario where this provides resistance.",
    legalNotes: "No specific legal exposure. Practical exposure is total.",
    notes:
      "If you've written your seed on a sticky note, *go restore the wallet to a new seed today*. Assume the current one is compromised. The bar is that low.",
    lossNotes: "Discarded as trash by anyone tidying the space.",
    theftNotes: "Visible to anyone within line of sight of the desk, ever.",
  },
  {
    slug: "email-yourself",
    name: "Email the seed to yourself",
    category: "digital",
    isAntiPattern: true,
    antiPatternWhy: "Your inbox is owned by Google (or Microsoft, or Apple). So now is your seed.",
    tagline:
      "Self-explanatory in the worst way. Once it's in your inbox, it's been backed up, scanned, indexed, and is now subject to the email provider's account-security model.",
    pros: ["Available from any device"],
    cons: [
      "Email providers keep server-side copies indefinitely",
      "Provider-side AI scans your email for ads / spam / 'smart features'",
      "Compromised email account = compromised wallet (and email is the most-attacked account class on the internet)",
      "Subject to subpoena, government access, and provider account closure",
      "Phishing against your email is trivial; once they're in, the seed is searchable",
      "Forwarded, replied to, or auto-saved into drafts — copies proliferate",
    ],
    bestFor: [],
    lossResistance: 2,
    theftResistance: 0,
    fire: 3,
    water: 3,
    access: "instant",
    costAnnualUsd: "$0",
    priceAnnualUsd: { min: 0, max: 0 },
    recommendedFor: [],
    siting: "off-site",
    online: true,
    thirdParty: {
      type: "cloud-provider",
      required: true,
      notes:
        "The email provider holds the bytes, period. Your encryption isn't part of this setup.",
    },
    tamperEvidence: 0,
    tamperEvidenceNotes:
      "Email providers don't notify you when your messages are read by their systems or by third parties with access. By the time you find out, the seed has been compromised for an unknowable period.",
    coercionResistance: 0,
    coercionNotes:
      "Phone or laptop unlock under duress, log in to email, search for 'seed phrase' — that's the entire attack. No structural friction at any step.",
    legalNotes:
      "Stored email is broadly accessible under various legal frameworks (US: ECPA / Stored Communications Act, etc.) and providers comply with subpoenas. Account closure by the provider is usually unappealable.",
    notes:
      "The Ledger 2020 phishing wave proves the point: an attacker who controls or compromises your email controls everything keyed off it. Don't make the seed one of those things.",
    lossNotes:
      "The seed survives device loss because the provider holds it — which is also exactly why it's a theft disaster.",
    theftNotes:
      "The threat surface is global: anyone who phishes you, subpoenas the provider, or breaches the provider, has the seed.",
  },
  {
    slug: "social-media-photo",
    name: "Photo of the seed on your phone",
    category: "digital",
    isAntiPattern: true,
    antiPatternWhy:
      "The moment you take the photo, it's already backed up to a cloud you don't control.",
    tagline:
      "A surprising number of people photograph the seed 'just temporarily' to type it later. There is no temporary.",
    pros: ["Quick", "Always with you"],
    cons: [
      "Phones auto-upload to iCloud, Google Photos, Microsoft OneDrive, etc.",
      "Cloud photo services run server-side OCR — your seed is now searchable text in a database you don't own",
      "Shared albums, family-sharing, AirDrop, accidental posts — copies proliferate trivially",
      "Background of an unrelated photo or screenshot reveals it",
      "Stolen phone, even briefly unlocked, exposes everything",
      "Provider account compromise (very common) compromises every photo ever taken",
    ],
    bestFor: [],
    lossResistance: 1,
    theftResistance: 0,
    fire: 3,
    water: 3,
    access: "instant",
    costAnnualUsd: "$0",
    priceAnnualUsd: { min: 0, max: 0 },
    recommendedFor: [],
    siting: "off-site",
    online: true,
    thirdParty: {
      type: "cloud-provider",
      required: true,
      notes:
        "Apple, Google, or Microsoft now physically holds your seed image, indexed and searchable.",
    },
    tamperEvidence: 0,
    coercionResistance: 0,
    coercionNotes:
      "Unlock the phone, open the gallery. Cloud OCR makes the seed searchable. There is no coercion defence at any layer.",
    legalNotes:
      "Photo services apply the same legal frameworks as email: broad provider access, subpoena exposure, unappealable account closure. OCR-extracted text from photos is treated identically to typed content in most providers' terms.",
    notes:
      "Same fix as the email case: assume the seed is compromised, move to a new wallet, and use a stamped steel plate going forward. The 'just temporarily' photograph is the most common form this anti-pattern takes.",
    lossNotes:
      "Cloud sync keeps the seed alive longer than the phone does — which sounds good until you read the next field.",
    theftNotes:
      "OCR + cloud breach is the dominant theft mode. Several major leaks (iCloud 2014 onward) have included photos that turned out to contain credentials, recovery codes, and seed phrases.",
  },
];
