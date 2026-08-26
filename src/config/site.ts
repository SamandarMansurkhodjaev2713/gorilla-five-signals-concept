export const SUPPORTED_LOCALES = ["uz", "ru", "en"] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

type SiteConfig = Readonly<{
  description: string;
  locales: readonly SupportedLocale[];
  title: string;
}>;

export const siteConfig = Object.freeze({
  description:
    "Independent product-experience concept for Gorilla Energy Uzbekistan.",
  locales: SUPPORTED_LOCALES,
  title: "Gorilla Uzbekistan — independent concept",
}) satisfies SiteConfig;
