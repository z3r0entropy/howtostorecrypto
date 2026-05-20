import { useMemo, useState } from "preact/hooks";
import {
  auditQuestions,
  gradeAudit,
  axisMeta,
  type Severity,
  type Finding,
  type RiskAxis,
} from "~/data/quiz-audit";

const severityMeta: Record<Severity, { label: string; color: string; weight: number }> = {
  critical: { label: "Critical", color: "var(--warn)", weight: 4 },
  high:     { label: "High",     color: "#d97706",     weight: 3 },
  medium:   { label: "Medium",   color: "#eab308",     weight: 2 },
  low:      { label: "Low",      color: "var(--accent)", weight: 1 },
};

export default function AuditQuiz() {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const answered = Object.keys(answers).length;
  const total = auditQuestions.length;
  const result = useMemo(() => (submitted ? gradeAudit(answers) : null), [submitted, answers]);

  function pick(qid: string, cid: string) {
    if (submitted) return;
    setAnswers((a) => ({ ...a, [qid]: cid }));
  }
  function submit() {
    if (answered < total) {
      if (!confirm(`Answered ${answered} of ${total}. Submit anyway? Unanswered questions add no findings.`)) return;
    }
    setSubmitted(true);
    document.getElementById("aq-result")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  function reset() {
    setAnswers({});
    setSubmitted(false);
    document.getElementById("aq-top")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div id="aq-top">
      {/* Progress bar */}
      <div class="glass sticky top-20 z-30 mb-8 flex flex-wrap items-center justify-between gap-3 rounded-full px-5 py-3 text-sm">
        <div class="flex items-center gap-3">
          <div class="display stat-grad text-xl">{answered}</div>
          <div class="text-[var(--ink-2)]">of {total} answered</div>
        </div>
        <div class="hidden h-1.5 max-w-xs flex-1 rounded-full bg-[var(--hairline)] md:block" style="margin: 0 1rem">
          <div
            class="h-full rounded-full"
            style={`width: ${(answered / total) * 100}%; background: linear-gradient(90deg, var(--ice-deep), var(--accent))`}
          ></div>
        </div>
        {!submitted ? (
          <button
            onClick={submit}
            disabled={answered === 0}
            class="btn btn-primary btn-sm"
            style={answered === 0 ? "opacity: 0.4; cursor: not-allowed" : ""}
          >
            Show report →
          </button>
        ) : (
          <button onClick={reset} class="btn btn-secondary btn-sm">↺ Re-audit</button>
        )}
      </div>

      <ol class="space-y-4">
        {auditQuestions.map((q, qi) => {
          const userChoice = answers[q.id];
          return (
            <li class="glass rounded-2xl p-6 md:p-7">
              <div class="text-xs uppercase tracking-[0.15em] text-[var(--ice-deep)]">
                Q. {String(qi + 1).padStart(2, "0")}
              </div>
              <h3 class="display mt-3 text-lg leading-snug md:text-xl">{q.q}</h3>
              {q.help && (
                <p class="mt-2 text-xs text-[var(--dim)]">{q.help}</p>
              )}

              <div class="mt-5 space-y-2">
                {q.choices.map((c) => {
                  const picked = userChoice === c.id;
                  const cls = picked
                    ? "glass-dark ring-2 ring-[var(--accent)] shadow-md"
                    : "glass-dark hover:bg-white/40";
                  return (
                    <button
                      onClick={() => pick(q.id, c.id)}
                      class={`flex w-full items-start gap-3 rounded-xl p-4 text-left text-sm transition ${cls}`}
                      disabled={submitted}
                    >
                      <span class={`mt-0.5 size-4 shrink-0 rounded-full border ${picked ? "border-[var(--accent)] bg-[var(--accent)]" : "border-[var(--dimmer)]"}`}>
                        {picked && (
                          <svg viewBox="0 0 16 16" class="size-full p-0.5 text-white">
                            <path fill="none" stroke="currentColor" stroke-width="2" d="M3 8l3 3 7-7" />
                          </svg>
                        )}
                      </span>
                      <span>{c.text}</span>
                      {submitted && picked && c.findings && c.findings.length > 0 && (
                        <span class="ml-auto text-xs text-[var(--warn)]">
                          {c.findings.length} finding{c.findings.length > 1 ? "s" : ""}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </li>
          );
        })}
      </ol>

      {result && (
        <section id="aq-result" class="mt-10 space-y-8">
          {/* Headline card */}
          <div class="glass rounded-3xl p-8 md:p-12">
            <div class="flex flex-wrap items-baseline justify-between gap-3">
              <div class="pill"><span class="pill-dot"></span> Your audit report</div>
              <button onClick={reset} class="btn btn-ghost btn-sm">↺ Re-audit</button>
            </div>

            <div class="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
              <div>
                <div class="text-xs uppercase tracking-[0.15em] text-[var(--dim)]">Score</div>
                <div class="display stat-grad mt-2 text-6xl">{result.score}<span class="text-3xl text-[var(--dim)]"> / 100</span></div>
              </div>
              <div>
                <div class="text-xs uppercase tracking-[0.15em] text-[var(--dim)]">Grade</div>
                <div class="display stat-grad mt-2 text-6xl">{result.grade}</div>
              </div>
              <div>
                <div class="text-xs uppercase tracking-[0.15em] text-[var(--dim)]">Findings</div>
                <div class="display mt-2 text-6xl">{result.findings.length}</div>
              </div>
            </div>

            <div class="mt-8 border-t hairline pt-6">
              <h3 class="display text-2xl">{result.summary}</h3>
            </div>
          </div>

          {result.findings.length > 0 && (
            <>
              {/* Axis split */}
              <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                <AxisCard
                  axis="loss"
                  findings={result.findings.filter((f) => f.axis === "loss" || f.axis === "both")}
                />
                <AxisCard
                  axis="theft"
                  findings={result.findings.filter((f) => f.axis === "theft" || f.axis === "both")}
                />
              </div>

              {/* Full ranked list */}
              <div class="glass rounded-3xl p-8 md:p-10">
                <div class="text-xs uppercase tracking-[0.15em] text-[var(--ice-deep)]">
                  All findings · ranked
                </div>
                <h3 class="display mt-3 text-2xl">Address top to bottom</h3>

                <ol class="mt-6 space-y-3">
                  {sortedFindings(result.findings).map((f) => (
                    <FindingRow f={f} />
                  ))}
                </ol>
              </div>

              <div class="flex flex-wrap gap-3">
                <a href="/app/setup" class="btn btn-primary">
                  Plan a setup from this →
                </a>
                <a href="/app/locations" class="btn btn-secondary">
                  Browse better locations →
                </a>
              </div>
            </>
          )}

          {result.findings.length === 0 && (
            <div class="glass rounded-3xl p-8 text-center">
              <div class="display stat-grad text-5xl">✓</div>
              <p class="mt-4 text-base text-[var(--ink-2)]">
                No findings from the answers given. Schedule the annual rehearsal
                and keep going.
              </p>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function AxisCard({ axis, findings }: { axis: "loss" | "theft"; findings: Finding[] }) {
  const meta = axis === "loss"
    ? { label: axisMeta.loss.label, tint: "var(--accent)" }
    : { label: axisMeta.theft.label, tint: "var(--warn)" };
  const sorted = sortedFindings(findings);
  const worst = sorted[0];

  return (
    <div class="glass rounded-2xl p-6">
      <div class="flex items-center gap-2 text-xs uppercase tracking-[0.15em]" style={`color: ${meta.tint}`}>
        <span class="size-2 rounded-full" style={`background: ${meta.tint}`}></span>
        {meta.label}
      </div>
      <div class="display mt-3 text-5xl">
        {findings.length}
        <span class="text-2xl text-[var(--dim)]"> {findings.length === 1 ? "finding" : "findings"}</span>
      </div>
      {worst ? (
        <div class="mt-4 border-t hairline pt-4">
          <div class="text-xs uppercase tracking-[0.15em] text-[var(--dim)]">Worst</div>
          <div class="mt-1 font-medium">{worst.title}</div>
          <p class="mt-1 text-xs text-[var(--ink-2)]">{worst.fix}</p>
        </div>
      ) : (
        <p class="mt-4 text-sm text-[var(--ink-2)]">Nothing flagged on this axis.</p>
      )}
    </div>
  );
}

function FindingRow({ f }: { f: Finding }) {
  const s = severityMeta[f.severity];
  const axisLabel = axisMeta[f.axis].short;
  return (
    <li class="glass-dark rounded-xl p-5">
      <div class="flex flex-wrap items-baseline justify-between gap-2">
        <div class="flex flex-wrap items-baseline gap-2">
          <span
            class="rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.15em] text-white"
            style={`background: ${s.color}`}
          >
            {s.label}
          </span>
          <span
            class="rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.15em]"
            style={`background: ${f.axis === "theft" ? "rgba(196,92,58,0.14)" : "rgba(47,111,224,0.14)"}; color: ${f.axis === "theft" ? "var(--warn)" : "var(--accent-deep)"}`}
          >
            {axisLabel}
          </span>
          <span class="display text-lg">{f.title}</span>
        </div>
      </div>
      <p class="mt-3 text-sm leading-relaxed text-[var(--ink-2)]">{f.detail}</p>
      <div class="mt-4 border-t hairline pt-3">
        <div class="text-[11px] uppercase tracking-[0.15em] text-[var(--ok)]">Fix</div>
        <p class="mt-1 text-sm text-[var(--ink)]">{f.fix}</p>
      </div>
    </li>
  );
}

function sortedFindings(findings: Finding[]) {
  return findings.slice().sort((a, b) => severityMeta[b.severity].weight - severityMeta[a.severity].weight);
}
