import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

import sharp from "sharp";
import { describe, expect, it } from "vitest";

import { mediaSchema } from "@/content/schema/media";

const PRODUCT_STEMS = [
  "can-original",
  "can-zero",
  "can-extra",
  "can-mango-coconut",
  "can-lychee-pear",
] as const;
const COMPACT_DERIVATIVE_WIDTH = 160;
const LANDSCAPE_PRIMARY_SIZE =
  "(max-height: 45rem) and (orientation: landscape) 10.76rem";

describe("responsive product media integrity", () => {
  it.each(PRODUCT_STEMS)(
    "GIVEN %s WHEN its compact derivative is shipped THEN actual bytes, width and provenance match",
    async (stem) => {
      const record = mediaSchema.parse(
        JSON.parse(await readFile(`src/content/media/${stem}.json`, "utf8")),
      );
      const derivativePath = `/media/generated/products/${stem}-160.webp`;
      const derivative = record.derivatives?.find(
        (entry) => entry.path === derivativePath,
      );
      expect(derivative).toBeDefined();
      const bytes = await readFile(`public${derivativePath}`);
      expect(createHash("sha256").update(bytes).digest("hex")).toBe(
        derivative?.checksumSha256,
      );
      expect((await sharp(bytes).metadata()).width).toBe(
        COMPACT_DERIVATIVE_WIDTH,
      );
      expect(record.permissionEvidence.length).toBeGreaterThan(0);
    },
  );

  it("GIVEN a short landscape viewport WHEN primary source size is declared THEN its existing fixed-height CSS override has priority", async () => {
    const hero = await readFile("src/components/home/HomeHero.astro", "utf8");
    const fallbacks = await readFile(
      "src/components/home/home-hero-fallbacks.css",
      "utf8",
    );
    expect(hero).toContain(`sizes="${LANDSCAPE_PRIMARY_SIZE}, `);
    expect(fallbacks).toContain(
      "@media (max-height: 45rem) and (orientation: landscape)",
    );
    expect(fallbacks).toContain("--hero-can-height: 28rem;");
  });
});
