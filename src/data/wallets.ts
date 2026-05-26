/**
 * Wallet × feature matrix.
 *
 * Vendor-neutral, factual, and dated. Verify before relying on a specific
 * feature — vendors ship and remove things on every release. If you spot a
 * stale entry, please send a PR with a citation.
 *
 * Support levels:
 *   yes         — first-class, in the official client
 *   third-party — supported, but only via a separate companion app (eg. Sparrow + a HW)
 *   partial     — supported but with significant caveats noted
 *   no          — not supported
 *   n/a         — concept does not apply to this form factor
 *
 * Last reviewed: 2026-05-23
 */

export type Support = "yes" | "third-party" | "partial" | "no" | "n/a";

export type WalletForm = "hardware" | "software" | "service";

export interface Feature {
  id: string;
  name: string;
  short: string;
  desc: string;
  /** Anchor on /brand that visualises this concept. */
  vizAnchor?: string;
}

export interface Wallet {
  id: string;
  name: string;
  maker: string;
  form: WalletForm;
  /** "yes" / "partial" — for hardware: SE-having vs not. */
  features: Record<string, Support>;
  notes?: string;
}

export const features: Feature[] = [
  {
    id: "psbt",
    name: "PSBT",
    short: "PSBT",
    desc: "BIP-174 — partially signed BTC transactions. The protocol that lets an online wallet build a tx and an offline signer sign it.",
    vizAnchor: "psbt",
  },
  {
    id: "multisig",
    name: "Multisig",
    short: "Multisig",
    desc: "Native vault management — quorum-based spending across multiple keys. Cross-vendor multisig is a stronger guarantee than single-vendor.",
    vizAnchor: "multisig",
  },
  {
    id: "taproot",
    name: "Taproot",
    short: "Taproot",
    desc: "P2TR send/receive (BIP-341). Required for bech32m `bc1p…` addresses, key-path spends, and Schnorr signatures.",
    vizAnchor: "visuals",
  },
  {
    id: "airgap",
    name: "Air-gap",
    short: "Airgap",
    desc: "Operates without USB or Bluetooth — typically via SD card or animated QR codes. The device never touches a network.",
    vizAnchor: "psbt",
  },
  {
    id: "oss",
    name: "Open source",
    short: "OSS",
    desc: "Firmware and host app source code is public and auditable. Reproducible builds (where supported) close the supply-chain loop.",
    vizAnchor: "repbuild",
  },
  {
    id: "se",
    name: "Secure element",
    short: "SE",
    desc: "A dedicated tamper-resistant chip stores the seed. The seed never leaves the SE — even the device's MCU cannot read it.",
    vizAnchor: "anatomy",
  },
  {
    id: "passphrase",
    name: "Passphrase",
    short: "Passphrase",
    desc: "BIP-39 passphrase support — the 25th word. Same seed + different passphrase = different wallet; the basis for plausible-deniability vaults.",
    vizAnchor: "ptree",
  },
  {
    id: "shamir",
    name: "Shamir / SSKR",
    short: "Shamir",
    desc: "Splits the seed into N shares with threshold M. Different from multisig — splits the seed data itself, not the signing.",
    vizAnchor: "shamir",
  },
  {
    id: "duress",
    name: "Duress PIN",
    short: "Duress",
    desc: "A second PIN that opens a decoy wallet (or wipes the device). Defense against the bottom rung of the coercion ladder.",
    vizAnchor: "duress",
  },
  {
    id: "attestation",
    name: "Attestation",
    short: "Attestation",
    desc: "Device proves it is genuine via a manufacturer signature. Protects against supply-chain clones.",
    vizAnchor: "attest",
  },
  {
    id: "tor",
    name: "Tor",
    short: "Tor",
    desc: "Built-in Tor routing for all network calls. Prevents your ISP from seeing wallet activity and prevents servers from seeing your IP.",
    vizAnchor: "privlayer",
  },
  {
    id: "coinjoin",
    name: "CoinJoin",
    short: "CoinJoin",
    desc: "Built-in collaborative coin mixing. Breaks the on-chain link between sender and receiver via equal-output transactions.",
    vizAnchor: "coinjoin",
  },
];

export const wallets: Wallet[] = [
  // ============================================================
  //  HARDWARE — listed alphabetically by maker, then model
  // ============================================================
  {
    id: "bitbox02",
    name: "BitBox02",
    maker: "Shift Crypto",
    form: "hardware",
    features: {
      psbt: "yes", multisig: "yes", taproot: "yes",
      airgap: "no", oss: "yes", se: "yes",
      passphrase: "yes", shamir: "no", duress: "no",
      attestation: "yes", tor: "n/a", coinjoin: "n/a",
    },
    notes: "BTC-only edition is the security-focused build. USB-C only.",
  },
  {
    id: "coldcard-mk4",
    name: "Coldcard Mk4",
    maker: "Coinkite",
    form: "hardware",
    features: {
      psbt: "yes", multisig: "yes", taproot: "yes",
      airgap: "yes", oss: "yes", se: "yes",
      passphrase: "yes", shamir: "no", duress: "yes",
      attestation: "yes", tor: "n/a", coinjoin: "n/a",
    },
    notes: "Two SEs + air-gap via microSD/NFC. Brick PIN and duress PIN are first-class.",
  },
  {
    id: "coldcard-q",
    name: "Coldcard Q",
    maker: "Coinkite",
    form: "hardware",
    features: {
      psbt: "yes", multisig: "yes", taproot: "yes",
      airgap: "yes", oss: "yes", se: "yes",
      passphrase: "yes", shamir: "no", duress: "yes",
      attestation: "yes", tor: "n/a", coinjoin: "n/a",
    },
    notes: "Adds animated QR + keyboard to the Mk4 model. Air-gap is the default path.",
  },
  {
    id: "jade",
    name: "Jade",
    maker: "Blockstream",
    form: "hardware",
    features: {
      psbt: "yes", multisig: "yes", taproot: "yes",
      airgap: "yes", oss: "yes", se: "no",
      passphrase: "yes", shamir: "no", duress: "no",
      attestation: "partial", tor: "n/a", coinjoin: "n/a",
    },
    notes: "No secure element — uses an HSM/PIN-server model (the seed leaves the device encrypted to a remote oracle).",
  },
  {
    id: "keystone-3-pro",
    name: "Keystone 3 Pro",
    maker: "Keystone",
    form: "hardware",
    features: {
      psbt: "yes", multisig: "yes", taproot: "yes",
      airgap: "yes", oss: "partial", se: "yes",
      passphrase: "yes", shamir: "yes", duress: "yes",
      attestation: "yes", tor: "n/a", coinjoin: "n/a",
    },
    notes: "Three SEs, QR-only air-gap. Firmware partially open; some parts proprietary.",
  },
  {
    id: "ledger-nano-x",
    name: "Ledger Nano X",
    maker: "Ledger",
    form: "hardware",
    features: {
      psbt: "yes", multisig: "third-party", taproot: "yes",
      airgap: "no", oss: "partial", se: "yes",
      passphrase: "yes", shamir: "no", duress: "no",
      attestation: "yes", tor: "n/a", coinjoin: "n/a",
    },
    notes: "Multisig requires a companion app (Sparrow / Specter). SE firmware is closed source.",
  },
  {
    id: "ledger-stax",
    name: "Ledger Stax",
    maker: "Ledger",
    form: "hardware",
    features: {
      psbt: "yes", multisig: "third-party", taproot: "yes",
      airgap: "no", oss: "partial", se: "yes",
      passphrase: "yes", shamir: "no", duress: "no",
      attestation: "yes", tor: "n/a", coinjoin: "n/a",
    },
    notes: "Touchscreen flagship. Same security model as the Nano line.",
  },
  {
    id: "passport",
    name: "Passport",
    maker: "Foundation",
    form: "hardware",
    features: {
      psbt: "yes", multisig: "yes", taproot: "yes",
      airgap: "yes", oss: "yes", se: "yes",
      passphrase: "yes", shamir: "no", duress: "yes",
      attestation: "yes", tor: "n/a", coinjoin: "n/a",
    },
    notes: "QR + microSD air-gap, no USB data. Companion app Envoy.",
  },
  {
    id: "trezor-safe-5",
    name: "Trezor Safe 5",
    maker: "SatoshiLabs",
    form: "hardware",
    features: {
      psbt: "yes", multisig: "third-party", taproot: "yes",
      airgap: "no", oss: "yes", se: "yes",
      passphrase: "yes", shamir: "yes", duress: "no",
      attestation: "yes", tor: "n/a", coinjoin: "n/a",
    },
    notes: "Touchscreen + SE. Shamir (SLIP-39) is a Trezor original. No duress PIN.",
  },
  {
    id: "trezor-safe-3",
    name: "Trezor Safe 3",
    maker: "SatoshiLabs",
    form: "hardware",
    features: {
      psbt: "yes", multisig: "third-party", taproot: "yes",
      airgap: "no", oss: "yes", se: "yes",
      passphrase: "yes", shamir: "yes", duress: "no",
      attestation: "yes", tor: "n/a", coinjoin: "n/a",
    },
    notes: "Adds an SE to the original Trezor architecture. Buttons-only.",
  },
  {
    id: "trezor-model-t",
    name: "Trezor Model T",
    maker: "SatoshiLabs",
    form: "hardware",
    features: {
      psbt: "yes", multisig: "third-party", taproot: "yes",
      airgap: "no", oss: "yes", se: "no",
      passphrase: "yes", shamir: "yes", duress: "no",
      attestation: "yes", tor: "n/a", coinjoin: "n/a",
    },
    notes: "Older flagship. No secure element — keys stored in MCU flash with a PIN-derived KDF.",
  },

  // ============================================================
  //  SOFTWARE — desktop/mobile wallets that pair with HW signers
  // ============================================================
  {
    id: "electrum",
    name: "Electrum",
    maker: "Electrum",
    form: "software",
    features: {
      psbt: "yes", multisig: "yes", taproot: "partial",
      airgap: "n/a", oss: "yes", se: "n/a",
      passphrase: "yes", shamir: "no", duress: "no",
      attestation: "n/a", tor: "yes", coinjoin: "no",
    },
    notes: "The oldest desktop wallet. Tor support is manual configuration.",
  },
  {
    id: "nunchuk",
    name: "Nunchuk",
    maker: "Nunchuk",
    form: "software",
    features: {
      psbt: "yes", multisig: "yes", taproot: "yes",
      airgap: "n/a", oss: "yes", se: "n/a",
      passphrase: "yes", shamir: "no", duress: "no",
      attestation: "n/a", tor: "yes", coinjoin: "no",
    },
    notes: "Mobile + desktop with strong collaborative multisig (each cosigner runs the app).",
  },
  {
    id: "sparrow",
    name: "Sparrow",
    maker: "Craig Raw",
    form: "software",
    features: {
      psbt: "yes", multisig: "yes", taproot: "yes",
      airgap: "n/a", oss: "yes", se: "n/a",
      passphrase: "yes", shamir: "no", duress: "no",
      attestation: "n/a", tor: "yes", coinjoin: "partial",
    },
    notes: "Desktop. Excellent multisig UX, supports nearly every hardware wallet, optional Whirlpool CoinJoin.",
  },
  {
    id: "specter",
    name: "Specter Desktop",
    maker: "Cryptoadvance",
    form: "software",
    features: {
      psbt: "yes", multisig: "yes", taproot: "yes",
      airgap: "n/a", oss: "yes", se: "n/a",
      passphrase: "yes", shamir: "no", duress: "no",
      attestation: "n/a", tor: "yes", coinjoin: "no",
    },
    notes: "Multisig-first desktop coordinator. Requires a Bitcoin Core node (your own or remote).",
  },
  {
    id: "wasabi",
    name: "Wasabi",
    maker: "zkSNACKs",
    form: "software",
    features: {
      psbt: "yes", multisig: "no", taproot: "yes",
      airgap: "n/a", oss: "yes", se: "n/a",
      passphrase: "yes", shamir: "no", duress: "no",
      attestation: "n/a", tor: "yes", coinjoin: "yes",
    },
    notes: "Privacy-first desktop. CoinJoin is the headline feature; Tor by default.",
  },
];

export const formMeta: Record<WalletForm, { label: string; sub: string }> = {
  hardware: { label: "Hardware wallets", sub: "Dedicated devices that hold the seed and sign transactions internally." },
  software: { label: "Software wallets",  sub: "Desktop and mobile clients. Usually pair with a hardware signer; some hold keys directly." },
  service:  { label: "Custody services",  sub: "Co-signing or collaborative-custody services. You hold keys; they hold others." },
};
