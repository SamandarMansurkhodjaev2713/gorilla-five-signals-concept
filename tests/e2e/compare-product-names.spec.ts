import { expect, test, type Locator } from "@playwright/test";

import { waitForCompactFonts } from "./support/compact-fonts";

const LOCALES = ["uz", "ru", "en"] as const;
const WIDTHS = [769, 1024] as const;
const ROOT_FONT_SIZES = ["100%", "200%"] as const;
const PRODUCTS = "zero,mango-coconut,lychee-pear";
const PAINT_TOLERANCE_PX = 1;

test.use({ contextOptions: { reducedMotion: "reduce" } });

function measureNameWords(element: Element) {
  const node = element.firstChild;
  if (node?.nodeType !== Node.TEXT_NODE)
    throw new Error("Canonical comparison names must render as text.");
  const owner = element.getBoundingClientRect();
  return [...(node.textContent ?? "").matchAll(/[\p{L}\p{M}]+/gu)].map(
    (match) => {
      const range = document.createRange();
      range.setStart(node, match.index);
      range.setEnd(node, match.index + match[0].length);
      return {
        text: match[0],
        owner: { left: owner.left, right: owner.right },
        rects: [...range.getClientRects()].map((rect) => ({
          left: rect.left,
          right: rect.right,
          top: rect.top,
          width: rect.width,
        })),
      };
    },
  );
}

async function verifyNameWords(heading: Locator): Promise<void> {
  const words = await heading.evaluate(measureNameWords);
  expect(words.length).toBeGreaterThan(0);
  for (const word of words) {
    const first = word.rects[0];
    if (first === undefined)
      throw new Error(`Missing painted word: ${word.text}.`);
    for (const rect of word.rects) {
      expect(rect.width).toBeGreaterThan(0);
      expect(
        Math.abs(rect.top - first.top),
        `Name fractured inside ${word.text}`,
      ).toBeLessThanOrEqual(PAINT_TOLERANCE_PX);
      expect(rect.left).toBeGreaterThanOrEqual(
        word.owner.left - PAINT_TOLERANCE_PX,
      );
      expect(rect.right).toBeLessThanOrEqual(
        word.owner.right + PAINT_TOLERANCE_PX,
      );
    }
  }
}

for (const locale of LOCALES)
  for (const width of WIDTHS)
    for (const rootSize of ROOT_FONT_SIZES) {
      test(`GIVEN ${locale} product names at ${width}px and ${rootSize} root font WHEN three products are compared THEN names only wrap at word boundaries`, async ({
        page,
      }) => {
        await page.setViewportSize({ width, height: 390 });
        await page.addInitScript(() =>
          sessionStorage.setItem("gorilla-responsible-entry-confirmed", "true"),
        );
        const response = await page.goto(
          `/${locale}/compare/?products=${PRODUCTS}&motion=static`,
          { waitUntil: "domcontentloaded" },
        );
        expect(response?.status()).toBe(200);
        await expect(page.locator("[data-compare-root]")).toHaveAttribute(
          "data-selection-count",
          "3",
        );
        await page.addStyleTag({ content: `html { font-size: ${rootSize}; }` });
        await waitForCompactFonts(page);
        const names = page.locator(
          "[data-compare-product]:not([hidden]) .signal-channel__copy h2",
        );
        await expect(names).toHaveCount(3);
        for (const heading of await names.all()) {
          await heading.scrollIntoViewIfNeeded();
          await verifyNameWords(heading);
        }
      });
    }
