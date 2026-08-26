import { z } from "astro/zod";

import {
  approvalStatusSchema,
  internalOrExternalUrlSchema,
  isoDateSchema,
  localizedTextSchema,
  stableIdSchema,
} from "./shared";

const decimalStringSchema = z.string().regex(/^(?:0|[1-9]\d*)(?:\.\d+)?$/);

const productClaimSchema = z
  .object({
    claimId: stableIdSchema,
    market: z.literal("UZ"),
    sourceId: stableIdSchema,
    statement: localizedTextSchema,
    status: approvalStatusSchema,
    unit: z.enum(["mg-per-100ml", "g-per-100ml", "kcal-per-100ml"]).optional(),
    value: decimalStringSchema.optional(),
    verifiedAt: isoDateSchema,
    verifiedBy: z.string().trim().min(1),
  })
  .strict();

const legalWarningSchema = z
  .object({
    sourceId: stableIdSchema,
    status: z.literal("legal-approved"),
    text: localizedTextSchema,
    warningId: stableIdSchema,
  })
  .strict();

const productCtaSchema = z
  .object({
    href: internalOrExternalUrlSchema,
    label: localizedTextSchema,
    type: z.enum(["find", "retailer", "details"]),
  })
  .strict();

const localizedSeoSchema = z
  .object({
    description: localizedTextSchema,
    title: localizedTextSchema,
  })
  .strict();

export const productSchema = z
  .object({
    canMediaId: stableIdSchema,
    claims: z.array(productClaimSchema),
    ctas: z.array(productCtaSchema).min(1),
    description: localizedTextSchema,
    flavorNotes: z.array(localizedTextSchema).min(1),
    name: localizedTextSchema,
    posterMediaId: stableIdSchema,
    seo: localizedSeoSchema,
    sku: z.string().trim().min(1).nullable(),
    slug: stableIdSchema,
    sourceId: stableIdSchema,
    status: z.enum(["draft", "approved", "archived"]),
    themeId: stableIdSchema,
    warnings: z.array(legalWarningSchema).min(1),
  })
  .strict();

export type ProductRecord = z.infer<typeof productSchema>;
