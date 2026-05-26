/**
 * Curated grouping of the visualisations on /brand into pedagogical topics.
 *
 * Each concept points to a viz anchor on /brand. As articles fill in, these
 * can be re-pointed at deeper explainer pages.
 */

export interface Concept {
  num: string;
  title: string;
  sub: string;
  anchor: string; // /brand#anchor
}

export interface Topic {
  id: string;
  num: string;
  title: string;
  sub: string;
  concepts: Concept[];
}

export const topics: Topic[] = [
  {
    id: "foundations",
    num: "01",
    title: "Foundations",
    sub: "The bedrock — what the seed actually is, why entropy is unfathomable, and where each storage choice sits on the cold↔hot spectrum.",
    concepts: [
      { num: "01", title: "The seed phrase",        sub: "Twenty-four words, BIP-39. The wallet is the words; the device is just an interface.",          anchor: "visuals" },
      { num: "02", title: "Entropy lattice",        sub: "Each cell is one of 256 bits. The keyspace is larger than the count of atoms in the observable universe.", anchor: "entropy-lattice" },
      { num: "05", title: "Custody spectrum",       sub: "Steel → multisig → hardware → mobile → exchange. Each station is a different trade-off between speed and sovereignty.", anchor: "custody-spectrum" },
      { num: "11", title: "Cold-section",           sub: "A geological cross-section of a complete custody stack. Online surface shrinks with depth.",      anchor: "visuals" },
      { num: "50", title: "BIP-39 wordlist",        sub: "The 2,048-word wordlist that every BIP-39 phrase is drawn from. Same wordlist across every vendor.", anchor: "visuals" },
    ],
  },
  {
    id: "threats",
    num: "02",
    title: "Threats",
    sub: "What actually goes wrong. Sorted from least to most adversarial — couch cushion to coercion.",
    concepts: [
      { num: "04", title: "Threat ring",            sub: "Fire, water, hammer, time — four threats orbiting a steel plate. The plate beats all four.",       anchor: "visuals" },
      { num: "10", title: "Coercion ladder",        sub: "Five tiers from 'lost in the couch' to 'the $5 wrench'. Each rung has its own defense.",          anchor: "visuals" },
      { num: "23", title: "Address verification",   sub: "The host can lie about an address. The hardware screen cannot. Always verify on the device.",       anchor: "verify" },
      { num: "27", title: "Address poisoning",      sub: "Vanity-grinded lookalikes share your address's truncated display. Two real, valid examples.",     anchor: "poison" },
      { num: "24", title: "Tamper-evident",         sub: "A sealed box, a torn seal. Supply-chain integrity in one image.",                                  anchor: "tamper" },
    ],
  },
  {
    id: "strategy",
    num: "03",
    title: "Strategy",
    sub: "How to combine the primitives — multisig, Shamir, BIP-85, passphrases — into a setup that fits your life.",
    concepts: [
      { num: "03", title: "Multisig constellation", sub: "2-of-3, gracefully. Watch how losing a key changes the math.",                                     anchor: "multisig" },
      { num: "14", title: "Shamir / SSKR",          sub: "The seed split into N shares with threshold M. Different from multisig — splits the data, not the signing.", anchor: "shamir" },
      { num: "15", title: "BIP-85",                 sub: "One master seed, infinite deterministic children. Back up once; recover everything.",              anchor: "bip85" },
      { num: "16", title: "Passphrase tree",        sub: "Same 24 words + different passphrases = different wallets. The basis for plausible deniability.",   anchor: "ptree" },
      { num: "20", title: "Duress PIN",             sub: "Two PINs, two wallets. The decoy gives the attacker pocket change.",                              anchor: "duress" },
    ],
  },
  {
    id: "operations",
    num: "04",
    title: "Operations",
    sub: "What you actually do, on a calendar. Rehearsal, inheritance, the boring rituals that keep funds reachable.",
    concepts: [
      { num: "17", title: "Recovery rehearsal",     sub: "The ten-minute drill that proves a backup is still real. Annual, ideally.",                       anchor: "rehearsal" },
      { num: "08", title: "Atrophy gauge",          sub: "The probability you forget your setup over 20 years, as a function of rehearsals per year.",      anchor: "atrophy" },
      { num: "09", title: "Inheritance routing",    sub: "Three secrets, three heirs. Distribute well or fail closed.",                                     anchor: "heir-flow" },
      { num: "25", title: "Dead man's switch",      sub: "A keep-alive timer with a known endpoint. Silence triggers the inheritance ceremony.",            anchor: "dms" },
      { num: "30", title: "Coin control",           sub: "Pick which UTXOs to spend. Defaults link your history; coin control keeps it separate.",          anchor: "utxo" },
      { num: "28", title: "Watch-only wallet",      sub: "An xpub for the online side, the xprv airgapped. See balances without spending power.",          anchor: "psbt" },
    ],
  },
  {
    id: "hardware",
    num: "05",
    title: "Hardware",
    sub: "What's inside a hardware wallet, and the PIN policies that determine how it fails under pressure.",
    concepts: [
      { num: "22", title: "HW anatomy",             sub: "Secure element, MCU, screen, buttons, USB. Each part has one job.",                                anchor: "anatomy" },
      { num: "19", title: "Exponential backoff",    sub: "Every wrong PIN doubles the wait. By the thirtieth attempt, the wait is a human lifetime.",       anchor: "backoff" },
      { num: "21", title: "PIN entropy",            sub: "4-digit vs 6-digit vs 8-char vs 12-word. Keyspace grows; backoff makes even short PINs survive.",  anchor: "visuals" },
      { num: "47", title: "Wallet attestation",     sub: "The device signs a challenge with its factory key. Supply-chain clones can't produce the signature.", anchor: "attest" },
    ],
  },
  {
    id: "resilience",
    num: "06",
    title: "Resilience",
    sub: "What survives time, distance, and the very long tail of things that can go wrong.",
    concepts: [
      { num: "07", title: "Half-life chart",        sub: "Six storage media against the decades they last. Steel wins; cloud accounts rarely make a decade.", anchor: "halflife" },
      { num: "13", title: "Geolocation",            sub: "Three backup pins, one blast radius. Geographic separation is risk diversification.",              anchor: "geoloc" },
      { num: "18", title: "Location SPOF",          sub: "Three backups at one place is one backup. Tap to see which locations are single points of failure.", anchor: "spof" },
      { num: "26", title: "Time-lock",              sub: "BIP-65 CLTV — funds cannot move before a target block height. Disciplined HODL.",                  anchor: "timelock" },
      { num: "48", title: "Spending velocity",      sub: "A self-imposed daily cap. Compromised host can't sweep more than the limit.",                     anchor: "velocity" },
    ],
  },
  {
    id: "privacy",
    num: "07",
    title: "Privacy",
    sub: "What other people can see about your transactions, and the dials you can turn.",
    concepts: [
      { num: "31", title: "Address reuse",          sub: "Five payments to one address cluster into one identity. Five payments to five addresses don't.",   anchor: "reuse" },
      { num: "43", title: "CoinJoin",               sub: "N inputs in, N equal outputs out. The anonymity set is the number of participants.",              anchor: "coinjoin" },
      { num: "44", title: "Privacy layers",         sub: "ISP → VPN → Tor → your own node. Each layer trades convenience for blindness.",                    anchor: "privlayer" },
      { num: "49", title: "Receive privacy",        sub: "A fresh address per invoice keeps the chain-analysis surface minimal.",                            anchor: "visuals" },
    ],
  },
  {
    id: "protocol",
    num: "08",
    title: "Protocol",
    sub: "The mechanics underneath. The bits and pieces of Bitcoin that the rest of self-custody is built on.",
    concepts: [
      { num: "32", title: "Schnorr vs ECDSA",       sub: "64 bytes, fixed. Smaller, deterministic, linearly aggregable — the cryptography under Taproot.", anchor: "visuals" },
      { num: "33", title: "Taproot · P2TR",         sub: "bc1p, not bc1q. Same single-sig spend can hide arbitrary scripts.",                             anchor: "visuals" },
      { num: "34", title: "CSV vs CLTV",            sub: "Two kinds of patience. Absolute lock to a block height vs relative lock to confirmation count.", anchor: "visuals" },
      { num: "29", title: "PSBT",                   sub: "BIP-174. The protocol that makes air-gapped signing possible.",                                  anchor: "psbt" },
      { num: "35", title: "RBF",                    sub: "Replace-by-fee. Bump a stuck transaction to jump the queue.",                                    anchor: "rbf" },
      { num: "36", title: "Mempool fee market",     sub: "An auction, every block. Miners pick the most profitable.",                                       anchor: "memp" },
      { num: "37", title: "Proof of reserves",      sub: "A Merkle tree commits to every customer balance under one root.",                                 anchor: "por" },
      { num: "42", title: "Halving cadence",        sub: "Every 210,000 blocks the reward halves. Programmed supply shock.",                               anchor: "visuals" },
      { num: "45", title: "Block reorg",            sub: "Two chains, briefly. The longer wins; orphaned tx return to the mempool.",                       anchor: "visuals" },
      { num: "46", title: "Anti-fee-sniping",       sub: "nLocktime = current height removes the incentive to re-mine the recent past.",                  anchor: "visuals" },
    ],
  },
  {
    id: "trust",
    num: "09",
    title: "Trust",
    sub: "Why some things are believable. Reproducible builds, lost coins, custodian failures — the receipts.",
    concepts: [
      { num: "38", title: "Custodian failures",     sub: "A non-exhaustive history. Insolvency, hack, fraud, fiat.",                                       anchor: "visuals" },
      { num: "39", title: "Lost coins",             sub: "About 1 in 5 bitcoin are estimated permanently inaccessible. Most by lost keys.",                anchor: "visuals" },
      { num: "40", title: "Reproducible builds",    sub: "Five builders, one hash. Disagreement is the signal that catches supply-chain compromise.",     anchor: "repbuild" },
      { num: "41", title: "Border crossing",        sub: "Customs treats crypto as a monetary instrument in some places and as nothing in others.",        anchor: "visuals" },
    ],
  },
];
