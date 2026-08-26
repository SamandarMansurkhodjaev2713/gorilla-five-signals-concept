import type { SupportedLocale } from "@/config/site";
import type { LocalizedText } from "@/content/schema/shared";

import { withBasePath, withoutBasePath } from "./base-path";

export type LocalizedValue = Readonly<Record<SupportedLocale, string>>;

export function localize(
  value: LocalizedText | LocalizedValue,
  locale: SupportedLocale,
): string {
  return value[locale];
}

export function localePath(locale: SupportedLocale, path = ""): string {
  const suffixIndex = path.search(/[?#]/u);
  const pathname = suffixIndex < 0 ? path : path.slice(0, suffixIndex);
  const urlSuffix = suffixIndex < 0 ? "" : path.slice(suffixIndex);
  const normalizedPath = pathname.split("/").filter(Boolean).join("/");
  const localized =
    normalizedPath === "" ? `/${locale}/` : `/${locale}/${normalizedPath}/`;
  return `${withBasePath(localized)}${urlSuffix}`;
}

export function replaceLocale(
  pathname: string,
  locale: SupportedLocale,
): string {
  const segments = withoutBasePath(pathname).split("/").filter(Boolean);
  const suffix = segments.slice(1).join("/");
  return localePath(locale, suffix);
}
