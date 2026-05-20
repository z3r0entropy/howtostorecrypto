/**
 * Knowledge quiz — tests the user's current understanding.
 * Output: a score 0–10 and a recommended starting path.
 */

export type Question = {
  id: string;
  q: string;
  choices: { id: string; text: string; correct?: boolean; explain?: string }[];
  rationale: string;
};

export const knowledgeQuestions: Question[] = [
  {
    id: "k1",
    q: "Your hardware wallet is destroyed in a fire. Your seed phrase is intact. What happens to your crypto?",
    choices: [
      { id: "a", text: "It's lost — the device held the keys." },
      { id: "b", text: "You restore the seed onto a new device and continue.", correct: true },
      { id: "c", text: "You file a claim with the wallet manufacturer." },
      { id: "d", text: "The exchange can recover it for you." },
    ],
    rationale:
      "The device is a convenient interface to your seed. The seed *is* the wallet. Restore it onto any compatible wallet.",
  },
  {
    id: "k2",
    q: "How many words does a standard BIP-39 seed phrase typically have?",
    choices: [
      { id: "a", text: "8" },
      { id: "b", text: "12 or 24", correct: true },
      { id: "c", text: "16 or 32" },
      { id: "d", text: "Exactly 20" },
    ],
    rationale: "BIP-39 phrases are 12, 15, 18, 21, or 24 words. 12 and 24 are by far the most common.",
  },
  {
    id: "k3",
    q: "Which of these is the SAFEST place to store a seed phrase?",
    choices: [
      { id: "a", text: "A screenshot on your phone (encrypted)" },
      { id: "b", text: "A password manager synced to the cloud" },
      { id: "c", text: "Stamped into stainless steel in two separate locations", correct: true },
      { id: "d", text: "Memorised and never written down" },
    ],
    rationale:
      "Stamped steel survives fire, water, and decades. Two locations removes the single point of failure. Screens introduce a network surface; memory degrades.",
  },
  {
    id: "k4",
    q: "What does '2-of-3 multisig' mean?",
    choices: [
      { id: "a", text: "Two backups in three locations." },
      { id: "b", text: "Two of three independent keys must sign to spend.", correct: true },
      { id: "c", text: "The wallet checks two of three online services." },
      { id: "d", text: "Two-factor authentication on a hardware wallet." },
    ],
    rationale:
      "Three keys exist; any two together can spend, any one alone cannot. Losing one key still allows recovery; compromising one key still prevents theft.",
  },
  {
    id: "k5",
    q: "A 'BIP-39 passphrase' (sometimes called the 25th word) is…",
    choices: [
      { id: "a", text: "An optional extra secret that, combined with your seed, derives a different wallet.", correct: true },
      { id: "b", text: "The first word of your seed phrase." },
      { id: "c", text: "A backup PIN for your hardware wallet." },
      { id: "d", text: "A recovery question your wallet asks if you forget the PIN." },
    ],
    rationale:
      "A passphrase is a separate secret you supply at restore time. With it, you get one wallet; without it, you get a different (often empty) wallet. Plausible deniability — and another thing to lose.",
  },
  {
    id: "k6",
    q: "You write down your seed phrase on paper and lock it in a drawer. What's the BIGGEST risk?",
    choices: [
      { id: "a", text: "Someone steals it." },
      { id: "b", text: "Fire, flood, or simply losing track of it.", correct: true },
      { id: "c", text: "Inflation reduces its value." },
      { id: "d", text: "The drawer key is too easy to copy." },
    ],
    rationale:
      "Statistically, the most common cause of loss is the most boring one: the backup gets misplaced, thrown out, ruined by a leak, or destroyed in a fire. Not a hack.",
  },
  {
    id: "k7",
    q: "What is SLIP-39 / Shamir Secret Sharing?",
    choices: [
      { id: "a", text: "An encryption algorithm for hardware wallets." },
      { id: "b", text: "A scheme that splits a secret into shares; any threshold (e.g., 2 of 3) reconstructs.", correct: true },
      { id: "c", text: "A way to backup to multiple cloud providers." },
      { id: "d", text: "The replacement for BIP-39." },
    ],
    rationale:
      "Shamir Secret Sharing splits a secret into n shares such that any m of them can reconstruct it; fewer than m reveal nothing. SLIP-39 is the Trezor-supported standard.",
  },
  {
    id: "k8",
    q: "Untested backup vs. tested backup. Which statement is true?",
    choices: [
      { id: "a", text: "An untested backup is a backup." },
      { id: "b", text: "An untested backup is a hope, not a backup.", correct: true },
      { id: "c", text: "Testing a backup risks exposing it." },
      { id: "d", text: "Tested and untested backups are equivalent." },
    ],
    rationale:
      "Restore onto a fresh, offline device. Confirm the first address matches. Wipe. Without rehearsal you don't know your backup works until it has to — and by then it's too late.",
  },
  {
    id: "k9",
    q: "You die unexpectedly. What's the best inheritance setup for your heirs?",
    choices: [
      { id: "a", text: "Tell your spouse the seed phrase, just in case." },
      { id: "b", text: "Sealed letter held by an attorney with location + procedure, rehearsed once.", correct: true },
      { id: "c", text: "Hide a USB drive with the seed somewhere clever in your home." },
      { id: "d", text: "Memorise it and trust your family figures it out." },
    ],
    rationale:
      "Inheritance requires written procedure, independent custody, and at least one rehearsal — never the secret itself in plain text in your home or anyone's hands.",
  },
  {
    id: "k10",
    q: "What's the actual brute-force time to crack a properly generated 24-word seed?",
    choices: [
      { id: "a", text: "Roughly a year with current hardware." },
      { id: "b", text: "Decades, but feasible with state-actor budgets." },
      { id: "c", text: "Vastly longer than the age of the universe.", correct: true },
      { id: "d", text: "Already trivial; that's why we add passphrases." },
    ],
    rationale:
      "256 bits of entropy is far beyond brute force. Worry about operator error and phishing, not about your seed being guessed.",
  },
];

export type KnowledgeResult = {
  score: number;
  max: number;
  level: "beginner" | "advanced" | "expert";
  headline: string;
  recommendation: string;
  nextPath: { label: string; href: string }[];
};

export function gradeKnowledge(answers: Record<string, string>): KnowledgeResult {
  let correct = 0;
  for (const q of knowledgeQuestions) {
    const chosen = answers[q.id];
    if (chosen && q.choices.find((c) => c.id === chosen)?.correct) correct += 1;
  }
  const max = knowledgeQuestions.length;
  let level: "beginner" | "advanced" | "expert" = "beginner";
  let headline = "";
  let recommendation = "";
  let nextPath: { label: string; href: string }[] = [];

  if (correct <= 4) {
    level = "beginner";
    headline = "Plenty to learn — and that's fine.";
    recommendation =
      "Start with the landing page's framework section, then read the four methods carefully. Don't worry about multisig until you've nailed the steel-plate basics.";
    nextPath = [
      { label: "Read the framework", href: "/#methods" },
      { label: "Start the setup wizard", href: "/app/setup" },
    ];
  } else if (correct <= 7) {
    level = "advanced";
    headline = "You've got the basics. Time to harden the setup.";
    recommendation =
      "Skip the introductory material and jump straight to the methods comparison. The conservative default (steel + two locations + sealed letter) is probably the right next step.";
    nextPath = [
      { label: "Start the setup wizard", href: "/app/setup" },
      { label: "Audit your current setup", href: "/app/quiz/audit" },
    ];
  } else {
    level = "expert";
    headline = "Solid grasp. Now make sure the setup matches.";
    recommendation =
      "You probably don't need the explanation pages. Run the audit quiz against your current setup to find blind spots, and consider whether multisig or Shamir suits your situation.";
    nextPath = [
      { label: "Audit your current setup", href: "/app/quiz/audit" },
      { label: "Open the setup wizard at expert level", href: "/app/setup?tier=expert" },
    ];
  }

  return { score: correct, max, level, headline, recommendation, nextPath };
}
