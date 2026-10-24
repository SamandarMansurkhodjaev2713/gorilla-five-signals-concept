import { expect } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";

const PAINT_TOLERANCE_PX = 1;
const MINIMUM_TARGET_PX = 44;
const TEXT_STRESS = `
  html { font-size: 200% !important; }
  .hero h1, .hero p, .hero a, .home-duel__action b,
  .archive-hero__meta p, .archive-hero__brief .type-label {
    line-height: 1.5 !important;
    letter-spacing: .12em !important;
    word-spacing: .16em !important;
  }
  .hero p { margin-block-end: 2em !important; }
`;

interface TextPaint {
  readonly text: string;
  readonly rectangles: readonly PaintRectangle[];
}

interface PaintRectangle {
  readonly left: number;
  readonly right: number;
  readonly top: number;
  readonly bottom: number;
  readonly width: number;
  readonly height: number;
}

/** DOM styling also works with page JavaScript disabled; computed ratios prove stress. */
export async function applyTypographyStress(page: Page): Promise<void> {
  await page.evaluate((content) => {
    const style = document.createElement("style");
    style.textContent = content;
    document.head.append(style);
  }, TEXT_STRESS);
  expect(
    await page.evaluate(
      () => getComputedStyle(document.documentElement).fontSize,
    ),
  ).toBe("32px");
}

/** Ratios are checked against the actual localized face size, not a guessed pixel ramp. */
export async function verifyTypographyStress(subject: Locator): Promise<void> {
  const metrics = await subject.evaluate((element) => {
    const style = getComputedStyle(element);
    const size = Number.parseFloat(style.fontSize);
    return {
      size,
      line: Number.parseFloat(style.lineHeight) / size,
      letter: Number.parseFloat(style.letterSpacing) / size,
      word: Number.parseFloat(style.wordSpacing) / size,
    };
  });
  expect(metrics.size).toBeGreaterThan(0);
  expect(metrics.line).toBeCloseTo(1.5, 3);
  expect(metrics.letter).toBeCloseTo(0.12, 3);
  expect(metrics.word).toBeCloseTo(0.16, 3);
}

async function wordPaint(subject: Locator): Promise<readonly TextPaint[]> {
  return subject.evaluate((element) => {
    const words = [];
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    let node = walker.nextNode();
    while (node !== null) {
      for (const match of (node.textContent ?? "").matchAll(/\S+/gu)) {
        const range = document.createRange();
        range.setStart(node, match.index);
        range.setEnd(node, match.index + match[0].length);
        const rectangles = [...range.getClientRects()].map((rect) => ({
          left: rect.left,
          right: rect.right,
          top: rect.top,
          bottom: rect.bottom,
          width: rect.width,
          height: rect.height,
        }));
        words.push({ text: match[0], rectangles });
      }
      node = walker.nextNode();
    }
    return words;
  });
}

function expectSinglePaintedLine(paint: TextPaint): void {
  expect(
    paint.rectangles.length,
    `Painted text: ${paint.text}`,
  ).toBeGreaterThan(0);
  const first = paint.rectangles[0];
  if (first === undefined) throw new Error("Text paint must be nonempty.");
  for (const rect of paint.rectangles) {
    expect(rect.width).toBeGreaterThan(0);
    expect(rect.height).toBeGreaterThan(0);
    expect(
      Math.abs(rect.top - first.top),
      `Whole-word fracture: ${paint.text}`,
    ).toBeLessThanOrEqual(PAINT_TOLERANCE_PX);
  }
}

async function expectPaintInside(
  paint: TextPaint,
  owner: Locator,
): Promise<void> {
  const bounds = await owner.boundingBox();
  expect(bounds).not.toBeNull();
  if (bounds === null) throw new Error("Paint owner must be visible.");
  for (const rect of paint.rectangles) {
    expect(rect.left).toBeGreaterThanOrEqual(bounds.x - PAINT_TOLERANCE_PX);
    expect(rect.right).toBeLessThanOrEqual(
      bounds.x + bounds.width + PAINT_TOLERANCE_PX,
    );
    expect(rect.top).toBeGreaterThanOrEqual(bounds.y - PAINT_TOLERANCE_PX);
    expect(rect.bottom).toBeLessThanOrEqual(
      bounds.y + bounds.height + PAINT_TOLERANCE_PX,
    );
  }
}

/** Every actual word must paint intact and inside its unmodified owner. */
export async function verifyWholeWords(
  subject: Locator,
  owner: Locator = subject,
): Promise<void> {
  await expect(subject).toBeVisible();
  const words = await wordPaint(subject);
  expect(words.length).toBeGreaterThan(0);
  for (const word of words) {
    expectSinglePaintedLine(word);
    await expectPaintInside(word, owner);
  }
}

/** Inline grouping must not permit a normal-state label to split across rows. */
export async function verifyEntireLabelLine(
  subject: Locator,
  owner: Locator,
): Promise<void> {
  const paint = await subject.evaluate((element) => {
    const range = document.createRange();
    range.selectNodeContents(element);
    return {
      text: element.textContent ?? "",
      rectangles: [...range.getClientRects()]
        .filter((rect) => rect.width > 0 && rect.height > 0)
        .map((rect) => ({
          left: rect.left,
          right: rect.right,
          top: rect.top,
          bottom: rect.bottom,
          width: rect.width,
          height: rect.height,
        })),
    };
  });
  expect(paint.text.trim().length).toBeGreaterThan(0);
  expectSinglePaintedLine(paint);
  await expectPaintInside(paint, owner);
}

/** Native target geometry is asserted independently of decorative label bounds. */
export async function verifyNativeTarget(subject: Locator): Promise<void> {
  await expect(subject).toBeVisible();
  const bounds = await subject.boundingBox();
  if (bounds === null) throw new Error("Native target must paint.");
  expect(bounds.width).toBeGreaterThanOrEqual(MINIMUM_TARGET_PX);
  expect(bounds.height).toBeGreaterThanOrEqual(MINIMUM_TARGET_PX);
}

/** Enlarged labels may use authored wbr boundaries, never accidental one-letter fragments. */
export async function verifyDiscretionaryLabel(
  subject: Locator,
  owner: Locator,
): Promise<void> {
  const parts = await subject.evaluate((element) =>
    [...element.childNodes].map((node) => ({
      text: node.textContent ?? "",
      kind: node.nodeType === Node.TEXT_NODE ? "text" : node.nodeName,
    })),
  );
  expect(parts.some((part) => part.kind === "WBR")).toBe(true);
  for (const part of parts) {
    expect(["text", "WBR"]).toContain(part.kind);
    if (part.kind === "text")
      expect(part.text.trim().length).toBeGreaterThan(1);
  }
  await verifyWholeWords(subject, owner);
}
