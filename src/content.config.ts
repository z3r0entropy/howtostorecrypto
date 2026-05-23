import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";
import {
  ATTACK_VECTORS,
  INCIDENT_STATUSES,
  METHOD_SLUGS,
  ROOT_CAUSES,
} from "~/lib/incidents-taxonomy";

/**
 * Incidents corpus. One MDX file per entry under `src/content/incidents/`.
 * Frontmatter holds the structured data; the MDX body is the writeup.
 *
 * Schema mirrors `docs/incidents-plan.md` — see that document for the
 * editorial rationale behind each field.
 */
const incidents = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/incidents" }),
  schema: z.object({
    title: z.string(),

    // Status is first-class — always visible on the page.
    status: z.enum(INCIDENT_STATUSES),
    statusNote: z.string().optional(),

    // Dates: prefer ISO (YYYY-MM-DD) but accept year-only for vague cases.
    occurredOn: z.string().optional(),
    reportedOn: z.string().optional(),

    // Money. `amountUsd` is the best estimate at time of incident.
    amountUsd: z.number().nonnegative().optional(),
    amountUsdNote: z.string().optional(),
    recoveredUsd: z.number().nonnegative().optional(),

    asset: z.array(z.string()).optional(),

    victimType: z.enum(["individual", "exchange", "dao", "protocol", "mixed"]),

    attackVector: z.enum(ATTACK_VECTORS),
    rootCause: z.array(z.enum(ROOT_CAUSES)).min(1),

    // One- to two-sentence summary. Becomes the meta description and the
    // SERP snippet — keep it tight.
    summary: z.string().min(20).max(360),

    // What would have prevented THIS incident, specifically. Explanations
    // are required — they're the internal-linking surface to /methods/.
    preventedBy: z
      .array(
        z.object({
          method: z.enum(METHOD_SLUGS),
          explanation: z.string().min(20),
        }),
      )
      .min(1),

    // Source citations. Tier: 1=primary, 2=established journalism, 3=community.
    sources: z
      .array(
        z.object({
          publisher: z.string(),
          title: z.string().optional(),
          url: z.string().url().optional(),
          publishedOn: z.string().optional(),
          tier: z.union([z.literal(1), z.literal(2), z.literal(3)]),
        }),
      )
      .min(1),

    // Optional — named perpetrators. Be cautious with "alleged".
    perpetrators: z
      .array(
        z.object({
          name: z.string(),
          status: z.enum(["charged", "convicted", "alleged", "unknown"]),
        }),
      )
      .optional(),

    relatedIncidents: z.array(z.string()).optional(),

    /**
     * Cluster entries: one page representing N similar small incidents
     * or a documentable pattern (e.g. "fake-ledger-live-app-cluster-2023").
     * When set, `amountUsd` is the aggregate across the cluster.
     */
    cluster: z
      .object({
        count: z.union([z.number().positive(), z.literal("many")]),
        timeRange: z.object({
          from: z.string(),
          to: z.string().optional(),
        }),
        subIncidents: z
          .array(
            z.object({
              occurredOn: z.string().optional(),
              amountUsd: z.number().nonnegative().optional(),
              summary: z.string(),
              sourceUrl: z.string().url().optional(),
            }),
          )
          .optional(),
      })
      .optional(),

    // Indexing controls.
    draft: z.boolean().default(false),
  }),
});

export const collections = { incidents };
