import { z } from "astro/zod";

import { isoDateSchema, localizedTextSchema, stableIdSchema } from "./shared";

const checksumSchema = z.string().regex(/^[a-f0-9]{64}$/);
const generatedMediaPathSchema = z
  .string()
  .regex(/^(?:\/media\/generated\/[a-zA-Z0-9/_\-.]+|\/og\.png)$/);

export const mediaSchema = z
  .object({
    alt: localizedTextSchema.nullable(),
    checksumSha256: checksumSchema,
    decorative: z.boolean(),
    derivatives: z
      .array(
        z
          .object({
            checksumSha256: checksumSchema,
            path: generatedMediaPathSchema,
          })
          .strict(),
      )
      .optional(),
    generator: z
      .object({
        binarySha256: checksumSchema,
        buildHost: z.string().trim().min(1),
        package: z.string().trim().min(1),
        script: z.string().trim().min(1),
        version: z.string().trim().min(1),
      })
      .strict()
      .optional(),
    kind: z.enum(["image", "video", "audio", "model"]),
    license: z.string().trim().min(1),
    mediaId: stableIdSchema,
    owner: z.string().trim().min(1),
    path: generatedMediaPathSchema,
    peopleConsent: z.string().trim().min(1).optional(),
    permissionEvidence: z.string().trim().min(1),
    rightsExpiresAt: isoDateSchema.optional(),
    sourceUrl: z.url().optional(),
    territories: z.array(z.string().trim().min(2)).min(1),
  })
  .strict()
  .superRefine((record, context) => {
    if (record.decorative && record.alt !== null) {
      context.addIssue({
        code: "custom",
        message: "Decorative media must use null alt text.",
        path: ["alt"],
      });
    }

    if (!record.decorative && record.alt === null) {
      context.addIssue({
        code: "custom",
        message: "Meaningful media requires localized alt text.",
        path: ["alt"],
      });
    }

    if (!record.territories.includes("UZ")) {
      context.addIssue({
        code: "custom",
        message: "Production media must explicitly include the UZ territory.",
        path: ["territories"],
      });
    }
  });

export type MediaRecord = z.infer<typeof mediaSchema>;
