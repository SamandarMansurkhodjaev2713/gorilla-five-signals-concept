import { getCollection } from "astro:content";
import type { APIRoute } from "astro";

import { SUPPORTED_LOCALES } from "@/config/site";
import { createCanonicalHref } from "@/features/site/canonical";
import { localePath } from "@/features/site/localization";

const STATIC_PATHS = [
  "",
  "/products",
  "/compare",
  "/find",
  "/culture",
  "/faq",
  "/contact",
  "/legal/privacy",
  "/legal/product-information",
] as const;

export const GET: APIRoute = async ({ site }) => {
  if (site === undefined) {
    return new Response(
      "Sitemap is unavailable until PUBLIC_SITE_ORIGIN is configured.",
      {
        headers: {
          "Cache-Control": "no-store",
          "Content-Type": "text/plain; charset=utf-8",
        },
        status: 503,
      },
    );
  }

  const products = await getCollection(
    "products",
    ({ data }) => data.status === "approved",
  );
  const localizedPaths = SUPPORTED_LOCALES.flatMap((locale) => [
    ...STATIC_PATHS.map((path) => localePath(locale, path)),
    ...products.map(({ data }) => localePath(locale, `/products/${data.slug}`)),
  ]);
  const entries = localizedPaths
    .map((path) => `<url><loc>${createCanonicalHref(path, site)}</loc></url>`)
    .join("");

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries}</urlset>`,
    { headers: { "Content-Type": "application/xml; charset=utf-8" } },
  );
};
