import { z } from "astro/zod";

export const stableIdSchema = z
  .string()
  .trim()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

export const isoDateSchema = z.iso.date();

export const localizedTextSchema = z
  .object({
    en: z.string().trim().min(1),
    ru: z.string().trim().min(1),
    uz: z.string().trim().min(1),
  })
  .strict();

export const internalOrExternalUrlSchema = z
  .string()
  .trim()
  .refine(
    (value) => {
      if (value.startsWith("/") && !value.startsWith("//")) {
        return true;
      }

      return z.url().safeParse(value).success;
    },
    { message: "Expected a root-relative path or an absolute URL." },
  );

export const approvalStatusSchema = z.enum([
  "brand-approved",
  "legal-approved",
]);

export type LocalizedText = z.infer<typeof localizedTextSchema>;
