import { describe, expect, it } from "vitest";
import { hasInlinePresentation } from "@/motion/native/presentation-guard";

describe("inline presentation guard", () => {
  it("GIVEN no targets WHEN inspected THEN no override exists", () => {
    expect(hasInlinePresentation([], ["opacity"])).toBe(false);
  });
  it("GIVEN an empty declaration WHEN inspected THEN stylesheet presentation is retained", () => {
    expect(
      hasInlinePresentation(
        [
          {
            style: {
              getPropertyValue: () => "",
              getPropertyPriority: () => "",
            },
          },
        ],
        ["opacity"],
      ),
    ).toBe(false);
  });
  it("GIVEN zero opacity WHEN inspected THEN the explicit zero is an override rather than an empty value", () => {
    expect(
      hasInlinePresentation(
        [
          {
            style: {
              getPropertyValue: () => "0",
              getPropertyPriority: () => "",
            },
          },
        ],
        ["opacity"],
      ),
    ).toBe(true);
  });
  it("GIVEN an important declaration port WHEN inspected THEN priority cannot be ignored", () => {
    expect(
      hasInlinePresentation(
        [
          {
            style: {
              getPropertyValue: () => "",
              getPropertyPriority: () => "important",
            },
          },
        ],
        ["opacity"],
      ),
    ).toBe(true);
  });
});
