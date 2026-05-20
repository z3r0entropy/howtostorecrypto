import { useMemo, useState } from "preact/hooks";
import { gradeKnowledge, knowledgeQuestions } from "~/data/quiz-knowledge";
import { url } from "~/lib/url";

export default function KnowledgeQuiz() {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [showRationale, setShowRationale] = useState(false);

  const answered = Object.keys(answers).length;
  const total = knowledgeQuestions.length;
  const result = useMemo(() => (submitted ? gradeKnowledge(answers) : null), [submitted, answers]);

  function pick(qid: string, cid: string) {
    if (submitted) return;
    setAnswers((a) => ({ ...a, [qid]: cid }));
  }

  function submit() {
    if (answered < total) {
      if (!confirm(`You've answered ${answered} of ${total}. Submit anyway?`)) return;
    }
    setSubmitted(true);
    setShowRationale(true);
    document.getElementById("kq-result")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function reset() {
    setAnswers({});
    setSubmitted(false);
    setShowRationale(false);
    document.getElementById("kq-top")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div id="kq-top">
      {/* Progress */}
      <div class="glass sticky top-20 z-30 mb-8 flex flex-wrap items-center justify-between gap-3 rounded-full px-5 py-3 text-sm">
        <div class="flex items-center gap-3">
          <div class="display stat-grad text-xl">{answered}</div>
          <div class="text-[var(--ink-2)]">of {total} answered</div>
        </div>
        <div class="flex-1 mx-4 hidden h-1.5 max-w-xs rounded-full bg-[var(--hairline)] md:block">
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
            See results →
          </button>
        ) : (
          <button onClick={reset} class="btn btn-secondary btn-sm">
            ↺ Retake
          </button>
        )}
      </div>

      {/* Questions */}
      <ol class="space-y-4">
        {knowledgeQuestions.map((q, qi) => {
          const userChoice = answers[q.id];
          const correctChoice = q.choices.find((c) => c.correct);
          return (
            <li class="glass rounded-2xl p-6 md:p-7">
              <div class="flex items-baseline justify-between gap-3">
                <div class="text-xs uppercase tracking-[0.15em] text-[var(--ice-deep)]">
                  Q. {String(qi + 1).padStart(2, "0")}
                </div>
                {submitted && (
                  <div>
                    {userChoice === correctChoice?.id ? (
                      <span class="tag tag-ok">correct</span>
                    ) : userChoice ? (
                      <span class="tag tag-warn">incorrect</span>
                    ) : (
                      <span class="tag tag-neutral">skipped</span>
                    )}
                  </div>
                )}
              </div>
              <h3 class="display mt-3 text-lg leading-snug md:text-xl">{q.q}</h3>

              <div class="mt-5 grid grid-cols-1 gap-2 md:grid-cols-2">
                {q.choices.map((c) => {
                  const picked = userChoice === c.id;
                  const isCorrect = !!c.correct;
                  let cls = "glass-dark hover:bg-white/40";
                  if (submitted) {
                    if (isCorrect) cls = "ring-2 ring-[var(--ok)]/60 bg-[rgba(47,148,104,0.08)]";
                    else if (picked) cls = "ring-2 ring-[var(--warn)]/60 bg-[rgba(196,92,58,0.08)]";
                    else cls = "glass-dark opacity-70";
                  } else if (picked) {
                    cls = "glass-dark ring-2 ring-[var(--accent)] shadow-md";
                  }
                  return (
                    <button
                      onClick={() => pick(q.id, c.id)}
                      class={`rounded-xl p-4 text-left text-sm transition ${cls}`}
                      disabled={submitted}
                    >
                      <span class="mr-2 font-mono text-[var(--dim)]">{c.id.toUpperCase()}.</span>
                      {c.text}
                    </button>
                  );
                })}
              </div>

              {submitted && showRationale && (
                <div class="mt-5 rounded-xl border hairline bg-white/30 p-4 text-sm text-[var(--ink-2)]">
                  <span class="text-xs uppercase tracking-[0.15em] text-[var(--ice-deep)]">
                    Why
                  </span>
                  <p class="mt-1">{q.rationale}</p>
                </div>
              )}
            </li>
          );
        })}
      </ol>

      {/* Result */}
      {result && (
        <section id="kq-result" class="glass mt-10 rounded-3xl p-8 md:p-12">
          <div class="flex flex-wrap items-baseline justify-between gap-3">
            <div class="pill">
              <span class="pill-dot"></span> Your result
            </div>
            <button onClick={reset} class="btn btn-ghost btn-sm">
              ↺ Retake
            </button>
          </div>

          <div class="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div>
              <div class="text-xs uppercase tracking-[0.15em] text-[var(--dim)]">Score</div>
              <div class="display stat-grad mt-2 text-6xl">
                {result.score}
                <span class="text-3xl text-[var(--dim)]"> / {result.max}</span>
              </div>
            </div>
            <div>
              <div class="text-xs uppercase tracking-[0.15em] text-[var(--dim)]">
                Suggested tier
              </div>
              <div class="display mt-2 text-3xl">
                {result.level === "beginner"
                  ? "Beginner"
                  : result.level === "advanced"
                    ? "Advanced"
                    : "Expert"}
              </div>
            </div>
            <div>
              <div class="text-xs uppercase tracking-[0.15em] text-[var(--dim)]">Read time</div>
              <div class="display mt-2 text-3xl">≈ 6 min</div>
              <div class="text-xs text-[var(--ink-2)]">to address gaps</div>
            </div>
          </div>

          <div class="mt-8 border-t hairline pt-6">
            <h3 class="display text-2xl">{result.headline}</h3>
            <p class="mt-3 text-[var(--ink-2)]">{result.recommendation}</p>
          </div>

          <div class="mt-8 flex flex-wrap gap-3">
            {result.nextPath.map((n, i) => (
              <a href={url(n.href)} class={i === 0 ? "btn btn-primary" : "btn btn-secondary"}>
                {n.label} →
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
