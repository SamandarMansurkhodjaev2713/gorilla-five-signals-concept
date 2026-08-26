import { SUPPORTED_LOCALES, type SupportedLocale } from "@/config/site";

type LocaleRoute = Readonly<{
  params: Readonly<{ locale: SupportedLocale }>;
  props: Readonly<{ locale: SupportedLocale }>;
}>;

export function createLocaleRoutes(): readonly LocaleRoute[] {
  return SUPPORTED_LOCALES.map((locale) => ({
    params: { locale },
    props: { locale },
  }));
}
