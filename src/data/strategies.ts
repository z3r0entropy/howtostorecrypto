/**
 * Strategy recommendations as a function of:
 *   tier      — your technical comfort
 *   usage     — how you actually use the coins
 *   stakes    — what losing them would feel like
 *   adversary — who's likely to come after you
 *
 * The 2D `recommendation` table below is the *baseline* for (tier × stakes).
 * `recommend()` layers usage + adversary modifiers on top. Keeping the
 * baseline as data and the modifiers as code is a deliberate choice — a
 * 3×3×3×2 matrix would be 54 cells and miserable to keep coherent.
 */

export type Tier = "beginner" | "advanced" | "expert";
export type Stakes = "modest" | "significant" | "life-defining";
export type Usage = "active" | "balanced" | "hodl";
export type Adversary = "typical" | "targeted";

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

export const usageMeta: Record<Usage, { label: string; sub: string; hint: string }> = {
  active: {
    label: "Active",
    sub: "Trading or moving funds weekly or more.",
    hint: "You buy and sell often, watch markets, treat this partly as money you're working with — not money you're putting away.",
  },
  balanced: {
    label: "DCA / balanced",
    sub: "Small regular buys, otherwise leave it alone.",
    hint: "You add to a position over time, maybe rebalance occasionally, but you're not in and out daily.",
  },
  hodl: {
    label: "Long-term hold",
    sub: "Bought once (or rarely); planning years.",
    hint: "Set and forget. The point is that you *don't* touch it; the right setup optimises for inactivity, not convenience.",
  },
};

export const adversaryMeta: Record<Adversary, { label: string; sub: string; hint: string }> = {
  typical: {
    label: "Typical",
    sub: "No one's specifically targeting you.",
    hint: "You're a private individual; the realistic threats are mass phishing, an opportunistic burglary, a fire, a moving day. Most people are here.",
  },
  targeted: {
    label: "Targeted",
    sub: "You're a visible or specific target.",
    hint: "Work in crypto, post about holdings publicly, hold a profession that draws attention (executive, journalist, dissident), or just hold enough that someone might come looking. Setup tightens accordingly.",
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
  | "keep-on-exchange"
  | "hot-cold-split"
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
  "keep-on-exchange": {
    key: "keep-on-exchange",
    name: "Keep it on a regulated exchange",
    oneLiner:
      "The honest answer when you trade often, hold little, and aren't ready for self-custody yet.",
    components: [
      "A reputable, regulated exchange in your jurisdiction",
      "Long, unique password stored in a password manager",
      "Hardware-key 2FA (YubiKey or similar) — not SMS",
      "The same hardware-key 2FA on the email used for recovery",
      "Withdrawal address whitelisting where supported",
      "Only the balance you'd actually be okay losing — anything more, self-custody it",
    ],
    pros: [
      "Zero key management — nothing for you to forget or lose",
      "Instant access, suited to active trading",
      "Account recovery and 2FA reset paths exist",
      "Right tool for small balances and frequent buy/sell",
    ],
    cons: [
      "Counterparty risk — Mt. Gox, FTX, QuadrigaCX all began as 'reputable exchanges'",
      "Subject to exchange terms, withdrawal limits, account freezes",
      "Few jurisdictions protect crypto holders from exchange insolvency",
      "KYC / regulatory changes can lock you out without notice",
    ],
    approxCost: "Trading fees only (≈ 0.1–1% per trade)",
    approxSetup: "≈ 30 min including KYC and 2FA",
    survivability: "6 / 10",
    locationsNeeded: 0,
    lossDefense: 2,
    theftDefense: 2,
    lossNote:
      "Account recovery exists, but the exchange itself can fail, fold, or freeze you out. That's a category of loss self-custody removes.",
    theftNote:
      "Hardware 2FA + strong unique password is a real defense. The remaining risk is the exchange itself being compromised — out of your hands.",
  },
  "hot-cold-split": {
    key: "hot-cold-split",
    name: "Trading float on exchange + cold reserve",
    oneLiner: "The honest answer when you trade often but the bulk is too serious for an exchange.",
    components: [
      "A reputable exchange account for the trading float only",
      "Hardware 2FA on the exchange and its recovery email",
      "A clear maximum-float rule — anything over it gets moved to cold",
      "Stamped 316 stainless plates in two geographically separated locations for the cold reserve",
      "Sealed inheritance letter that covers the cold side (the exchange side dies with the account)",
    ],
    pros: [
      "You can actually trade without putting everything at risk",
      "Cold reserve survives an exchange failure",
      "Forces you to be deliberate about how much sits hot",
    ],
    cons: [
      "Two systems to maintain, two threat models to think about",
      "The float on the exchange has the same risks as full exchange custody — just for a smaller amount",
      "Easy to let the float creep up if you don't enforce the cap",
    ],
    approxCost: "$140 – $400 + exchange fees",
    approxSetup: "≈ 5 hours over a weekend",
    survivability: "8 / 10",
    locationsNeeded: 2,
    lossDefense: 3,
    theftDefense: 2,
    lossNote:
      "The cold reserve is two plates, two places — survives a house-loss event. The float on the exchange has exchange-failure risk for that portion only.",
    theftNote:
      "Bulk is single-sig steel — a thief who finds a plate has the cold side. Strong 2FA protects the float. Upgrade path is multisig if either side grows.",
  },
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

export type Recommendation = {
  primary: StrategyKey;
  alt?: StrategyKey;
  /** Plain-language notes on *why* — surfaced in the wizard alongside the cards. */
  notes?: string[];
};

// 2D baseline for (tier × stakes). Assumes usage=balanced, adversary=typical.
// `recommend()` below layers usage + adversary modifiers on top of this.
export const recommendation: Record<Tier, Record<Stakes, Recommendation>> = {
  beginner: {
    modest: { primary: "keep-on-exchange", alt: "hw-steel" },
    significant: { primary: "hw-steel-2loc", alt: "hw-steel" },
    "life-defining": { primary: "multisig-trustee", alt: "hw-steel-2loc" },
  },
  advanced: {
    modest: { primary: "hw-steel", alt: "keep-on-exchange" },
    significant: { primary: "hw-steel-2loc", alt: "hw-steel-passphrase" },
    "life-defining": { primary: "multisig-2of3", alt: "multisig-trustee" },
  },
  expert: {
    modest: { primary: "hw-steel-2loc", alt: "hw-steel-passphrase" },
    significant: { primary: "multisig-2of3", alt: "hw-steel-passphrase" },
    "life-defining": { primary: "multisig-shamir", alt: "multisig-2of3" },
  },
};

// One-step escalation for a targeted threat model. Each strategy points at
// "the next-stronger one" — multisig and Shamir variants are the ceiling.
const escalation: Partial<Record<StrategyKey, StrategyKey>> = {
  "keep-on-exchange": "hw-steel",
  "hot-cold-split": "multisig-2of3",
  "single-hw": "hw-steel",
  "hw-steel": "hw-steel-2loc",
  "hw-steel-2loc": "hw-steel-passphrase",
  "hw-steel-passphrase": "multisig-2of3",
  "multisig-2of3": "multisig-trustee",
  "multisig-trustee": "multisig-shamir",
  "multisig-shamir": "multisig-shamir", // ceiling
};

/**
 * Layered recommendation:
 *
 *   1. Start from the (tier × stakes) baseline.
 *   2. Apply the usage modifier — active trading needs liquidity; long hold
 *      doesn't need an exchange.
 *   3. Apply the adversary modifier — a targeted threat model bumps the
 *      whole thing one step up the escalation chain.
 */
export function recommend(
  tier: Tier,
  stakes: Stakes,
  usage: Usage,
  adversary: Adversary,
): Recommendation {
  let { primary, alt } = recommendation[tier][stakes];
  const notes: string[] = [];

  // ---- Usage modifier ------------------------------------------------------
  if (usage === "active") {
    if (stakes === "modest") {
      // Modest + active: exchange is the honest answer. Keep baseline if
      // it's already exchange; otherwise demote cold to alt.
      if (primary !== "keep-on-exchange") {
        alt = primary;
        primary = "keep-on-exchange";
      }
      notes.push(
        "You trade often and the stakes are modest — exchange custody with hardware 2FA is the honest answer here.",
      );
    } else {
      // Significant / life-defining + active: hot/cold split. Trade with a
      // float, keep the bulk cold.
      if (primary !== "hot-cold-split") {
        alt = primary;
        primary = "hot-cold-split";
      }
      notes.push(
        "Active trading at this scale calls for a hot/cold split: a small float on the exchange for liquidity, the bulk in cold storage.",
      );
    }
  } else if (usage === "hodl") {
    // Long hold removes the case for exchange custody.
    if (primary === "keep-on-exchange") {
      primary = alt && alt !== "keep-on-exchange" ? alt : "hw-steel";
      alt = "keep-on-exchange";
      notes.push(
        "Long-term hold removes the trading-convenience argument for an exchange — cold storage becomes the right default.",
      );
    }
  }
  // usage === "balanced" → use the baseline as-is

  // ---- Adversary modifier --------------------------------------------------
  if (adversary === "targeted") {
    const escalated = escalation[primary];
    if (escalated && escalated !== primary) {
      alt = primary;
      primary = escalated;
      notes.push(
        "A targeted threat model means a single key compromise can't be the end of the story — escalated one step toward distributed signing.",
      );
    }
  }

  return { primary, alt, notes };
}

export const reminderCadence = {
  modest: { test: "annually", review: "every 2 years" },
  significant: { test: "annually", review: "annually" },
  "life-defining": { test: "every 6 months", review: "annually" },
} as const;
