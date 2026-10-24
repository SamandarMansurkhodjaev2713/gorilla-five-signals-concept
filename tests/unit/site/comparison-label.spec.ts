import { describe, expect, it } from "vitest";

import { SUPPORTED_LOCALES } from "@/config/site";
import { comparisonLabelParts } from "@/features/site/comparison-label";
import { getSiteCopy } from "@/features/site/copy";

const EXPECTED_PARTS = {
  en: ["Com", "pare"],
  ru: ["Срав", "нить"],
  uz: ["Taq", "qos", "lash"],
} as const;

describe("localized comparison lexical boundaries", () => {
  it.each(SUPPORTED_LOCALES)(
    "GIVEN %s canonical copy WHEN discretionary breaks are prepared THEN the entire label and lexical groups remain unchanged",
    (locale) => {
      const label = getSiteCopy(locale).navigation.compare;
      const parts = comparisonLabelParts(locale, label);
      expect(parts).toEqual(EXPECTED_PARTS[locale]);
      expect(parts.join("")).toBe(label);
      expect(parts.every((part) => Array.from(part).length > 1)).toBe(true);
      expect(Object.isFrozen(parts)).toBe(true);
    },
  );

  it.each(["", "Other action", "Taqqoslash "])(
    "GIVEN noncanonical label %j WHEN segmentation runs THEN unreviewed text cannot acquire guessed breaks",
    (label) => {
      expect(() => comparisonLabelParts("uz", label)).toThrow(
        "require canonical localized copy",
      );
    },
  );
});
