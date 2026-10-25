import { expect } from "@playwright/test";
import type { Page } from "@playwright/test";

const PAINT_TOLERANCE_PX = 1;
const ESSENTIAL_TARGET_PX = 44;
const EXPECTED_COLUMN_COUNT = 3;
const EXPECTED_TOPIC_COUNT = 5;

/** Read columns, glyphs and clipping bounds together so scroll cannot race paint. */
export async function verifyContactLayout(page: Page): Promise<void> {
  const board = page.locator(".routing-board");
  await expect(board).toBeVisible();
  await board.scrollIntoViewIfNeeded();
  const snapshot = await board.evaluate((element) => {
    const bounds = (rect: DOMRect) => ({
      left: rect.left,
      right: rect.right,
      top: rect.top,
      bottom: rect.bottom,
      width: rect.width,
      height: rect.height,
    });
    const clip = element.closest(".contact-switchboard");
    if (clip === null) throw new Error("Contact clipping owner is missing.");
    const columns = [...element.children].map((column) => {
      const words = [];
      const walker = document.createTreeWalker(column, NodeFilter.SHOW_TEXT);
      let node = walker.nextNode();
      while (node !== null) {
        if (node.parentElement?.closest('[aria-hidden="true"]') === null) {
          for (const match of (node.textContent ?? "").matchAll(/\S+/gu)) {
            const range = document.createRange();
            range.setStart(node, match.index);
            range.setEnd(node, match.index + match[0].length);
            words.push({
              text: match[0],
              rectangles: [...range.getClientRects()].map(bounds),
            });
          }
        }
        node = walker.nextNode();
      }
      return { bounds: bounds(column.getBoundingClientRect()), words };
    });
    const official = element.querySelector("[data-contact-official]");
    if (!(official instanceof HTMLAnchorElement))
      throw new Error("Contact official action is missing.");
    return {
      board: bounds(element.getBoundingClientRect()),
      clip: bounds(clip.getBoundingClientRect()),
      columns,
      topics: element.querySelectorAll(".routing-list > li").length,
      target: bounds(official.getBoundingClientRect()),
      href: official.href,
    };
  });
  expect(snapshot.columns).toHaveLength(EXPECTED_COLUMN_COUNT);
  expect(snapshot.topics).toBe(EXPECTED_TOPIC_COUNT);
  for (const column of snapshot.columns) {
    expect(column.bounds.width).toBeGreaterThan(0);
    expect(column.bounds.height).toBeGreaterThan(0);
    expect(
      column.bounds.left,
      "Contact column escapes board",
    ).toBeGreaterThanOrEqual(snapshot.board.left - PAINT_TOLERANCE_PX);
    expect(
      column.bounds.right,
      "Contact column escapes board",
    ).toBeLessThanOrEqual(snapshot.board.right + PAINT_TOLERANCE_PX);
    expect(
      column.bounds.left,
      "Contact column is clipped",
    ).toBeGreaterThanOrEqual(snapshot.clip.left - PAINT_TOLERANCE_PX);
    expect(
      column.bounds.right,
      "Contact column is clipped",
    ).toBeLessThanOrEqual(snapshot.clip.right + PAINT_TOLERANCE_PX);
    expect(column.words.length).toBeGreaterThan(0);
    for (const word of column.words) {
      expect(
        word.rectangles.length,
        `Unpainted contact text: ${word.text}`,
      ).toBeGreaterThan(0);
      for (const rect of word.rectangles) {
        expect(rect.width).toBeGreaterThan(0);
        expect(rect.height).toBeGreaterThan(0);
        expect(
          rect.left,
          `Contact text escapes column: ${word.text}`,
        ).toBeGreaterThanOrEqual(column.bounds.left - PAINT_TOLERANCE_PX);
        expect(
          rect.right,
          `Contact text escapes column: ${word.text}`,
        ).toBeLessThanOrEqual(column.bounds.right + PAINT_TOLERANCE_PX);
        expect(
          rect.left,
          `Contact text escapes board: ${word.text}`,
        ).toBeGreaterThanOrEqual(snapshot.board.left - PAINT_TOLERANCE_PX);
        expect(
          rect.right,
          `Contact text escapes board: ${word.text}`,
        ).toBeLessThanOrEqual(snapshot.board.right + PAINT_TOLERANCE_PX);
        expect(
          rect.top,
          `Contact text escapes board: ${word.text}`,
        ).toBeGreaterThanOrEqual(snapshot.board.top - PAINT_TOLERANCE_PX);
        expect(
          rect.bottom,
          `Contact text escapes board: ${word.text}`,
        ).toBeLessThanOrEqual(snapshot.board.bottom + PAINT_TOLERANCE_PX);
      }
    }
  }
  expect(snapshot.target.width).toBeGreaterThanOrEqual(ESSENTIAL_TARGET_PX);
  expect(snapshot.target.height).toBeGreaterThanOrEqual(ESSENTIAL_TARGET_PX);
  expect(new URL(snapshot.href).hostname).toBe("www.gorillaenergy.uz");
}
