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
  | "office";

export type Resistance = 0 | 1 | 2 | 3; // 0 = none, 3 = excellent
export type LossResistance = Resistance;
export type TheftResistance = Resistance;
export type Access = "instant" | "hours" | "days" | "weeks";

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
  costAnnualUsd: string;
  recommendedFor: ("modest" | "significant" | "life-defining")[];
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
    label: "Theft & coercion resistance",
    short: "Theft",
    explain:
      "How well the location protects against an adversary reaching the backup — burglary, opportunistic discovery, an indiscreet third party, coercion against you or the custodian.",
    color: "var(--warn)",
  },
} as const;

export const resistanceLabel = (r: Resistance) => ["None", "Weak", "Decent", "Strong"][r];

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
    recommendedFor: ["modest", "significant", "life-defining"],
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
    recommendedFor: ["modest", "significant", "life-defining"],
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
    recommendedFor: ["modest", "significant"],
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
    recommendedFor: ["significant", "life-defining"],
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
    recommendedFor: ["significant", "life-defining"],
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
    recommendedFor: ["life-defining"],
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
    recommendedFor: ["life-defining"],
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
    recommendedFor: [],
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
    recommendedFor: ["modest", "significant"],
    lossNotes:
      "Friends move, fall out of touch, change phones. Schedule annual contact specifically to confirm the envelope.",
    theftNotes:
      "Their household security becomes yours. Sealed package required; opened = compromised.",
  },
  {
    slug: "self-storage",
    name: "Self-storage unit",
    category: "commercial",
    tagline: "Cheap, anonymous, mediocre. Adequate as a tertiary backup.",
    pros: ["Cheap", "Independent of your home", "Anonymous to anyone who knows you"],
    cons: ["Variable security", "Climate not always controlled", "Auctioned if you stop paying"],
    bestFor: ["tertiary"],
    lossResistance: 1,
    theftResistance: 1,
    fire: 1,
    water: 1,
    access: "hours",
    costAnnualUsd: "$300 – $1,200 / yr",
    recommendedFor: ["significant"],
    notes: "Choose a facility with electronic logs, individual alarms, and climate control.",
    lossNotes:
      "Miss a payment → the unit is auctioned and your backup with it. Set autopay and a dead-man review.",
    theftNotes:
      "Cut-the-lock burglaries are routine; facility staff have master access. Choose carefully.",
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
    recommendedFor: ["significant", "life-defining"],
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
    recommendedFor: ["life-defining"],
    notes: "Only meaningful inside a multisig setup; pointless for single-sig.",
    lossNotes:
      "The trustee can fold or be acquired. The multisig means it's not catastrophic — you still have other keys.",
    theftNotes:
      "Their key alone can't move funds. Even a full compromise of the trustee is not catastrophic.",
  },
  {
    slug: "encrypted-cloud",
    name: "Self-hosted encrypted cloud copy",
    category: "commercial",
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
    recommendedFor: ["significant", "life-defining"],
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
    recommendedFor: [],
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
    recommendedFor: ["significant", "life-defining"],
    notes:
      "Only inside a multisig. Never give a spouse the entire single-sig seed for 'safety' — it doesn't add safety, it doubles attack surface.",
    lossNotes:
      "Divorce or estrangement is the practical loss mode. The legal share-out can freeze access for months.",
    theftNotes:
      "Their key alone can't spend. A robbery at home while you're both present can compromise two keys at once — keep one of the three keys off-site.",
  },
];
