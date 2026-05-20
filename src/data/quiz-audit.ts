/**
 * Audit quiz — user describes their current setup; we identify risks.
 * Each question's selected answer contributes one or more *findings*
 * to the report. Findings are ranked by severity.
 */

export type Severity = "critical" | "high" | "medium" | "low";
/**
 * Every finding falls on one of two axes (or both):
 *   - loss  = "you can no longer reach your own backup"
 *   - theft = "an adversary reaches your backup"
 * Surfacing this in the UI is half the diagnostic value.
 */
export type RiskAxis = "loss" | "theft" | "both";

export type Finding = {
  id: string;
  title: string;
  severity: Severity;
  axis: RiskAxis;
  detail: string;
  fix: string;
};

export const axisMeta: Record<RiskAxis, { label: string; short: string; tone: "loss" | "theft" }> = {
  loss: { label: "Loss-of-access risk", short: "loss", tone: "loss" },
  theft: { label: "Theft & coercion risk", short: "theft", tone: "theft" },
  both: { label: "Loss & theft risk", short: "both", tone: "loss" },
};

export type AuditChoice = {
  id: string;
  text: string;
  /** Findings this answer adds to the report. */
  findings?: Finding[];
};

export type AuditQuestion = {
  id: string;
  q: string;
  help?: string;
  choices: AuditChoice[];
};

export const auditQuestions: AuditQuestion[] = [
  {
    id: "a1",
    q: "How many physical copies of your seed phrase exist?",
    help: "Count anywhere it's written or stamped, including drawers and safes you forgot about.",
    choices: [
      {
        id: "0",
        text: "Zero",
        findings: [
          {
            id: "no-backup",
            title: "No physical backup at all",
            severity: "critical",
            axis: "both",
            detail:
              "Your hardware wallet failing, getting lost, or being stolen means total loss. There is no recovery path.",
            fix: "Stamp a steel plate this week. Two if you can. Even one is dramatically better than zero.",
          },
        ],
      },
      { id: "1", text: "One" },
      { id: "2", text: "Two" },
      { id: "3", text: "Three or more" },
    ],
  },
  {
    id: "a2",
    q: "How many separate physical locations hold those copies?",
    help: "Two copies in the same building counts as one location.",
    choices: [
      {
        id: "1",
        text: "One location",
        findings: [
          {
            id: "spof",
            title: "Single point of failure",
            severity: "critical",
            axis: "both",
            detail:
              "One fire, one flood, one burglary, one moving day mistake destroys everything. This is the single most common cause of permanent loss.",
            fix: "Add a second location — a bank deposit box, a relative's home, a second property. Geographic separation, not just a different room.",
          },
        ],
      },
      { id: "2", text: "Two locations" },
      { id: "3", text: "Three or more locations" },
    ],
  },
  {
    id: "a3",
    q: "What medium are your backups on?",
    choices: [
      {
        id: "paper",
        text: "Paper only",
        findings: [
          {
            id: "paper-fragile",
            title: "Paper alone is fragile",
            severity: "high",
            axis: "loss",
            detail:
              "Paper burns at ~230°C; house fires routinely exceed 800°C. It also degrades from humidity, ink fade, and water damage over years.",
            fix: "Make a stainless steel copy as your primary; keep paper as a redundant tertiary if you like.",
          },
        ],
      },
      { id: "metal", text: "Stamped or etched metal" },
      { id: "both", text: "Both metal and paper" },
      {
        id: "digital",
        text: "Digital file only (encrypted)",
        findings: [
          {
            id: "digital-only",
            title: "Digital-only backup is a hot wallet",
            severity: "critical",
            axis: "theft",
            detail:
              "Anything sync-able is reachable from the network. The encryption is only as strong as the passphrase, which is now a second secret you must store somewhere.",
            fix: "Add a non-digital physical backup as the primary. Digital is acceptable only as a tertiary copy.",
          },
        ],
      },
    ],
  },
  {
    id: "a4",
    q: "Have you tested recovery onto a fresh device in the last 12 months?",
    help: "'Tested' means: wipe a spare device, restore from your backup by hand, verify the first address matches, wipe again.",
    choices: [
      { id: "yes", text: "Yes, within the last 12 months" },
      {
        id: "no",
        text: "No, or I'm not sure",
        findings: [
          {
            id: "untested",
            title: "Untested backup",
            severity: "high",
            axis: "loss",
            detail:
              "An untested backup is not a backup — it's a hope. The most common silent failure modes (typos, wrong derivation path, missing passphrase) only surface when you actually restore.",
            fix: "Rehearse this weekend. 30 minutes, one factory-reset hardware wallet, one verification of the first receiving address.",
          },
        ],
      },
      {
        id: "never",
        text: "I've never done it",
        findings: [
          {
            id: "untested-never",
            title: "Never-tested backup",
            severity: "critical",
            axis: "loss",
            detail:
              "You do not know whether your backup works. You will discover it on the day you need it.",
            fix: "Rehearse this weekend. 30 minutes, one factory-reset hardware wallet, one verification of the first receiving address.",
          },
        ],
      },
    ],
  },
  {
    id: "a5",
    q: "Is there a digital copy of your seed phrase ANYWHERE — even encrypted?",
    help: "Photos, screenshots, password managers, cloud notes, email drafts, Notion pages.",
    choices: [
      { id: "no", text: "No, never has been" },
      {
        id: "yes-encrypted",
        text: "Yes, but encrypted in a password manager",
        findings: [
          {
            id: "pm-only-warning",
            title: "Password manager as a primary is risky",
            severity: "medium",
            axis: "theft",
            detail:
              "A cloud-synced password manager protects the seed only as well as your master password. Acceptable as a tertiary copy on a self-hosted vault; not as the primary.",
            fix: "Make sure the manager is not your only copy; ideally a stamped steel plate is the primary.",
          },
        ],
      },
      {
        id: "yes-photo",
        text: "Yes, a photo or screenshot",
        findings: [
          {
            id: "photo-exposure",
            title: "Photo of seed phrase exists",
            severity: "critical",
            axis: "theft",
            detail:
              "Your phone is online. It has been backed up to a cloud, scanned by OCR pipelines you don't control, and possibly shared with apps that have photo permissions.",
            fix: "Delete the photo. Empty trash, recently-deleted, and cloud trash. Assume it's already compromised; consider rotating to a new wallet if the holding warrants it.",
          },
        ],
      },
      {
        id: "yes-cloud",
        text: "Yes, in a cloud note (Google Keep / Notion / iCloud / etc.)",
        findings: [
          {
            id: "cloud-note-exposure",
            title: "Seed in a cloud note",
            severity: "critical",
            axis: "theft",
            detail:
              "Cloud notes have weak encryption, broad app integrations, and persistent access tokens. Any breach of the platform or your account is total loss.",
            fix: "Delete the note from every device and the cloud trash. Treat the seed as compromised; rotate to a new wallet if the holding warrants it.",
          },
        ],
      },
    ],
  },
  {
    id: "a6",
    q: "Has anyone else seen or been told the phrase?",
    choices: [
      { id: "no", text: "No one" },
      {
        id: "spouse",
        text: "My spouse / partner knows it",
        findings: [
          {
            id: "shared-seed",
            title: "Seed shared with another person",
            severity: "high",
            axis: "theft",
            detail:
              "Sharing a single-sig seed doubles the attack surface without adding safety. The right pattern for joint custody is multisig, not shared knowledge.",
            fix: "Migrate to a 2-of-3 multisig where the partner holds one key; their key alone can't spend.",
          },
        ],
      },
      {
        id: "family",
        text: "A family member knows it",
        findings: [
          {
            id: "family-shared",
            title: "Seed shared with a family member",
            severity: "high",
            axis: "theft",
            detail:
              "Their device security, social-engineering exposure, and discretion are now part of your threat model.",
            fix: "Replace verbal sharing with a sealed-envelope inheritance pattern — they know the location, not the contents.",
          },
        ],
      },
      {
        id: "friend",
        text: "A friend or colleague",
        findings: [
          {
            id: "friend-shared",
            title: "Seed shared with a non-family party",
            severity: "high",
            axis: "theft",
            detail:
              "The bond may be solid, but life changes — falling-outs, divorces, employer changes. Verbal seed-sharing has no graceful exit.",
            fix: "Rotate to a new wallet and migrate funds. Use sealed-envelope inheritance instead.",
          },
        ],
      },
    ],
  },
  {
    id: "a7",
    q: "If you died tomorrow, would anyone know how to recover the wallet?",
    help: "Not just where the backup is — the actual procedure to use it.",
    choices: [
      { id: "yes-procedure", text: "Yes — there's a written, rehearsed procedure with an attorney or trusted party" },
      {
        id: "yes-location",
        text: "Someone knows where the backup is, but no procedure",
        findings: [
          {
            id: "no-procedure",
            title: "No restore procedure",
            severity: "high",
            axis: "loss",
            detail:
              "Knowing where a steel plate is doesn't help a non-technical heir who has never installed a wallet. The procedure is the hard part.",
            fix: "Write a sealed letter with step-by-step restore instructions, contact for one technical helper, and rehearse it once with the helper (not the heir).",
          },
        ],
      },
      {
        id: "no",
        text: "No, the wallet would be lost with me",
        findings: [
          {
            id: "no-inheritance",
            title: "No inheritance plan",
            severity: "critical",
            axis: "loss",
            detail:
              "Your holdings disappear at your death. The most common preventable loss after misplacement.",
            fix: "Write a sealed letter with location, procedure, and one technical helper. Or set up multisig with a professional trustee who can co-sign for the heir.",
          },
        ],
      },
    ],
  },
  {
    id: "a8",
    q: "If a passphrase (25th word) is part of your setup, where is it stored?",
    help: "If you don't use a passphrase, pick the last option.",
    choices: [
      { id: "memory", text: "In my head only" },
      {
        id: "memory-only-bad",
        text: "In my head only — and I'm not sure I'd remember it under stress",
        findings: [
          {
            id: "passphrase-memory",
            title: "Passphrase in memory only, low confidence",
            severity: "high",
            axis: "loss",
            detail:
              "Memory degrades. A passphrase you can't reliably reproduce is functionally the same as having lost the wallet.",
            fix: "Store the passphrase as carefully as the seed: stamped metal, separate location from the seed, sealed instructions for heirs.",
          },
        ],
      },
      { id: "stored-separate", text: "Written down and stored separately from the seed plates" },
      {
        id: "with-seed",
        text: "Stored with the seed",
        findings: [
          {
            id: "passphrase-co-stored",
            title: "Passphrase co-located with seed",
            severity: "high",
            axis: "theft",
            detail:
              "Storing the passphrase with the seed defeats its purpose entirely. A thief who finds one finds both.",
            fix: "Move the passphrase to a different location, ideally a different category (e.g., seed at home + passphrase with attorney).",
          },
        ],
      },
      { id: "no-passphrase", text: "I don't use a passphrase" },
    ],
  },
  {
    id: "a9",
    q: "When was the last time you reviewed the entire setup end-to-end?",
    choices: [
      { id: "recent", text: "Within the last 12 months" },
      {
        id: "old",
        text: "More than a year ago",
        findings: [
          {
            id: "stale-review",
            title: "Setup not reviewed recently",
            severity: "low",
            axis: "both",
            detail:
              "Life changes — moves, divorces, new homes, deaths — silently break custody setups. Annual reviews catch this.",
            fix: "Block a 30-minute calendar slot annually. Walk through every location, every contact, every assumption.",
          },
        ],
      },
      {
        id: "never",
        text: "I haven't, since the initial setup",
        findings: [
          {
            id: "never-reviewed",
            title: "Setup never reviewed",
            severity: "medium",
            axis: "both",
            detail:
              "Without a periodic review, you don't know what's still true. Sealed letters become outdated; trustees move; safes get sold.",
            fix: "Walk through it this weekend, then block annual time on the calendar.",
          },
        ],
      },
    ],
  },
];

export type AuditResult = {
  findings: Finding[];
  bySeverity: Record<Severity, Finding[]>;
  score: number; // 0–100, higher = safer
  grade: "A" | "B" | "C" | "D" | "F";
  summary: string;
};

const severityWeight: Record<Severity, number> = {
  critical: 30,
  high: 18,
  medium: 8,
  low: 3,
};

export function gradeAudit(answers: Record<string, string>): AuditResult {
  const findings: Finding[] = [];
  for (const q of auditQuestions) {
    const chosen = q.choices.find((c) => c.id === answers[q.id]);
    if (chosen?.findings) findings.push(...chosen.findings);
  }
  const totalDeduction = findings.reduce((sum, f) => sum + severityWeight[f.severity], 0);
  const score = Math.max(0, 100 - totalDeduction);

  let grade: AuditResult["grade"] = "F";
  if (score >= 90) grade = "A";
  else if (score >= 75) grade = "B";
  else if (score >= 55) grade = "C";
  else if (score >= 35) grade = "D";

  const bySeverity: Record<Severity, Finding[]> = {
    critical: findings.filter((f) => f.severity === "critical"),
    high: findings.filter((f) => f.severity === "high"),
    medium: findings.filter((f) => f.severity === "medium"),
    low: findings.filter((f) => f.severity === "low"),
  };

  let summary = "";
  if (findings.length === 0) {
    summary =
      "No risks detected from the answers given. Your setup looks principled. Schedule the annual rehearsal and keep going.";
  } else if (bySeverity.critical.length > 0) {
    summary = `${bySeverity.critical.length} critical issue${bySeverity.critical.length > 1 ? "s" : ""} to address this week, before anything else.`;
  } else if (bySeverity.high.length > 0) {
    summary = `${bySeverity.high.length} high-priority gap${bySeverity.high.length > 1 ? "s" : ""}. None will lose you funds tomorrow, but they should be closed this month.`;
  } else {
    summary = "Minor improvements available — your setup is fundamentally sound.";
  }

  return { findings, bySeverity, score, grade, summary };
}
