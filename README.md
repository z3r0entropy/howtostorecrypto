# How to Store Crypto

From exchange to multisig — find the storage strategy that fits you.

**Live:** <https://howtostorecrypto.com>
**Offline copy:** <https://howtostorecrypto.com/offline.zip> &nbsp;·&nbsp; [why offline?](#use-it-offline)

> ## ⚠ Under heavy construction
>
> This site is a work-in-progress draft. Content, structure, and
> recommendations are not yet stable, and the specifics have not been
> independently reviewed. **Do not act on anything here without
> independent verification.**

---

## Why this exists

Self-custody comes with a question that custodial finance hides from you:
**where, exactly, do you keep the thing that controls all of it?**

For most people the answer is bad. A piece of paper in a drawer. A photo
on a phone synced to the cloud. A USB stick somewhere. A password manager
that depends on a single master password no one has rehearsed. The
industry of trusted parties who used to solve this problem — banks,
brokers, vaults, lawyers — is no longer in the loop. **You are.**

The good news is that getting this right is tractable. A handful of
methods have actually held up over a decade. The bad news is that almost
nobody bothers, because guidance on the topic is either:

- vendor-sponsored (buy this, the others are bad), or
- jargon-soaked threads aimed at people who already know the answer, or
- panic-merchant blog posts that don't translate into anything you'd do
  on a Saturday afternoon.

This site is the alternative. **Plain language, no vendor preferences,
opinionated where the evidence supports it, honest about trade-offs.**
It covers the *how*, not the *whether*: if you've decided to self-custody,
this is the manual you wish came in the box.

It's also free, ad-free, tracking-free, and not selling anything. The
hardware costs what hardware costs at whoever you buy it from.

## What's on the site

| Section | What it does |
| --- | --- |
| [Landing](https://howtostorecrypto.com) | The framework, methods, walkthrough, common mistakes, FAQ. |
| [Plan a setup](https://howtostorecrypto.com/app/setup) | Seven-step wizard. Tier × stakes → strategy → locations → inheritance → reminders → printable summary. |
| [Audit your setup](https://howtostorecrypto.com/app/quiz/audit) | Nine questions about your current setup. Ranked risk report split by loss-of-access vs theft, with one fix per finding. |
| [Test your knowledge](https://howtostorecrypto.com/app/quiz/knowledge) | Ten multiple-choice questions on the actual mechanics. Recommends a path. |
| [Backup locations](https://howtostorecrypto.com/app/locations) | Database of every viable place to put a backup, rated on loss-of-access and theft. |

## Use it offline

This site never asks for your seed phrase — and you should never enter
one on any website. The reason to use the offline copy is different:
**your backup strategy is itself sensitive information.** Where your
plates live. Who holds the sealed letter. Which vendors and locations
you've shortlisted. A live site that gets hijacked or quietly
poisoned could nudge you toward weaker choices, suggest a "rehearsal"
that's a phishing flow, or read what you've already entered in your
browser. A copy you downloaded last month can't be tampered with
after the fact.

**Download the bundle:**

- Latest, always-fresh, rebuilt with every deploy:
  <https://howtostorecrypto.com/offline.zip>
- Tagged versions (kept indefinitely, with auto-generated release notes):
  <https://github.com/z3r0entropy/howtostorecrypto/releases>
  &nbsp;·&nbsp; or pin to the newest tag with
  <https://github.com/z3r0entropy/howtostorecrypto/releases/latest/download/offline.zip>

Extract it, then run `serve.sh` (macOS / Linux) or `serve.bat` (Windows).
Detailed instructions are in `OFFLINE.md` inside the zip. The whole site
runs in your browser with no network calls (other than two web fonts,
easily blocked for full air-gap).

## A short ledger of cautionary tales

Each of these would have been a different story with a different setup.
They are listed because they are well-documented and because the lessons
generalise.

### Stefan Thomas · IronKey, 2011 / 2021
A long-time crypto early adopter encrypted ~7,002 BTC on an IronKey
hardware drive in 2011 and wrote the password down — somewhere. By 2021
he had eight failed attempts out of ten allowed before the drive
self-destructs the keys. The remaining attempts are likely also wrong.
**The lesson:** passwords and passphrases are secrets too. They need
the same storage plan as the seed itself.

### James Howells · Newport landfill, 2013
A UK engineer discarded a hard drive containing ~8,000 BTC mined in
2009. Council refused to let him excavate the landfill. More than a
decade and several legal attempts later, the drive remains buried.
**The lesson:** backups must outlive devices. The medium your seed is
on should not be confusable with garbage during a tidy-up.

### QuadrigaCX · sole-custody death, 2018-2019
The founder of a Canadian exchange died abroad in December 2018,
allegedly as the sole holder of the keys controlling ~CA$190M in
customer funds. Subsequent regulator findings concluded the exchange
was largely a fraud, but the operational shape of the disaster —
one person, no successor, no procedure — is exactly what self-custodians
also have to plan around.
**The lesson:** every setup needs a written, rehearsed inheritance
procedure that does not depend on you being alive.

### Mt. Gox · 850,000 BTC, 2014
A single exchange's failure removed roughly six per cent of all
bitcoin in existence at the time from circulation, for years.
Re-distributions are still finishing more than a decade later.
**The lesson:** the strongest argument for self-custody. The
*reason* this site exists.

### Bitfinex · 119,756 BTC, 2016
Another exchange custody failure, this one resolved in part by the
2022 arrests in New York. Many funds have been traced and seized;
that's the exception, not the rule.
**The lesson:** custodial assets are bearer assets the custodian
holds for you. Their security is yours.

### FTX · commingling, 2022
An exchange that looked regulated, sponsored sports teams, and ran
ads in the Super Bowl quietly lent customer funds to its own
proprietary trading arm. The shortfall was ~$8B.
**The lesson:** the appearance of regulation is not the same as
regulation. Self-custody removes this entire category of risk.

### Ronin Bridge · validator compromise, 2022
$625M drained from the Axie Infinity sidechain by an attacker who
controlled 5 of 9 validator keys — four obtained through targeted
spear-phishing of employees.
**The lesson:** m-of-n is only as strong as the weakest n keys. The
same applies to your own multisig: distribute keys to genuinely
independent custodians, devices, and locations.

### Bybit · signing-UI compromise, February 2025
$1.4B drained from a cold wallet during a routine signed transfer.
The attackers (widely attributed to Lazarus / DPRK) compromised the
front-end the signers used to review the transaction, so the bytes
they signed did not match what their UI showed.
**The lesson:** for any high-value signing, verify the transaction on
a device you trust independently of the one showing the UI. "Trust
the screen" is the bug.

### Physical attacks on holders · ongoing
Documented robberies, kidnappings, and home invasions targeting people
identified as crypto holders. Public tracking is maintained at
<https://github.com/jlopp/physical-bitcoin-attacks>.
**The lesson:** privacy is part of custody. Avoid being publicly
identified as a large holder. Setups that require coercing multiple
people in different locations make you a worse target.

### Ledger Connect Kit · supply-chain, December 2023
A compromised npm package silently siphoned funds from dapps that
loaded Ledger's wallet-connection library. The compromise lasted
hours; ~$610k was drained before it was caught.
**The lesson:** the software you use to interact with the chain has
its own threat model. Hardware wallets help; verifying the
transaction on the device, not the screen, helps more.

> Want to suggest an addition to this ledger?
> Open an issue or PR — see `CONTRIBUTING.md`.

## Status

This site is in heavy draft. Expect frequent changes to copy,
structure, and recommendations until the construction banner comes
down. Material is dated and versioned where it matters.

## Contributing & development

Dev setup, deploy details, and the design system live in
[`CONTRIBUTING.md`](./CONTRIBUTING.md).
