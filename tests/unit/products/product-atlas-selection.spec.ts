import { describe, expect, it } from "vitest";

import { keyboardTargetIndex } from "@/features/products/product-atlas-selection";

const ITEM_COUNT = 5;

describe("product atlas selection", () => {
  it("GIVEN the final frequency WHEN next is requested THEN selection wraps to the first frequency", () => {
    expect(keyboardTargetIndex("ArrowRight", 4, ITEM_COUNT)).toBe(0);
    expect(keyboardTargetIndex("ArrowDown", 4, ITEM_COUNT)).toBe(0);
  });

  it("GIVEN the first frequency WHEN previous is requested THEN selection wraps to the final frequency", () => {
    expect(keyboardTargetIndex("ArrowLeft", 0, ITEM_COUNT)).toBe(4);
    expect(keyboardTargetIndex("ArrowUp", 0, ITEM_COUNT)).toBe(4);
  });

  it("GIVEN Home or End WHEN a boundary is requested THEN the exact boundary is returned", () => {
    expect(keyboardTargetIndex("Home", 3, ITEM_COUNT)).toBe(0);
    expect(keyboardTargetIndex("End", 1, ITEM_COUNT)).toBe(4);
  });

  it("GIVEN a non-navigation key WHEN selection resolves THEN native key behavior remains available", () => {
    expect(keyboardTargetIndex("Enter", 2, ITEM_COUNT)).toBeNull();
  });
});
