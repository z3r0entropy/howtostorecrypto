import { useMemo, useState } from "preact/hooks";
import {
  axisMeta,
  type Category,
  categoryMeta,
  type LocationRow,
  locations,
  resistanceLabel,
} from "~/data/locations";

type SortKey = "loss" | "theft" | "cost" | "alphabetical";

// Parse the first numeric value from a cost label like "$300 – $1,200 / yr".
// Returns Infinity for unparseable strings so they sort last.
function costRank(value: string): number {
  const match = value.replace(/,/g, "").match(/\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : Number.POSITIVE_INFINITY;
}

export default function LocationsBrowser() {
  const [search, setSearch] = useState("");
  const [activeCats, setActiveCats] = useState<Category[]>([]);
  const [stake, setStake] = useState<"any" | "modest" | "significant" | "life-defining">("any");
  const [sort, setSort] = useState<SortKey>("loss");
  const [openSlug, setOpenSlug] = useState<string | null>(null);

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
          l.notes?.toLowerCase().includes(s),
      );
    }
    if (activeCats.length > 0) {
      list = list.filter((l) => activeCats.includes(l.category));
    }
    if (stake !== "any") {
      list = list.filter((l) => l.recommendedFor.includes(stake));
    }
    list.sort((a, b) => {
      switch (sort) {
        case "loss":
          return b.lossResistance - a.lossResistance;
        case "theft":
          return b.theftResistance - a.theftResistance;
        case "cost":
          return costRank(a.costAnnualUsd) - costRank(b.costAnnualUsd);
        case "alphabetical":
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
    return list;
  }, [search, activeCats, stake, sort]);

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
              placeholder="bank, attorney, buried…"
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
                onClick={() => setActiveCats([])}
                class="text-xs text-[var(--accent)] hover:text-[var(--accent-deep)]"
              >
                clear ×
              </button>
            )}
          </div>
        </div>

        <div class="mt-6 flex flex-wrap items-baseline justify-between gap-3 border-t hairline pt-4 text-xs text-[var(--dim)]">
          <span>
            <span class="display stat-grad text-base">{filtered.length}</span> of {locations.length}{" "}
            locations
          </span>
          <div class="flex items-center gap-4">
            <span class="flex items-center gap-1.5">
              <span class="size-2 rounded-full" style="background: var(--accent)"></span>
              {axisMeta.loss.short}
            </span>
            <span class="flex items-center gap-1.5">
              <span class="size-2 rounded-full" style="background: var(--warn)"></span>
              {axisMeta.theft.short}
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
          filtered.map((l) => (
            <LocationRowCard
              l={l}
              open={openSlug === l.slug}
              onToggle={() => setOpenSlug(openSlug === l.slug ? null : l.slug)}
            />
          ))
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
  return (
    <article class={`glass rounded-2xl transition ${open ? "ring-1 ring-[var(--accent)]/30" : ""}`}>
      <button
        onClick={onToggle}
        class="grid w-full grid-cols-12 items-center gap-3 p-5 text-left md:p-6"
      >
        <div class="col-span-12 md:col-span-5">
          <div class="flex items-baseline gap-3">
            <span class="text-xl">{categoryMeta[l.category].emoji}</span>
            <div>
              <div class="display text-lg leading-tight">{l.name}</div>
              <div class="text-xs text-[var(--dim)]">{categoryMeta[l.category].label}</div>
            </div>
          </div>
          <p class="mt-3 text-sm text-[var(--ink-2)] md:max-w-md">{l.tagline}</p>
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
          <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <div class="text-xs uppercase tracking-[0.15em]" style="color: var(--accent)">
                {axisMeta.loss.label}
              </div>
              <p class="mt-2 text-sm text-[var(--ink-2)]">{l.lossNotes ?? "—"}</p>
              <div class="mt-2 text-xs text-[var(--dim)]">
                Rating:{" "}
                <strong class="text-[var(--ink)]">{resistanceLabel(l.lossResistance)}</strong>
                {" · "}fire {resistanceLabel(l.fire)} · water {resistanceLabel(l.water)}
              </div>
            </div>
            <div>
              <div class="text-xs uppercase tracking-[0.15em]" style="color: var(--warn)">
                {axisMeta.theft.label}
              </div>
              <p class="mt-2 text-sm text-[var(--ink-2)]">{l.theftNotes ?? "—"}</p>
              <div class="mt-2 text-xs text-[var(--dim)]">
                Rating:{" "}
                <strong class="text-[var(--ink)]">{resistanceLabel(l.theftResistance)}</strong>
              </div>
            </div>
          </div>

          <div class="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <div class="text-xs uppercase tracking-[0.15em] text-[var(--ok)]">Pros</div>
              <ul class="mt-2 space-y-1 text-sm">
                {l.pros.map((p) => (
                  <li class="flex items-start gap-2">
                    <span class="mt-0.5 text-[var(--ok)]">+</span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div class="text-xs uppercase tracking-[0.15em] text-[var(--warn)]">Cons</div>
              <ul class="mt-2 space-y-1 text-sm">
                {l.cons.map((c) => (
                  <li class="flex items-start gap-2">
                    <span class="mt-0.5 text-[var(--warn)]">−</span>
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {l.notes && (
            <div class="mt-6 rounded-xl border hairline bg-white/30 p-4 text-sm italic text-[var(--ink-2)]">
              <strong class="not-italic">Note:</strong> {l.notes}
            </div>
          )}

          <div class="mt-6 flex flex-wrap items-center gap-2 border-t hairline pt-4 text-xs">
            <span class="text-[var(--dim)]">Best for:</span>
            {l.bestFor.length === 0 ? (
              <span class="tag tag-warn">not recommended</span>
            ) : (
              l.bestFor.map((b) => <span class="tag tag-neutral">{b}</span>)
            )}
            <span class="ml-auto text-[var(--dim)]">Access: {l.access}</span>
          </div>
        </div>
      )}
    </article>
  );
}

function AxisStrip({ axis, rating }: { axis: "loss" | "theft"; rating: number }) {
  const label = axis === "loss" ? axisMeta.loss.short : axisMeta.theft.short;
  const tone = axis === "loss" ? "bg-[var(--accent)]" : "bg-[var(--warn)]";
  const full = axis === "loss" ? axisMeta.loss.label : axisMeta.theft.label;
  return (
    <div title={full}>
      <div class="text-[10px] uppercase tracking-[0.15em] text-[var(--dim)]">{label}</div>
      <div class="mt-1 flex gap-0.5">
        {[1, 2, 3].map((i) => (
          <span
            class={`h-1.5 w-6 rounded-full ${i <= rating ? tone : "bg-[var(--hairline)]"}`}
          ></span>
        ))}
      </div>
      <div class="mt-1 text-[11px] text-[var(--ink-2)]">{resistanceLabel(rating as any)}</div>
    </div>
  );
}
