import type { ComponentChildren } from "preact";
import { useEffect, useMemo, useState } from "preact/hooks";
import {
  categoryMeta,
  type LocationRow,
  axisMeta as locAxis,
  locations,
  resistanceLabel,
} from "~/data/locations";

import {
  type Adversary,
  adversaryMeta,
  recommend,
  reminderCadence,
  type Stakes,
  type StrategyKey,
  stakesMeta,
  strategies,
  type Tier,
  tierMeta,
  type Usage,
  usageMeta,
} from "~/data/strategies";
import { url } from "~/lib/url";

type InheritancePattern = "sealed-letter" | "trustee" | "none";

type State = {
  tier: Tier | null;
  usage: Usage | null;
  stakes: Stakes | null;
  adversary: Adversary | null;
  strategyKey: StrategyKey | null;
  locationSlugs: string[];
  inheritance: InheritancePattern | null;
  inheritanceContact: string;
  reminderTest: string;
  reminderReview: string;
};

// localStorage key is bumped (v1 → v2) because the State shape changed.
// Old persisted state would hydrate with `usage`/`adversary` as undefined,
// then break the gating logic; safer to start fresh.
const STORAGE_KEY = "hsc.wizard.v2";

const initialState: State = {
  tier: null,
  usage: null,
  stakes: null,
  adversary: null,
  strategyKey: null,
  locationSlugs: [],
  inheritance: null,
  inheritanceContact: "",
  reminderTest: "",
  reminderReview: "",
};

const steps = [
  { key: "tier", label: "Level" },
  { key: "usage", label: "Usage" },
  { key: "stakes", label: "Stakes" },
  { key: "adversary", label: "Threat" },
  { key: "strategy", label: "Strategy" },
  { key: "locations", label: "Locations" },
  { key: "inheritance", label: "Inheritance" },
  { key: "reminders", label: "Reminders" },
  { key: "summary", label: "Summary" },
] as const;

export default function SetupWizard({ initialTier }: { initialTier?: string }) {
  const [state, setState] = useState<State>(initialState);
  const [stepIdx, setStepIdx] = useState(0);
  const [hydrated, setHydrated] = useState(false);

  // hydrate from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setState({ ...initialState, ...parsed.state });
        // Clamp persisted stepIdx — stale or hand-edited storage shouldn't
        // crash later reads of `steps[stepIdx]`.
        const persisted = Number(parsed.stepIdx);
        const safeIdx = Number.isInteger(persisted)
          ? Math.min(Math.max(persisted, 0), steps.length - 1)
          : 0;
        setStepIdx(safeIdx);
      } else if (
        initialTier &&
        (initialTier === "beginner" || initialTier === "advanced" || initialTier === "expert")
      ) {
        setState((s) => ({ ...s, tier: initialTier as Tier }));
        setStepIdx(1);
      }
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  // persist
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ state, stepIdx }));
    } catch {}
  }, [state, stepIdx, hydrated]);

  const recommended = useMemo(() => {
    if (!state.tier || !state.stakes || !state.usage || !state.adversary) return null;
    return recommend(state.tier, state.stakes, state.usage, state.adversary);
  }, [state.tier, state.stakes, state.usage, state.adversary]);

  // Auto-select recommended strategy when entering the strategy step for the first time
  useEffect(() => {
    if (steps[stepIdx].key === "strategy" && recommended && !state.strategyKey) {
      setState((s) => ({ ...s, strategyKey: recommended.primary }));
    }
  }, [stepIdx, recommended]);

  const strategy = state.strategyKey ? strategies[state.strategyKey] : null;

  // Pre-fill reminders when strategy is picked
  useEffect(() => {
    if (state.stakes && !state.reminderTest) {
      const cad = reminderCadence[state.stakes];
      setState((s) => ({
        ...s,
        reminderTest: cad.test,
        reminderReview: cad.review,
      }));
    }
  }, [state.stakes]);

  function update<K extends keyof State>(key: K, value: State[K]) {
    setState((s) => ({ ...s, [key]: value }));
  }

  function next() {
    setStepIdx((i) => Math.min(i + 1, steps.length - 1));
    scrollToTop();
  }
  function prev() {
    setStepIdx((i) => Math.max(i - 1, 0));
    scrollToTop();
  }
  function goTo(idx: number) {
    if (idx <= maxReachableStep()) {
      setStepIdx(idx);
      scrollToTop();
    }
  }
  function reset() {
    if (!confirm("Reset the wizard and start over?")) return;
    localStorage.removeItem(STORAGE_KEY);
    setState(initialState);
    setStepIdx(0);
    scrollToTop();
  }

  function scrollToTop() {
    if (typeof window !== "undefined") {
      const el = document.getElementById("wizard-top");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  // Step-by-step gating: you can move to step N only if N-1 is satisfied.
  // For strategies that need no physical locations (e.g. exchange custody),
  // the locations step is informational only and doesn't gate progression.
  function maxReachableStep() {
    if (!state.tier) return 0;
    if (!state.usage) return 1;
    if (!state.stakes) return 2;
    if (!state.adversary) return 3;
    if (!state.strategyKey) return 4;
    const locsNeeded = strategy?.locationsNeeded ?? 0;
    if (locsNeeded > 0 && state.locationSlugs.length === 0) return 5;
    if (!state.inheritance) return 6;
    return steps.length - 1;
  }

  const currentStep = steps[stepIdx].key;
  const canNext = (() => {
    switch (currentStep) {
      case "tier":
        return !!state.tier;
      case "usage":
        return !!state.usage;
      case "stakes":
        return !!state.stakes;
      case "adversary":
        return !!state.adversary;
      case "strategy":
        return !!state.strategyKey;
      case "locations":
        return strategy ? state.locationSlugs.length >= strategy.locationsNeeded : false;
      case "inheritance":
        return !!state.inheritance;
      case "reminders":
        return true;
      case "summary":
        return false;
    }
  })();

  if (!hydrated) {
    return (
      <div class="glass min-h-[400px] rounded-3xl p-10 text-center text-[var(--dim)]">Loading…</div>
    );
  }

  return (
    <div id="wizard-top">
      <Stepper steps={steps} current={stepIdx} maxReachable={maxReachableStep()} goTo={goTo} />

      <div class="mt-8">
        {currentStep === "tier" && (
          <StepTier value={state.tier} onChange={(v) => update("tier", v)} />
        )}
        {currentStep === "usage" && (
          <StepUsage value={state.usage} onChange={(v) => update("usage", v)} />
        )}
        {currentStep === "stakes" && (
          <StepStakes value={state.stakes} onChange={(v) => update("stakes", v)} />
        )}
        {currentStep === "adversary" && (
          <StepAdversary value={state.adversary} onChange={(v) => update("adversary", v)} />
        )}
        {currentStep === "strategy" && state.tier && state.stakes && recommended && (
          <StepStrategy
            tier={state.tier}
            stakes={state.stakes}
            recommended={recommended}
            value={state.strategyKey}
            onChange={(v) => update("strategyKey", v)}
          />
        )}
        {currentStep === "locations" && strategy && state.stakes && (
          <StepLocations
            strategy={strategy}
            stakes={state.stakes}
            value={state.locationSlugs}
            onChange={(v) => update("locationSlugs", v)}
          />
        )}
        {currentStep === "inheritance" && (
          <StepInheritance
            value={state.inheritance}
            contact={state.inheritanceContact}
            onChange={(v) => update("inheritance", v)}
            onContact={(v) => update("inheritanceContact", v)}
          />
        )}
        {currentStep === "reminders" && (
          <StepReminders
            test={state.reminderTest}
            review={state.reminderReview}
            onChange={(t, r) => {
              update("reminderTest", t);
              update("reminderReview", r);
            }}
          />
        )}
        {currentStep === "summary" && state.tier && state.stakes && strategy && (
          <StepSummary state={state} strategy={strategy} />
        )}
      </div>

      <div class="mt-10 flex flex-wrap items-center justify-between gap-3">
        <button onClick={reset} class="btn btn-ghost btn-sm">
          ↺ Restart
        </button>
        <div class="flex gap-3">
          {stepIdx > 0 && (
            <button onClick={prev} class="btn btn-secondary">
              ← Back
            </button>
          )}
          {currentStep !== "summary" && (
            <button
              onClick={next}
              disabled={!canNext}
              class="btn btn-primary"
              style={!canNext ? "opacity: 0.4; cursor: not-allowed;" : ""}
            >
              Continue →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Stepper
   ============================================================ */
function Stepper({
  steps,
  current,
  maxReachable,
  goTo,
}: {
  steps: readonly { key: string; label: string }[];
  current: number;
  maxReachable: number;
  goTo: (i: number) => void;
}) {
  return (
    <ol class="glass flex flex-wrap items-center gap-1 rounded-full p-1.5 text-xs">
      {steps.map((s, i) => {
        const reachable = i <= maxReachable;
        const active = i === current;
        return (
          <li>
            <button
              onClick={() => goTo(i)}
              disabled={!reachable}
              class={`rounded-full px-3 py-1.5 transition ${
                active
                  ? "bg-[var(--ink)] text-white"
                  : reachable
                    ? "text-[var(--ink-2)] hover:bg-white/70"
                    : "text-[var(--dimmer)] cursor-not-allowed"
              }`}
            >
              <span class="mr-1.5 inline-block opacity-60">{String(i + 1).padStart(2, "0")}</span>
              {s.label}
            </button>
          </li>
        );
      })}
    </ol>
  );
}

/* ============================================================
   Step 1: Tier
   ============================================================ */
function StepTier({ value, onChange }: { value: Tier | null; onChange: (v: Tier) => void }) {
  return (
    <section class="glass rounded-3xl p-8 md:p-10">
      <div class="pill">
        <span>Step 1 · Your level</span>
      </div>
      <h2 class="display mt-6 text-3xl leading-tight md:text-5xl">
        How comfortable are you
        <span class="stat-grad italic"> with self-custody?</span>
      </h2>
      <p class="mt-4 text-[var(--ink-2)]">
        Honest answer. You can also{" "}
        <a
          href={url("/app/quiz/knowledge")}
          class="text-[var(--accent)] hover:text-[var(--accent-deep)]"
        >
          take the knowledge quiz
        </a>{" "}
        to find out — it pre-fills this step.
      </p>

      <div class="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        {(Object.keys(tierMeta) as Tier[]).map((t) => {
          const m = tierMeta[t];
          const active = value === t;
          return (
            <button
              onClick={() => onChange(t)}
              class={`glass-dark rounded-2xl p-6 text-left transition hover:bg-white/40 ${
                active ? "ring-2 ring-[var(--accent)] shadow-lg" : ""
              }`}
            >
              <div class="text-xs uppercase tracking-[0.15em] text-[var(--ice-deep)]">Tier</div>
              <div class="display mt-2 text-2xl">{m.label}</div>
              <div class="mt-1 text-sm text-[var(--ink)]">{m.sub}</div>
              <p class="mt-4 text-xs leading-relaxed text-[var(--ink-2)]">{m.hint}</p>
            </button>
          );
        })}
      </div>
    </section>
  );
}

/* ============================================================
   Step 2: Usage
   ============================================================ */
function StepUsage({ value, onChange }: { value: Usage | null; onChange: (v: Usage) => void }) {
  return (
    <section class="glass rounded-3xl p-8 md:p-10">
      <div class="pill">
        <span>Step 2 · Usage</span>
      </div>
      <h2 class="display mt-6 text-3xl leading-tight md:text-5xl">
        How will you
        <span class="stat-grad italic"> actually use it?</span>
      </h2>
      <p class="mt-4 text-[var(--ink-2)]">
        The right setup is different for someone who trades weekly than for someone who's
        bought-and-forgotten. This is the single biggest swing factor in the recommendation.
      </p>

      <div class="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        {(Object.keys(usageMeta) as Usage[]).map((u) => {
          const m = usageMeta[u];
          const active = value === u;
          return (
            <button
              onClick={() => onChange(u)}
              class={`glass-dark rounded-2xl p-6 text-left transition hover:bg-white/40 ${
                active ? "ring-2 ring-[var(--accent)] shadow-lg" : ""
              }`}
            >
              <div class="text-xs uppercase tracking-[0.15em] text-[var(--ice-deep)]">Pattern</div>
              <div class="display mt-2 text-2xl">{m.label}</div>
              <div class="mt-1 text-sm text-[var(--ink)]">{m.sub}</div>
              <p class="mt-4 text-xs leading-relaxed text-[var(--ink-2)]">{m.hint}</p>
            </button>
          );
        })}
      </div>
    </section>
  );
}

/* ============================================================
   Step 3: Stakes
   ============================================================ */
function StepStakes({ value, onChange }: { value: Stakes | null; onChange: (v: Stakes) => void }) {
  return (
    <section class="glass rounded-3xl p-8 md:p-10">
      <div class="pill">
        <span>Step 3 · The stakes</span>
      </div>
      <h2 class="display mt-6 text-3xl leading-tight md:text-5xl">
        How bad would
        <span class="stat-grad italic"> losing it </span>
        be?
      </h2>
      <p class="mt-4 text-[var(--ink-2)]">
        The right setup is the one matched to the consequence of losing it, not the size of the
        holding in absolute terms.
      </p>

      <div class="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        {(Object.keys(stakesMeta) as Stakes[]).map((s) => {
          const m = stakesMeta[s];
          const active = value === s;
          return (
            <button
              onClick={() => onChange(s)}
              class={`glass-dark rounded-2xl p-6 text-left transition hover:bg-white/40 ${
                active ? "ring-2 ring-[var(--accent)] shadow-lg" : ""
              }`}
            >
              <div class="text-xs uppercase tracking-[0.15em] text-[var(--ice-deep)]">
                {m.range}
              </div>
              <div class="display mt-2 text-2xl">{m.label}</div>
              <div class="mt-1 text-sm text-[var(--ink)]">{m.sub}</div>
              <p class="mt-4 text-xs leading-relaxed text-[var(--ink-2)]">{m.hint}</p>
            </button>
          );
        })}
      </div>
    </section>
  );
}

/* ============================================================
   Step 4: Adversary
   ============================================================ */
function StepAdversary({
  value,
  onChange,
}: {
  value: Adversary | null;
  onChange: (v: Adversary) => void;
}) {
  return (
    <section class="glass rounded-3xl p-8 md:p-10">
      <div class="pill">
        <span>Step 4 · Threat model</span>
      </div>
      <h2 class="display mt-6 text-3xl leading-tight md:text-5xl">
        Who's
        <span class="stat-grad italic"> coming after this?</span>
      </h2>
      <p class="mt-4 max-w-2xl text-[var(--ink-2)]">
        Most attacks against most people are opportunistic. If you're a visible or specific target,
        the setup escalates — one compromised key shouldn't be enough.
      </p>

      <div class="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
        {(Object.keys(adversaryMeta) as Adversary[]).map((a) => {
          const m = adversaryMeta[a];
          const active = value === a;
          return (
            <button
              onClick={() => onChange(a)}
              class={`glass-dark rounded-2xl p-6 text-left transition hover:bg-white/40 ${
                active ? "ring-2 ring-[var(--accent)] shadow-lg" : ""
              }`}
            >
              <div class="text-xs uppercase tracking-[0.15em] text-[var(--ice-deep)]">
                Threat model
              </div>
              <div class="display mt-2 text-2xl">{m.label}</div>
              <div class="mt-1 text-sm text-[var(--ink)]">{m.sub}</div>
              <p class="mt-4 text-xs leading-relaxed text-[var(--ink-2)]">{m.hint}</p>
            </button>
          );
        })}
      </div>
    </section>
  );
}

/* ============================================================
   Step 5: Strategy
   ============================================================ */
function StepStrategy({
  tier,
  stakes,
  recommended,
  value,
  onChange,
}: {
  tier: Tier;
  stakes: Stakes;
  recommended: { primary: StrategyKey; alt?: StrategyKey; notes?: string[] };
  value: StrategyKey | null;
  onChange: (v: StrategyKey) => void;
}) {
  const allKeys = Object.keys(strategies) as StrategyKey[];
  const ordered = [
    recommended.primary,
    ...(recommended.alt ? [recommended.alt] : []),
    ...allKeys.filter((k) => k !== recommended.primary && k !== recommended.alt),
  ];

  return (
    <section class="glass rounded-3xl p-8 md:p-10">
      <div class="pill">
        <span>Step 5 · Strategy</span>
      </div>
      <h2 class="display mt-6 text-3xl leading-tight md:text-5xl">
        For
        <span class="stat-grad italic"> {tierMeta[tier].label} </span>×{" "}
        <span class="stat-grad italic">{stakesMeta[stakes].label}</span>, we recommend:
      </h2>

      {recommended.notes && recommended.notes.length > 0 && (
        <div class="mt-6 space-y-2 border-l-2 border-[var(--accent)]/40 pl-4">
          {recommended.notes.map((n) => (
            <p class="text-sm leading-relaxed text-[var(--ink-2)]">{n}</p>
          ))}
        </div>
      )}

      <div class="mt-8 space-y-4">
        {ordered.map((k) => {
          const s = strategies[k];
          const isPrimary = k === recommended.primary;
          const isAlt = k === recommended.alt;
          const selected = value === k;
          return (
            <button
              onClick={() => onChange(k)}
              class={`glass-dark relative w-full rounded-2xl p-6 text-left transition hover:bg-white/40 ${
                selected ? "ring-2 ring-[var(--accent)] shadow-lg" : ""
              }`}
            >
              <div class="flex flex-wrap items-baseline justify-between gap-2">
                <div class="display text-xl md:text-2xl">{s.name}</div>
                <div class="flex gap-2">
                  {isPrimary && <span class="tag tag-accent">Recommended</span>}
                  {isAlt && <span class="tag tag-neutral">Also reasonable</span>}
                </div>
              </div>
              <p class="mt-2 text-sm text-[var(--ink-2)]">{s.oneLiner}</p>

              <div class="mt-5 grid grid-cols-2 gap-4 text-xs md:grid-cols-4">
                <div>
                  <div class="text-[var(--dim)]">Cost</div>
                  <div class="display mt-1 text-base">{s.approxCost}</div>
                </div>
                <div>
                  <div class="text-[var(--dim)]">Setup</div>
                  <div class="display mt-1 text-base">{s.approxSetup}</div>
                </div>
                <div>
                  <div class="text-[var(--dim)]">Locations needed</div>
                  <div class="display mt-1 text-base">{s.locationsNeeded}</div>
                </div>
                <div>
                  <div class="text-[var(--dim)]">Survivability</div>
                  <div class="display stat-grad mt-1 text-base">{s.survivability}</div>
                </div>
              </div>

              <div class="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
                <DefenseBar axis="loss" rating={s.lossDefense} note={s.lossNote} />
                <DefenseBar axis="theft" rating={s.theftDefense} note={s.theftNote} />
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function DefenseBar({
  axis,
  rating,
  note,
}: {
  axis: "loss" | "theft";
  rating: 1 | 2 | 3;
  note: string;
}) {
  const label = axis === "loss" ? "Loss-of-access defense" : "Theft & coercion defense";
  const tone = axis === "loss" ? "bg-[var(--accent)]" : "bg-[var(--warn)]";
  return (
    <div class="rounded-xl border hairline p-3">
      <div class="flex items-center justify-between">
        <div class="text-[11px] uppercase tracking-[0.15em] text-[var(--dim)]">{label}</div>
        <div class="flex gap-1">
          {[1, 2, 3].map((i) => (
            <span
              class={`h-1.5 w-6 rounded-full ${i <= rating ? tone : "bg-[var(--hairline)]"}`}
            ></span>
          ))}
        </div>
      </div>
      <p class="mt-2 text-xs leading-relaxed text-[var(--ink-2)]">{note}</p>
    </div>
  );
}

/* ============================================================
   Step 6: Locations
   ============================================================ */
function StepLocations({
  strategy,
  stakes,
  value,
  onChange,
}: {
  strategy: { locationsNeeded: number; name: string };
  stakes: Stakes;
  value: string[];
  onChange: (slugs: string[]) => void;
}) {
  function toggle(slug: string) {
    if (value.includes(slug)) {
      onChange(value.filter((s) => s !== slug));
    } else {
      onChange([...value, slug]);
    }
  }

  const filtered = locations.filter(
    (l) => l.bestFor.length > 0 && l.recommendedFor.includes(stakes),
  );
  const remaining = locations.filter((l) => !filtered.find((f) => f.slug === l.slug));

  const have = value.length;
  const need = strategy.locationsNeeded;

  // Strategies like "keep-on-exchange" have no physical backup locations to
  // pick — the custody is the exchange's. Render a different shell that
  // explains this and lets the user continue.
  if (need === 0) {
    return (
      <section class="glass rounded-3xl p-8 md:p-10">
        <div class="pill">
          <span>Step 6 · Locations</span>
        </div>
        <h2 class="display mt-6 text-3xl leading-tight md:text-5xl">
          <span class="stat-grad italic">No physical locations</span> to pick.
        </h2>
        <p class="mt-4 max-w-2xl text-[var(--ink-2)]">
          Your chosen strategy keeps the funds with the exchange, so there's no seed phrase to back
          up and no plates to distribute. What matters instead is the account-recovery surface:
        </p>
        <ul class="mt-6 space-y-3 text-sm text-[var(--ink-2)]">
          <li class="flex items-start gap-2">
            <span class="mt-0.5 text-[var(--accent)]">·</span>
            <span>
              Hardware 2FA on the exchange account (YubiKey, not SMS) and the same on the email used
              to recover it.
            </span>
          </li>
          <li class="flex items-start gap-2">
            <span class="mt-0.5 text-[var(--accent)]">·</span>
            <span>
              2FA backup codes printed and stored somewhere your future self can find them.
            </span>
          </li>
          <li class="flex items-start gap-2">
            <span class="mt-0.5 text-[var(--accent)]">·</span>
            <span>Withdrawal address whitelisting where the exchange supports it.</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="mt-0.5 text-[var(--accent)]">·</span>
            <span>
              A clear rule for yourself: any balance you'd genuinely miss losing gets moved off the
              exchange.
            </span>
          </li>
        </ul>
        <p class="mt-6 max-w-2xl text-sm text-[var(--dim)]">
          When you outgrow this — bigger balance, longer hold horizon — come back and re-run the
          wizard. The recommendation will change.
        </p>
      </section>
    );
  }

  return (
    <section class="glass rounded-3xl p-8 md:p-10">
      <div class="pill">
        <span>Step 6 · Locations</span>
      </div>
      <h2 class="display mt-6 text-3xl leading-tight md:text-5xl">
        Pick
        <span class="stat-grad italic"> {need} </span>
        {need === 1 ? "location" : "locations"}.
      </h2>
      <p class="mt-4 text-[var(--ink-2)]">
        Each will hold one copy of the backup. Filtered to the options most commonly used at your
        stakes; you can always add others from the{" "}
        <a
          href={url("/app/locations")}
          class="text-[var(--accent)] hover:text-[var(--accent-deep)]"
        >
          full database
        </a>
        .
      </p>

      <div class="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div class="text-sm text-[var(--ink-2)]">
          <span class="display stat-grad text-2xl">{have}</span> of {need} selected
          {have > need && <span class="ml-2 text-[var(--dim)]">— extras are fine</span>}
        </div>
        {have >= need && <span class="tag tag-ok">Enough to continue</span>}
      </div>

      <div class="mt-6 space-y-3">
        {filtered.map((l) => (
          <LocationCard l={l} selected={value.includes(l.slug)} onToggle={() => toggle(l.slug)} />
        ))}
      </div>

      {remaining.length > 0 && (
        <details class="mt-6 group">
          <summary class="cursor-pointer text-sm text-[var(--ink-2)] hover:text-[var(--ink)]">
            <span class="text-[var(--accent)] group-open:rotate-45 inline-block transition">+</span>{" "}
            Show {remaining.length} more options not typically recommended at your stakes
          </summary>
          <div class="mt-4 space-y-3">
            {remaining.map((l) => (
              <LocationCard
                l={l}
                selected={value.includes(l.slug)}
                onToggle={() => toggle(l.slug)}
                compact
              />
            ))}
          </div>
        </details>
      )}
    </section>
  );
}

function LocationCard({
  l,
  selected,
  onToggle,
  compact,
}: {
  l: LocationRow;
  selected: boolean;
  onToggle: () => void;
  compact?: boolean;
}) {
  return (
    <button
      onClick={onToggle}
      class={`glass-dark relative w-full rounded-2xl p-5 text-left transition hover:bg-white/40 ${
        selected ? "ring-2 ring-[var(--accent)] shadow-md" : ""
      }`}
    >
      <div class="flex flex-wrap items-baseline justify-between gap-2">
        <div class="flex items-baseline gap-3">
          <span class="text-xl">{categoryMeta[l.category].emoji}</span>
          <div>
            <div class="display text-lg">{l.name}</div>
            <div class="text-xs text-[var(--dim)]">{categoryMeta[l.category].label}</div>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-[11px] text-[var(--dim)]">{l.costAnnualUsd}</span>
          {selected && <span class="tag tag-accent">Selected</span>}
        </div>
      </div>

      <p class={`mt-3 text-sm text-[var(--ink-2)] ${compact ? "line-clamp-2" : ""}`}>{l.tagline}</p>

      <div class="mt-4 grid grid-cols-2 gap-3">
        <AxisRow axis="loss" rating={l.lossResistance} />
        <AxisRow axis="theft" rating={l.theftResistance} />
      </div>
    </button>
  );
}

function AxisRow({ axis, rating }: { axis: "loss" | "theft"; rating: number }) {
  const label = axis === "loss" ? locAxis.loss.short : locAxis.theft.short;
  const fullLabel = axis === "loss" ? locAxis.loss.label : locAxis.theft.label;
  const tone = axis === "loss" ? "bg-[var(--accent)]" : "bg-[var(--warn)]";
  return (
    <div class="flex items-center gap-3" title={fullLabel}>
      <div class="text-[11px] uppercase tracking-[0.15em] text-[var(--dim)] w-12 shrink-0">
        {label}
      </div>
      <div class="flex gap-0.5">
        {[1, 2, 3].map((i) => (
          <span
            class={`h-1.5 w-4 rounded-full ${i <= rating ? tone : "bg-[var(--hairline)]"}`}
          ></span>
        ))}
      </div>
      <div class="text-[11px] text-[var(--ink-2)]">{resistanceLabel(rating as 0 | 1 | 2 | 3)}</div>
    </div>
  );
}

/* ============================================================
   Step 7: Inheritance
   ============================================================ */
function StepInheritance({
  value,
  contact,
  onChange,
  onContact,
}: {
  value: InheritancePattern | null;
  contact: string;
  onChange: (v: InheritancePattern) => void;
  onContact: (v: string) => void;
}) {
  return (
    <section class="glass rounded-3xl p-8 md:p-10">
      <div class="pill">
        <span>Step 7 · Inheritance</span>
      </div>
      <h2 class="display mt-6 text-3xl leading-tight md:text-5xl">
        What happens
        <span class="stat-grad italic"> if you're not around?</span>
      </h2>
      <p class="mt-4 text-[var(--ink-2)]">
        The hardest custody question. Pick a pattern; we'll include it in the summary.
      </p>

      <div class="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        {(
          [
            {
              key: "sealed-letter",
              label: "Sealed letter pattern",
              sub: "Attorney holds a sealed envelope with location + procedure.",
              body: "Free or low cost. Requires one trusted helper (technical) to be reachable. Rehearse once.",
            },
            {
              key: "trustee",
              label: "Multisig with trustee",
              sub: "Regulated firm holds one key. Heir-initiated recovery, no exposure of seeds.",
              body: "Annual fee, but the cleanest inheritance flow. Best for life-defining holdings.",
            },
            {
              key: "none",
              label: "Skip for now",
              sub: "Decide later. Marked as a gap in the summary.",
              body: "Acceptable as a temporary state. The summary will flag it as the next thing to address.",
            },
          ] as { key: InheritancePattern; label: string; sub: string; body: string }[]
        ).map((o) => {
          const active = value === o.key;
          return (
            <button
              onClick={() => onChange(o.key)}
              class={`glass-dark rounded-2xl p-6 text-left transition hover:bg-white/40 ${
                active ? "ring-2 ring-[var(--accent)] shadow-lg" : ""
              }`}
            >
              <div class="text-xs uppercase tracking-[0.15em] text-[var(--ice-deep)]">Pattern</div>
              <div class="display mt-2 text-xl">{o.label}</div>
              <div class="mt-1 text-sm text-[var(--ink)]">{o.sub}</div>
              <p class="mt-3 text-xs leading-relaxed text-[var(--ink-2)]">{o.body}</p>
            </button>
          );
        })}
      </div>

      {value && value !== "none" && (
        <div class="mt-8">
          <label class="label" for="contact">
            {value === "sealed-letter"
              ? "Who will hold the sealed letter? (attorney, relative, name)"
              : "Which trustee are you considering? (firm name)"}
          </label>
          <input
            id="contact"
            class="input max-w-md"
            value={contact}
            onInput={(e) => onContact((e.target as HTMLInputElement).value)}
            placeholder={
              value === "sealed-letter"
                ? "e.g. M. Stein, Stein & Co. (NYC)"
                : "e.g. Casa, Unchained, Nunchuk"
            }
          />
          <p class="mt-2 text-xs text-[var(--dim)]">
            Used in the summary. Stored only in your browser; never sent anywhere.
          </p>
        </div>
      )}
    </section>
  );
}

/* ============================================================
   Step 8: Reminders
   ============================================================ */
function StepReminders({
  test,
  review,
  onChange,
}: {
  test: string;
  review: string;
  onChange: (t: string, r: string) => void;
}) {
  return (
    <section class="glass rounded-3xl p-8 md:p-10">
      <div class="pill">
        <span>Step 8 · Reminders</span>
      </div>
      <h2 class="display mt-6 text-3xl leading-tight md:text-5xl">
        Schedule the
        <span class="stat-grad italic"> rehearsals.</span>
      </h2>
      <p class="mt-4 text-[var(--ink-2)]">
        Pre-filled from your stakes. Adjust freely. Both are calendar reminders only — we don't have
        your data.
      </p>

      <div class="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div class="glass-dark rounded-2xl p-6">
          <div class="text-xs uppercase tracking-[0.15em] text-[var(--ice-deep)]">
            Recovery test
          </div>
          <div class="display mt-2 text-xl">Restore + verify, then wipe.</div>
          <p class="mt-2 text-sm text-[var(--ink-2)]">Confirms your backup actually works.</p>
          <label class="label mt-4" for="r-test">
            Cadence
          </label>
          <select
            id="r-test"
            class="input"
            value={test}
            onChange={(e) => onChange((e.target as HTMLSelectElement).value, review)}
          >
            <option value="every 6 months">every 6 months</option>
            <option value="annually">annually</option>
            <option value="every 2 years">every 2 years</option>
          </select>
        </div>

        <div class="glass-dark rounded-2xl p-6">
          <div class="text-xs uppercase tracking-[0.15em] text-[var(--ice-deep)]">Setup review</div>
          <div class="display mt-2 text-xl">Walk through every location + contact.</div>
          <p class="mt-2 text-sm text-[var(--ink-2)]">
            Catches stale assumptions when life changes.
          </p>
          <label class="label mt-4" for="r-review">
            Cadence
          </label>
          <select
            id="r-review"
            class="input"
            value={review}
            onChange={(e) => onChange(test, (e.target as HTMLSelectElement).value)}
          >
            <option value="annually">annually</option>
            <option value="every 2 years">every 2 years</option>
          </select>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   Step 9: Summary
   ============================================================ */
function StepSummary({
  state,
  strategy,
}: {
  state: State;
  strategy: ReturnType<typeof getStrategy>;
}) {
  if (!strategy || !state.tier || !state.stakes) return null;

  const tier = tierMeta[state.tier];
  const stakes = stakesMeta[state.stakes];
  const pickedLocations = state.locationSlugs
    .map((s) => locations.find((l) => l.slug === s))
    .filter(Boolean) as LocationRow[];

  return (
    <section class="glass rounded-3xl p-8 md:p-12 print:bg-white print:shadow-none">
      <div class="flex flex-wrap items-baseline justify-between gap-3">
        <div class="pill">
          <span class="pill-dot"></span> Your plan · saved locally
        </div>
        <button onClick={() => window.print()} class="btn btn-secondary btn-sm">
          🖨 Print
        </button>
      </div>

      <h2 class="display mt-6 text-3xl leading-tight md:text-5xl">
        Your setup plan,
        <span class="stat-grad italic"> in one page.</span>
      </h2>

      <div class="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
        <SummaryStat label="Tier" value={tier.label} />
        <SummaryStat label="Stakes" value={stakes.label} />
        <SummaryStat label="Strategy" value={strategy.name} />
      </div>

      <SummaryBlock title="The strategy">
        <p>{strategy.oneLiner}</p>
        <ul class="mt-4 grid grid-cols-1 gap-2 md:grid-cols-2">
          {strategy.components.map((c) => (
            <li class="flex items-start gap-2">
              <span class="mt-0.5 text-[var(--accent)]">·</span>
              <span>{c}</span>
            </li>
          ))}
        </ul>
        <div class="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
          <DefenseBar axis="loss" rating={strategy.lossDefense} note={strategy.lossNote} />
          <DefenseBar axis="theft" rating={strategy.theftDefense} note={strategy.theftNote} />
        </div>
      </SummaryBlock>

      <SummaryBlock title="Locations">
        {pickedLocations.length === 0 ? (
          <p class="text-[var(--warn)]">No locations selected.</p>
        ) : (
          <ul class="space-y-2">
            {pickedLocations.map((l, i) => (
              <li class="glass-dark rounded-xl p-4">
                <div class="flex items-baseline justify-between gap-2">
                  <div>
                    <span class="text-xs text-[var(--dim)] mr-2">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span class="font-medium">{l.name}</span>
                    <span class="ml-2 text-xs text-[var(--dim)]">
                      {categoryMeta[l.category].label}
                    </span>
                  </div>
                  <span class="text-xs text-[var(--dim)]">{l.costAnnualUsd}</span>
                </div>
                <p class="mt-2 text-xs text-[var(--ink-2)]">{l.tagline}</p>
              </li>
            ))}
          </ul>
        )}
      </SummaryBlock>

      <SummaryBlock title="Inheritance">
        {state.inheritance === "sealed-letter" && (
          <p>
            <strong>Sealed letter</strong> held by{" "}
            <strong>{state.inheritanceContact || "[contact to be named]"}</strong>. Rehearse the
            procedure once with the technical helper.
          </p>
        )}
        {state.inheritance === "trustee" && (
          <p>
            <strong>Multisig with trustee</strong> — considering{" "}
            <strong>{state.inheritanceContact || "[trustee to be named]"}</strong>. Annual fee.
            Heir-initiated recovery procedure.
          </p>
        )}
        {state.inheritance === "none" && (
          <p class="text-[var(--warn)]">
            ⚠ No inheritance plan yet. Mark as the next thing to address.
          </p>
        )}
      </SummaryBlock>

      <SummaryBlock title="Reminders">
        <ul class="space-y-2">
          <li>
            <strong>Recovery test:</strong> {state.reminderTest}. Restore on a fresh, offline
            device. Verify first address. Wipe.
          </li>
          <li>
            <strong>Setup review:</strong> {state.reminderReview}. Walk through every location,
            every contact, every assumption.
          </li>
        </ul>
      </SummaryBlock>

      <SummaryBlock title="Checklist — start this weekend">
        <ol class="space-y-2 text-sm">
          {[
            "Acquire hardware (steel plates, hardware wallets, sealed envelopes).",
            "Generate the wallet offline on a fresh device.",
            "Record the seed by hand onto each medium.",
            "Distribute backups to chosen locations (one trip per location).",
            "Write the inheritance letter / engage trustee.",
            "Test recovery on a fresh device. Wipe.",
            "Calendar the next test (" +
              state.reminderTest +
              ") and review (" +
              state.reminderReview +
              ").",
          ].map((item, i) => (
            <li class="flex items-start gap-2">
              <span class="display stat-grad mt-0.5 w-6 text-base">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ol>
      </SummaryBlock>

      <div class="mt-10 flex flex-wrap items-center justify-between gap-3 border-t hairline pt-6 text-xs text-[var(--dim)]">
        <span>Plan generated locally · stored in your browser only · never sent anywhere</span>
        <span>{new Date().toLocaleDateString()}</span>
      </div>
    </section>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div class="glass-dark rounded-xl p-4">
      <div class="text-xs uppercase tracking-[0.15em] text-[var(--dim)]">{label}</div>
      <div class="display mt-2 text-lg">{value}</div>
    </div>
  );
}

function SummaryBlock({ title, children }: { title: string; children: ComponentChildren }) {
  return (
    <div class="mt-8 border-t hairline pt-6">
      <div class="text-xs uppercase tracking-[0.15em] text-[var(--ice-deep)]">{title}</div>
      <div class="mt-3 text-sm text-[var(--ink-2)]">{children}</div>
    </div>
  );
}

function getStrategy(key: StrategyKey) {
  return strategies[key];
}
