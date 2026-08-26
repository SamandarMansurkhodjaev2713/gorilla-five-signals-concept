import { z } from "astro/zod";

import {
  internalOrExternalUrlSchema,
  isoDateSchema,
  localizedTextSchema,
  stableIdSchema,
} from "./shared";

const coordinatesSchema = z
  .object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  })
  .strict();

export const flavorSchema = z
  .object({
    accentToken: z.string().regex(/^--color-[a-z0-9-]+$/),
    flavorId: stableIdSchema,
    name: localizedTextSchema,
    productSlug: stableIdSchema,
    status: z.enum(["draft", "approved", "archived"]),
  })
  .strict();

export const storeSchema = z
  .object({
    address: localizedTextSchema,
    coordinates: coordinatesSchema,
    name: z.string().trim().min(1),
    retailerUrl: internalOrExternalUrlSchema,
    status: z.enum(["verified", "temporarily-unavailable"]),
    storeId: stableIdSchema,
    verifiedAt: isoDateSchema,
  })
  .strict();

export const cultureSchema = z
  .object({
    body: localizedTextSchema,
    mediaIds: z.array(stableIdSchema),
    publishedAt: isoDateSchema,
    slug: stableIdSchema,
    status: z.enum(["draft", "approved", "archived"]),
    title: localizedTextSchema,
  })
  .strict();

export const faqSchema = z
  .object({
    answer: localizedTextSchema,
    faqId: stableIdSchema,
    question: localizedTextSchema,
    sourceIds: z.array(stableIdSchema).min(1),
    status: z.enum(["draft", "approved"]),
  })
  .strict();

export const legalSchema = z
  .object({
    body: localizedTextSchema,
    documentId: stableIdSchema,
    effectiveAt: isoDateSchema,
    sourceId: stableIdSchema,
    status: z.literal("legal-approved"),
    title: localizedTextSchema,
  })
  .strict();

export type CultureRecord = z.infer<typeof cultureSchema>;
export type FaqRecord = z.infer<typeof faqSchema>;
export type FlavorRecord = z.infer<typeof flavorSchema>;
export type LegalRecord = z.infer<typeof legalSchema>;
export type StoreRecord = z.infer<typeof storeSchema>;
