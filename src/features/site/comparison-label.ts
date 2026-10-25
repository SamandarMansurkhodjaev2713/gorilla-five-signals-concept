import type { SupportedLocale } from "@/config/site";

import { getSiteCopy } from "./copy";

// Discretionary syllabic boundaries preserve the canonical word at every scale.
const COMPARE_BREAK_POSITIONS: Record<SupportedLocale, readonly number[]> = {
  en: [3],
  ru: [4],
  uz: [3, 6],
};

/** Split only the canonical action label; never fit, shorten or rewrite user text. */
export function comparisonLabelParts(
  locale: SupportedLocale,
  label: string,
): readonly string[] {
  if (label !== getSiteCopy(locale).navigation.compare) {
    throw new Error(
      "Comparison label boundaries require canonical localized copy.",
    );
  }
  const letters = Array.from(label);
  const boundaries = [0, ...COMPARE_BREAK_POSITIONS[locale], letters.length];
  const parts = COMPARE_BREAK_POSITIONS[locale].map((_, index) =>
    letters.slice(boundaries[index], boundaries[index + 1]).join(""),
  );
  parts.push(letters.slice(boundaries.at(-2)).join(""));
  return Object.freeze(parts);
}
