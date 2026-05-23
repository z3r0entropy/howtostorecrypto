import { useMemo, useState } from "preact/hooks";
import {
  axisMeta,
  type Category,
  categoryMeta,
  type LocationRow,
  locations,
  resistanceLabel,
  sitingMeta,
  thirdPartyMeta,
} from "~/data/locations";

type SortKey = "loss" | "theft" | "coercion" | "tamper" | "cost" | "alphabetical";

function priceRank(l: LocationRow): number {
  // Sort by the upper end of the price band so $0 wins decisively.
  return l.priceAnnualUsd.max;
}

export default function LocationsBrowser() {
  const [search, setSearch] = useState("");
  const [activeCats, setActiveCats] = useState<Category[]>([]);
  const [stake, setStake] = useState<"any" | "modest" | "significant" | "life-defining">("any");
  const [sort, setSort] = useState<SortKey>("loss");
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const [hideAntiPatterns, setHideAntiPatterns] = useState(false);

  const cats = Object.keys(categoryMeta) as Category[];

  function toggleCat(c: Category) {
    setActiveCats((curr) => (curr.includes(c) ? curr.filter((x) => x !== c) : [...curr, c]));
  }

  const filtered = useMemo(() => {
    let list = locations.slice();
    if (search.trim()) {
      const s = search.toLowerCase();
      list = list.filter(
        (l) =>
          l.name.toLowerCase().includes(s) ||
          l.tagline.toLowerCase().includes(s) ||
          l.notes?.toLowerCase().includes(s) ||
          l.antiPatternWhy?.toLowerCase().includes(s),
      );
    }
    if (activeCats.length > 0) {
      list = list.filter((l) => activeCats.includes(l.category));
    }
    if (stake !== "any") {
      list = list.filter((l) => l.recommendedFor.includes(stake));
    }
    if (hideAntiPatterns) {
      list = list.filter((l) => !l.isAntiPattern);
    }
    list.sort((a, b) => {
      // Always float anti-patterns to the bottom regardless of sort key.
      // They're documentation, not options.
      const aAnti = a.isAntiPattern ? 1 : 0;
      const bAnti = b.isAntiPattern ? 1 : 0;
      if (aAnti !== bAnti) return aAnti - bAnti;

      switch (sort) {
        case "loss":
          return b.lossResistance - a.lossResistance;
        case "theft":
          return b.theftResistance - a.theftResistance;
        case "tamper":
          return b.tamperEvidence - a.tamperEvidence;
        case "coercion":
          return b.coercionResistance - a.coercionResistance;
        case "cost":
          return priceRank(a) - priceRank(b);
        case "alphabetical":
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
    return list;
  }, [search, activeCats, stake, sort, hideAntiPatterns]);

  const realOptions = filtered.filter((l) => !l.isAntiPattern);
  const antiPatterns = filtered.filter((l) => l.isAntiPattern);

  return (
    <div>
      {/* Controls */}
      <section class="glass rounded-3xl p-6 md:p-8">
        <div class="grid grid-cols-12 gap-4">
          <div class="col-span-12 md:col-span-6">
            <label class="label" for="search">
              Search
            </label>
            <input
              id="search"
              class="input"
              placeholder="bank, attorney, buried, tattoo…"
              value={search}
              onInput={(e) => setSearch((e.target as HTMLInputElement).value)}
            />
          </div>

          <div class="col-span-6 md:col-span-3">
            <label class="label" for="stake">
              Stakes
            </label>
            <select
              id="stake"
              class="input"
              value={stake}
              onChange={(e) => setStake((e.target as HTMLSelectElement).value as any)}
            >
              <option value="any">Any</option>
              <option value="modest">Modest</option>
              <option value="significant">Significant</option>
              <option value="life-defining">Life-defining</option>
            </select>
          </div>

          <div class="col-span-6 md:col-span-3">
            <label class="label" for="sort">
              Sort by
            </label>
            <select
              id="sort"
              class="input"
              value={sort}
              onChange={(e) => setSort((e.target as HTMLSelectElement).value as SortKey)}
            >
              <option value="loss">Loss-of-access (best first)</option>
              <option value="theft">Theft (best first)</option>
              <option value="coercion">Coercion-resistance (best first)</option>
              <option value="tamper">Tamper-evidence (best first)</option>
              <option value="cost">Cost</option>
              <option value="alphabetical">A → Z</option>
            </select>
          </div>
        </div>

        <div class="mt-6">
          <div class="text-xs uppercase tracking-[0.15em] text-[var(--dim)]">Category</div>
          <div class="mt-2 flex flex-wrap gap-2">
            {cats.map((c) => {
              const active = activeCats.includes(c);
              return (
                <button
                  type="button"
                  onClick={() => toggleCat(c)}
                  class={`pill cursor-pointer transition ${
                    active
                      ? "bg-[var(--ink)]! text-white! border-[var(--ink)]!"
                      : "hover:bg-white/80"
                  }`}
                >
                  <span class="text-sm">{categoryMeta[c].emoji}</span>
                  <span>{categoryMeta[c].label}</span>
                </button>
              );
            })}
            {activeCats.length > 0 && (
              <button
                type="button"
                onClick={() => setActiveCats([])}
                class="text-xs text-[var(--accent)] hover:text-[var(--accent-deep)]"
              >
                clear ×
              </button>
            )}
          </div>
        </div>

        <div class="mt-6 flex flex-wrap items-center justify-between gap-3 border-t hairline pt-4 text-xs text-[var(--dim)]">
          <span>
            <span class="display stat-grad text-base">{filtered.length}</span> of {locations.length}{" "}
            locations · <span class="text-[var(--ink-2)]">{realOptions.length} viable</span> ·{" "}
            <span class="text-[var(--warn)]">{antiPatterns.length} anti-patterns</span>
          </span>
          <div class="flex items-center gap-4">
            <label class="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={hideAntiPatterns}
                onChange={(e) => setHideAntiPatterns((e.target as HTMLInputElement).checked)}
              />
              <span>Hide anti-patterns</span>
            </label>
            <span class="flex items-center gap-1.5">
              <span class="size-2 rounded-full" style="background: var(--accent)"></span>
              {axisMeta.loss.short}
            </span>
            <span class="flex items-center gap-1.5">
              <span class="size-2 rounded-full" style="background: var(--warn)"></span>
              {axisMeta.theft.short}
            </span>
            <span class="flex items-center gap-1.5">
              <span class="size-2 rounded-full" style="background: var(--coerce)"></span>
              {axisMeta.coercion.short}
            </span>
            <span class="flex items-center gap-1.5">
              <span class="size-2 rounded-full" style="background: var(--accent-deep)"></span>
              {axisMeta.tamper.short}
            </span>
          </div>
        </div>
      </section>

      {/* Results */}
      <section class="mt-8 space-y-3">
        {filtered.length === 0 ? (
          <div class="glass rounded-2xl p-8 text-center text-[var(--ink-2)]">
            No locations match those filters. Try clearing them.
          </div>
        ) : (
          <>
            {realOptions.map((l) => (
              <LocationRowCard
                key={l.slug}
                l={l}
                open={openSlug === l.slug}
                onToggle={() => setOpenSlug(openSlug === l.slug ? null : l.slug)}
              />
            ))}

            {antiPatterns.length > 0 && (
              <div class="mt-10 mb-4 flex items-baseline gap-3 border-t-2 border-[var(--warn)]/30 pt-8">
                <div class="tag tag-warn">Don't</div>
                <h3 class="display text-xl text-[var(--ink)]">
                  What <em class="italic">not</em> to do
                </h3>
                <p class="ml-auto max-w-md text-right text-xs text-[var(--ink-2)]">
                  These are documented "clever ideas" that fail in practice. Each entry exists so
                  the next person who has the same thought lands here first.
                </p>
              </div>
            )}
            {antiPatterns.map((l) => (
              <LocationRowCard
                key={l.slug}
                l={l}
                open={openSlug === l.slug}
                onToggle={() => setOpenSlug(openSlug === l.slug ? null : l.slug)}
              />
            ))}
          </>
        )}
      </section>
    </div>
  );
}

function LocationRowCard({
  l,
  open,
  onToggle,
}: {
  l: LocationRow;
  open: boolean;
  onToggle: () => void;
}) {
  const anti = l.isAntiPattern === true;
  const ringClass = anti
    ? "ring-2 ring-[var(--warn)]/40 bg-[rgba(196,92,58,0.04)]"
    : open
      ? "ring-1 ring-[var(--accent)]/30"
      : "";

  return (
    <article class={`glass rounded-2xl transition ${ringClass}`}>
      <button
        type="button"
        onClick={onToggle}
        class="grid w-full grid-cols-12 items-center gap-3 p-5 text-left md:p-6"
      >
        <div class="col-span-12 md:col-span-5">
          <div class="flex items-baseline gap-3">
            <span class="text-xl">{categoryMeta[l.category].emoji}</span>
            <div>
              <div class="flex flex-wrap items-baseline gap-2">
                <span class="display text-lg leading-tight">{l.name}</span>
                {anti && <span class="tag tag-warn">Don't</span>}
                {l.groupSlug && !anti && (
                  <span class="tag tag-neutral">variant · {l.groupSlug}</span>
                )}
              </div>
              <div class="text-xs text-[var(--dim)]">{categoryMeta[l.category].label}</div>
            </div>
          </div>
          {anti && l.antiPatternWhy ? (
            <p class="mt-3 text-sm font-medium text-[var(--warn)] md:max-w-md">
              {l.antiPatternWhy}
            </p>
          ) : (
            <p class="mt-3 text-sm text-[var(--ink-2)] md:max-w-md">{l.tagline}</p>
          )}
        </div>

        <div class="col-span-6 md:col-span-2">
          <AxisStrip axis="loss" rating={l.lossResistance} />
        </div>
        <div class="col-span-6 md:col-span-2">
          <AxisStrip axis="theft" rating={l.theftResistance} />
        </div>

        <div class="col-span-12 md:col-span-2 md:text-right">
          <div class="text-xs text-[var(--dim)]">Cost</div>
          <div class="display text-base">{l.costAnnualUsd}</div>
        </div>

        <div class="col-span-12 md:col-span-1 md:text-right">
          <span class={`inline-block transition ${open ? "rotate-90" : ""}`}>›</span>
        </div>
      </button>

      {open && (
        <div class="border-t hairline px-5 pb-6 pt-4 md:px-6">
          {/* Anti-pattern banner */}
          {anti && (
            <div class="mb-6 rounded-xl border border-[var(--warn)]/30 bg-[rgba(196,92,58,0.08)] p-4 text-sm">
              <div class="text-[10px] uppercase tracking-[0.15em] text-[var(--warn)]">
                Anti-pattern · do not use
              </div>
              <p class="mt-2 font-medium text-[var(--ink)]">{l.antiPatternWhy}</p>
              <p class="mt-2 text-[var(--ink-2)]">{l.tagline}</p>
            </div>
          )}

          {/* Four-axis grid */}
          <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
            <AxisDetail
              label={axisMeta.loss.label}
              color="var(--accent)"
              rating={l.lossResistance}
              prose={l.lossNotes}
              extra={
                <>
                  fire {resistanceLabel(l.fire)} · water {resistanceLabel(l.water)}
                </>
              }
            />
            <AxisDetail
              label={axisMeta.theft.label}
              color="var(--warn)"
              rating={l.theftResistance}
              prose={l.theftNotes}
            />
            <AxisDetail
              label={axisMeta.coercion.label}
              color="var(--coerce)"
              rating={l.coercionResistance}
              prose={l.coercionNotes}
            />
            <AxisDetail
              label={axisMeta.tamper.label}
              color="var(--accent-deep)"
              rating={l.tamperEvidence}
              prose={l.tamperEvidenceNotes}
            />
          </div>

          {/* Pros / cons */}
          <div class="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <div class="text-xs uppercase tracking-[0.15em] text-[var(--ok)]">Pros</div>
              <ul class="mt-2 space-y-1 text-sm">
                {l.pros.length === 0 ? (
                  <li class="text-[var(--dim)]">—</li>
                ) : (
                  l.pros.map((p) => (
                    <li key={p} class="flex items-start gap-2">
                      <span class="mt-0.5 text-[var(--ok)]">+</span>
                      {p}
                    </li>
                  ))
                )}
              </ul>
            </div>
            <div>
              <div class="text-xs uppercase tracking-[0.15em] text-[var(--warn)]">Cons</div>
              <ul class="mt-2 space-y-1 text-sm">
                {l.cons.map((c) => (
                  <li key={c} class="flex items-start gap-2">
                    <span class="mt-0.5 text-[var(--warn)]">−</span>
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Structural facts strip */}
          <dl class="mt-6 grid grid-cols-2 gap-3 border-t hairline pt-4 text-xs md:grid-cols-4">
            <Fact label="Siting" value={sitingMeta[l.siting].label} />
            <Fact label="Online" value={l.online ? "Yes — network-reachable" : "No"} />
            <Fact label="Access" value={l.access} />
            <Fact label="Third party" value={thirdPartyMeta[l.thirdParty.type].label} />
          </dl>

          {l.thirdParty.notes && (
            <p class="mt-3 text-xs italic text-[var(--ink-2)]">
              <strong class="not-italic">Third-party:</strong> {l.thirdParty.notes}
            </p>
          )}

          {l.legalNotes && (
            <div class="mt-4 rounded-xl border hairline bg-white/30 p-4 text-sm text-[var(--ink-2)]">
              <div class="text-[10px] uppercase tracking-[0.15em] text-[var(--dim)]">
                Legal considerations
              </div>
              <p class="mt-2">{l.legalNotes}</p>
            </div>
          )}

          {l.notes && (
            <div class="mt-4 rounded-xl border hairline bg-white/30 p-4 text-sm italic text-[var(--ink-2)]">
              <strong class="not-italic">Note:</strong> {l.notes}
            </div>
          )}

          <div class="mt-6 flex flex-wrap items-center gap-2 border-t hairline pt-4 text-xs">
            <span class="text-[var(--dim)]">Best for:</span>
            {l.bestFor.length === 0 ? (
              <span class="tag tag-warn">not recommended</span>
            ) : (
              l.bestFor.map((b) => (
                <span key={b} class="tag tag-neutral">
                  {b}
                </span>
              ))
            )}
          </div>
        </div>
      )}
    </article>
  );
}

function AxisStrip({
  axis,
  rating,
}: {
  axis: "loss" | "theft" | "coercion" | "tamper";
  rating: number;
}) {
  const meta = axisMeta[axis];
  const tone =
    axis === "loss"
      ? "bg-[var(--accent)]"
      : axis === "theft"
        ? "bg-[var(--warn)]"
        : axis === "coercion"
          ? "bg-[var(--coerce)]"
          : "bg-[var(--accent-deep)]";
  return (
    <div title={meta.label}>
      <div class="text-[10px] uppercase tracking-[0.15em] text-[var(--dim)]">{meta.short}</div>
      <div class="mt-1 flex gap-0.5">
        {[1, 2, 3].map((i) => (
          <span
            key={i}
            class={`h-1.5 w-6 rounded-full ${i <= rating ? tone : "bg-[var(--hairline)]"}`}
          ></span>
        ))}
      </div>
      <div class="mt-1 text-[11px] text-[var(--ink-2)]">
        {resistanceLabel(rating as 0 | 1 | 2 | 3)}
      </div>
    </div>
  );
}

function AxisDetail({
  label,
  color,
  rating,
  prose,
  extra,
}: {
  label: string;
  color: string;
  rating: number;
  prose?: string;
  extra?: any;
}) {
  return (
    <div>
      <div class="text-xs uppercase tracking-[0.15em]" style={`color: ${color}`}>
        {label}
      </div>
      <p class="mt-2 text-sm text-[var(--ink-2)]">{prose ?? "—"}</p>
      <div class="mt-2 text-xs text-[var(--dim)]">
        Rating:{" "}
        <strong class="text-[var(--ink)]">{resistanceLabel(rating as 0 | 1 | 2 | 3)}</strong>
        {extra && <> · {extra}</>}
      </div>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt class="text-[10px] uppercase tracking-[0.15em] text-[var(--dim)]">{label}</dt>
      <dd class="mt-1 text-[var(--ink)]">{value}</dd>
    </div>
  );
}
