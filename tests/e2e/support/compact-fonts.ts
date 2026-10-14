import { expect } from "@playwright/test";
import type { Page } from "@playwright/test";

/** Synchronous loaded-face and glyph checks avoid disabled-JS promise stalls and nonexistent-family false passes. */
export async function waitForCompactFonts(page: Page): Promise<void> {
  await expect
    .poll(() =>
      page.evaluate(() => {
        const sample =
          document.documentElement.lang === "ru" ? "СИГНАЛ" : "SIGNAL";
        const point = sample.codePointAt(0);
        if (point === undefined)
          throw new Error("A font readiness sample is required.");
        const faces = [...document.fonts];
        function containsGlyph(range: string): boolean {
          return range.split(",").some((interval) => {
            const match = /^U\+([a-f\d]+)(?:-([a-f\d]+))?$/iu.exec(
              interval.trim(),
            );
            const lower = match?.[1];
            if (lower === undefined) return false;
            const start = Number(`0x${lower}`);
            const end = Number(`0x${match?.[2] ?? lower}`);
            return point !== undefined && point >= start && point <= end;
          });
        }
        function hasLoadedFace(family: string): boolean {
          return faces.some(
            (face) =>
              face.status === "loaded" &&
              face.family.replace(/["']/gu, "").toLowerCase() ===
                family.toLowerCase() &&
              containsGlyph(face.unicodeRange),
          );
        }
        return {
          status: document.fonts.status,
          display: document.fonts.check("700 16px Oswald", sample),
          body: document.fonts.check("450 16px Onest", sample),
          registeredDisplayLoaded: hasLoadedFace("Oswald"),
          registeredBodyLoaded: hasLoadedFace("Onest"),
        };
      }),
    )
    .toEqual({
      status: "loaded",
      display: true,
      body: true,
      registeredDisplayLoaded: true,
      registeredBodyLoaded: true,
    });
}
