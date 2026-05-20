/**
 * Strategy recommendations as a function of technical level × stakes.
 * Each recommendation describes the *whole* setup, not just one backup medium.
 */

export type Tier = "beginner" | "advanced" | "expert";
export type Stakes = "modest" | "significant" | "life-defining";

export const tierMeta: Record<Tier, { label: string; sub: string; hint: string }> = {
  beginner: {
    label: "Beginner",
    sub: "First time setting this up.",
    hint: "You've used an exchange but haven't moved coins to self-custody, or you've moved them but never thought hard about the backup.",
  },
  advanced: {
    label: "Advanced",
    sub: "Comfortable with the basics.",
    hint: "Hardware wallet, seed written down, a sense that there are more steps but you haven't taken them yet.",
  },
  expert: {
    label: "Expert",
    sub: "Practiced, want best practice.",
    hint: "You know what a passphrase is, you've heard of multisig, you'd consider Shamir. You want the principled setup.",
  },
};

export const stakesMeta: Record<
  Stakes,
  { label: string; sub: string; range: string; hint: string }
> = {
  modest: {
    label: "Modest",
    sub: "You'd be annoyed, not destroyed.",
    range: "Under ≈ $5,000",
    hint: "Losing it would sting for a week. You'd move on.",
  },
  significant: {
    label: "Significant",
    sub: "You'd really feel the loss.",
    range: "≈ $5,000 – $250,000",
    hint: "Months of saving, vacation cancelled, a real and lasting bad day.",
  },
  "life-defining": {
    label: "Life-defining",
    sub: "Losing it would change your trajectory.",
    range: "≈ $250,000 +",
    hint: "House money. Retirement money. Generational money. The setup matches.",
  },
};

export type StrategyKey =
  | "single-hw"
  | "hw-steel"
  | "hw-steel-2loc"
  | "hw-steel-passphrase"
  | "multisig-2of3"
  | "multisig-shamir"
  | "multisig-trustee";

export type Strategy = {
  key: StrategyKey;
  name: string;
  oneLiner: string;
  components: string[];
  pros: string[];
  cons: string[];
  approxCost: string;
  approxSetup: string;
  survivability: string;
  locationsNeeded: number;
  /**
   * What each strategy actually defends against, on the two axes.
   * Each rating: 1 = weak, 2 = decent, 3 = strong.
   */
  lossDefense: 1 | 2 | 3;
  theftDefense: 1 | 2 | 3;
  lossNote: string;
  theftNote: string;
};

export const strategies: Record<StrategyKey, Strategy> = {
  "single-hw": {
    key: "single-hw",
    name: "Hardware wallet + paper backup",
    oneLiner: "The bare minimum. Better than nothing; not by much.",
    components: [
      "One hardware wallet",
      "One handwritten paper backup, sealed",
      "One location (the safest spot you have)",
    ],
    pros: ["Easy", "Cheap", "Better than custodial"],
    cons: ["Single point of failure", "Paper degrades and burns", "No inheritance plan"],
    approxCost: "$70 – $120",
    approxSetup: "1 hour",
    survivability: "4 / 10",
    locationsNeeded: 1,
    lossDefense: 1,
    theftDefense: 1,
    lossNote: "One paper copy in one place — fire, flood, or misplacement is total loss.",
    theftNote: "Single-sig: anyone who finds the paper has everything.",
  },
  "hw-steel": {
    key: "hw-steel",
    name: "Hardware wallet + steel plate (single location)",
    oneLiner: "Survives the small disasters. Vulnerable to the big ones.",
    components: ["One hardware wallet", "One stamped 316 stainless plate", "One location"],
    pros: ["Survives fire and water", "Cheap", "Simple"],
    cons: ["One location → one bad event away from gone", "No inheritance plan"],
    approxCost: "$120 – $200",
    approxSetup: "2 hours",
    survivability: "6 / 10",
    locationsNeeded: 1,
    lossDefense: 2,
    theftDefense: 1,
    lossNote: "Steel survives the disasters, but one location is still one event away.",
    theftNote: "Single-sig: anyone who finds the plate has everything.",
  },
  "hw-steel-2loc": {
    key: "hw-steel-2loc",
    name: "Hardware wallet + two steel plates, two locations",
    oneLiner: "The conservative default. The first setup that's actually serious.",
    components: [
      "One hardware wallet",
      "Two stamped 316 stainless plates",
      "Two geographically separated locations",
      "Sealed inheritance letter",
    ],
    pros: [
      "Survives most realistic disasters",
      "Inheritance covered",
      "Cheap relative to what it protects",
    ],
    cons: ["Single-signature — a thief who finds a plate has everything"],
    approxCost: "$140 – $400",
    approxSetup: "4 hours over a weekend",
    survivability: "8 / 10",
    locationsNeeded: 2,
    lossDefense: 3,
    theftDefense: 1,
    lossNote: "Two metal plates in two places. Survives a house-loss event.",
    theftNote: "Still single-sig — a thief who finds one plate has the whole wallet.",
  },
  "hw-steel-passphrase": {
    key: "hw-steel-passphrase",
    name: "Hardware wallet + steel × 2 + BIP-39 passphrase",
    oneLiner: "Same as the conservative default, but a thief with the plate still can't spend.",
    components: [
      "One hardware wallet",
      "Two stamped 316 stainless plates",
      "Two locations",
      "Separate plan for the 25th-word passphrase",
      "Sealed inheritance letter that covers both",
    ],
    pros: ["Plate-find no longer means total loss", "Plausible deniability if coerced"],
    cons: [
      "Two secrets, two storage plans",
      "Inheritance gets more complex",
      "Forgetting the passphrase is exactly as bad as losing the seed",
    ],
    approxCost: "$140 – $400",
    approxSetup: "6 hours, with rehearsal",
    survivability: "9 / 10",
    locationsNeeded: 2,
    lossDefense: 3,
    theftDefense: 3,
    lossNote:
      "Steel x 2 covers loss. Passphrase adds a new failure mode if forgotten — store it as carefully as the seed.",
    theftNote:
      "A found plate is useless without the passphrase. Strong defense against opportunistic theft and coercion.",
  },
  "multisig-2of3": {
    key: "multisig-2of3",
    name: "Multisig 2-of-3, three locations",
    oneLiner: "Removes the single point of failure by construction.",
    components: [
      "Three hardware wallets (different vendors recommended)",
      "Three steel plates, one per key",
      "Three geographically separated locations",
      "Wallet coordinator software (Sparrow, Specter, etc.)",
      "Sealed inheritance letter with restore procedure",
    ],
    pros: [
      "Lose any one key — still recover",
      "Compromise any one key — still safe",
      "Survives coercion, theft, single mistakes",
    ],
    cons: [
      "Higher initial complexity",
      "Annual rehearsal is non-optional",
      "Coordinator software adds a learning curve",
    ],
    approxCost: "$400 – $800",
    approxSetup: "A focused weekend",
    survivability: "10 / 10",
    locationsNeeded: 3,
    lossDefense: 3,
    theftDefense: 3,
    lossNote:
      "Lose any one of three keys — still recover. Geographic separation removes single-event loss.",
    theftNote:
      "Compromise of any one key is not enough to spend. Resists theft, coercion, and supply-chain compromise.",
  },
  "multisig-shamir": {
    key: "multisig-shamir",
    name: "Multisig 2-of-3 + Shamir on the recovery materials",
    oneLiner: "Multisig for spend protection; Shamir for the disaster-recovery seeds.",
    components: [
      "Three hardware wallets",
      "Three steel plates for the active multisig keys",
      "SLIP-39 shares (3-of-5) for the multisig recovery materials, distributed to trusted parties",
      "Coordinator setup documented in the sealed letter",
    ],
    pros: [
      "Multisig protects against single key loss",
      "Shamir distributes recovery without giving anyone a usable key",
      "Inheritance flows through Shamir thresholds",
    ],
    cons: [
      "Most complex setup on this site",
      "Requires actual trusted parties for share custody",
      "Annual rehearsal across multiple people",
    ],
    approxCost: "$600 – $1,200",
    approxSetup: "Two weekends",
    survivability: "10 / 10",
    locationsNeeded: 5,
    lossDefense: 3,
    theftDefense: 3,
    lossNote:
      "Multisig handles spend protection; Shamir distributes recovery materials so loss is never catastrophic.",
    theftNote:
      "Multiple layers — compromising one share or one multisig key still doesn't yield a spendable wallet.",
  },
  "multisig-trustee": {
    key: "multisig-trustee",
    name: "Multisig 2-of-3 with a professional trustee key",
    oneLiner:
      "One key held by a regulated trustee. Heir-initiated recovery without ever exposing a phrase.",
    components: [
      "Two personal hardware wallets, two of your own locations",
      "One key held by a professional collaborative-custody trustee",
      "Trust or will document referencing the trustee",
      "Heir contact procedure documented and rehearsed",
    ],
    pros: [
      "No single party can ever spend alone",
      "Heir-initiated recovery without your involvement",
      "Independent of your physical presence or memory",
    ],
    cons: [
      "Annual fee (typically $200–$500)",
      "You re-introduce a counterparty (a constrained one)",
      "Requires choosing a trustee thoughtfully",
    ],
    approxCost: "$500 + $200–$500 / yr",
    approxSetup: "Two weekends + onboarding",
    survivability: "10 / 10",
    locationsNeeded: 3,
    lossDefense: 3,
    theftDefense: 3,
    lossNote: "Heir-initiated recovery survives your death without you ever sharing a phrase.",
    theftNote:
      "Trustee key alone can't spend. Even full trustee compromise leaves your two personal keys in control.",
  },
};

// Recommendation matrix: tier × stakes → strategy key, with a fallback secondary.
export const recommendation: Record<
  Tier,
  Record<Stakes, { primary: StrategyKey; alt?: StrategyKey }>
> = {
  beginner: {
    modest: { primary: "hw-steel", alt: "single-hw" },
    significant: { primary: "hw-steel-2loc", alt: "hw-steel" },
    "life-defining": { primary: "multisig-trustee", alt: "hw-steel-2loc" },
  },
  advanced: {
    modest: { primary: "hw-steel", alt: "single-hw" },
    significant: { primary: "hw-steel-2loc", alt: "hw-steel-passphrase" },
    "life-defining": { primary: "multisig-2of3", alt: "multisig-trustee" },
  },
  expert: {
    modest: { primary: "hw-steel-2loc", alt: "hw-steel-passphrase" },
    significant: { primary: "multisig-2of3", alt: "hw-steel-passphrase" },
    "life-defining": { primary: "multisig-shamir", alt: "multisig-2of3" },
  },
};

export const reminderCadence = {
  modest: { test: "annually", review: "every 2 years" },
  significant: { test: "annually", review: "annually" },
  "life-defining": { test: "every 6 months", review: "annually" },
} as const;
