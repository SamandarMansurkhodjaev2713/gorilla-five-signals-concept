import { z } from "astro/zod";

import { approvalStatusSchema, isoDateSchema, stableIdSchema } from "./shared";

export const sourceSchema = z
  .object({
    evidencePath: z.string().trim().min(1),
    kind: z.enum([
      "uz-packaging",
      "certificate",
      "brand-record",
      "legal-counsel",
    ]),
    market: z.literal("UZ"),
    reference: z.string().trim().min(1),
    sourceId: stableIdSchema,
    status: approvalStatusSchema,
    title: z.string().trim().min(1),
    verifiedAt: isoDateSchema,
    verifiedBy: z.string().trim().min(1),
  })
  .strict();

export type SourceRecord = z.infer<typeof sourceSchema>;
