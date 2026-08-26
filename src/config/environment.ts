import { z } from "zod";

import { SUPPORTED_LOCALES } from "./site";

const emptyStringToUndefined = (value: unknown): unknown =>
  value === "" ? undefined : value;
const LOCAL_HOSTNAMES = new Set(["localhost", "[::1]"]);
const LOOPBACK_IPV4_PATTERN = /^127(?:\.\d{1,3}){3}$/u;
const publicBasePathSchema = z
  .string()
  .regex(/^\/[A-Za-z0-9](?:[A-Za-z0-9._-]*[A-Za-z0-9])?$/u, {
    message:
      "PUBLIC_BASE_PATH must be one safe absolute path segment without a trailing slash.",
  });

function isLocalHostname(hostname: string): boolean {
  const normalizedHostname = hostname.toLowerCase();
  return (
    LOCAL_HOSTNAMES.has(normalizedHostname) ||
    normalizedHostname.endsWith(".localhost") ||
    LOOPBACK_IPV4_PATTERN.test(normalizedHostname)
  );
}

const publicSiteOriginSchema = z
  .url()
  .superRefine((value, context) => {
    const url = new URL(value);
    const isHttpProtocol =
      url.protocol === "http:" || url.protocol === "https:";
    const isOriginOnly =
      url.username === "" &&
      url.password === "" &&
      url.pathname === "/" &&
      url.search === "" &&
      url.hash === "";

    if (!isHttpProtocol) {
      context.addIssue({
        code: "custom",
        message: "PUBLIC_SITE_ORIGIN must use HTTP or HTTPS.",
      });
    }
    if (!isOriginOnly) {
      context.addIssue({
        code: "custom",
        message:
          "PUBLIC_SITE_ORIGIN must contain only an origin, without credentials, path, query, or fragment.",
      });
    }
  })
  .transform((value) => new URL(value).origin);

const publicEnvironmentSchema = z
  .object({
    PUBLIC_BASE_PATH: z.preprocess(
      emptyStringToUndefined,
      publicBasePathSchema.optional(),
    ),
    PUBLIC_DEFAULT_LOCALE: z.enum(SUPPORTED_LOCALES).default("uz"),
    PUBLIC_RELEASE_MODE: z.enum(["private", "public"]).default("private"),
    PUBLIC_SITE_ORIGIN: z.preprocess(
      emptyStringToUndefined,
      publicSiteOriginSchema.optional(),
    ),
  })
  .loose()
  .superRefine((environment, context) => {
    if (
      environment.PUBLIC_RELEASE_MODE === "public" &&
      environment.PUBLIC_SITE_ORIGIN === undefined
    ) {
      context.addIssue({
        code: "custom",
        message: "PUBLIC_SITE_ORIGIN is required for a public release.",
        path: ["PUBLIC_SITE_ORIGIN"],
      });
    }

    if (
      environment.PUBLIC_RELEASE_MODE === "public" &&
      environment.PUBLIC_SITE_ORIGIN !== undefined &&
      new URL(environment.PUBLIC_SITE_ORIGIN).protocol !== "https:"
    ) {
      context.addIssue({
        code: "custom",
        message: "PUBLIC_SITE_ORIGIN must use HTTPS for a public release.",
        path: ["PUBLIC_SITE_ORIGIN"],
      });
    }

    if (
      environment.PUBLIC_RELEASE_MODE === "public" &&
      environment.PUBLIC_SITE_ORIGIN !== undefined &&
      isLocalHostname(new URL(environment.PUBLIC_SITE_ORIGIN).hostname)
    ) {
      context.addIssue({
        code: "custom",
        message:
          "PUBLIC_SITE_ORIGIN must not target a loopback host for a public release.",
        path: ["PUBLIC_SITE_ORIGIN"],
      });
    }
  });

export type PublicEnvironment = Readonly<{
  basePath?: string;
  defaultLocale: z.infer<
    typeof publicEnvironmentSchema
  >["PUBLIC_DEFAULT_LOCALE"];
  releaseMode: z.infer<typeof publicEnvironmentSchema>["PUBLIC_RELEASE_MODE"];
  siteOrigin?: string;
}>;

/**
 * Validates the only environment values allowed to influence the public build.
 */
export function parsePublicEnvironment(input: unknown): PublicEnvironment {
  const result = publicEnvironmentSchema.safeParse(input);

  if (!result.success) {
    throw new Error(z.prettifyError(result.error));
  }

  return {
    ...(result.data.PUBLIC_BASE_PATH === undefined
      ? {}
      : { basePath: result.data.PUBLIC_BASE_PATH }),
    defaultLocale: result.data.PUBLIC_DEFAULT_LOCALE,
    releaseMode: result.data.PUBLIC_RELEASE_MODE,
    ...(result.data.PUBLIC_SITE_ORIGIN === undefined
      ? {}
      : { siteOrigin: result.data.PUBLIC_SITE_ORIGIN }),
  };
}
