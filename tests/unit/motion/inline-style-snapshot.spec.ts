import { describe, expect, it } from "vitest";

import {
  captureInlineStyles,
  type InlineStyleTarget,
} from "@/motion/inline-style-snapshot";

function createTarget() {
  const declarations = new Map<string, { value: string; priority: string }>();
  const style: InlineStyleTarget["style"] = {
    getPropertyValue: (property) => declarations.get(property)?.value ?? "",
    getPropertyPriority: (property) =>
      declarations.get(property)?.priority ?? "",
    setProperty: (property, value, priority = "") => {
      if (value === null || value === "") declarations.delete(property);
      else declarations.set(property, { value, priority });
    },
    removeProperty: (property) => {
      const value = declarations.get(property)?.value ?? "";
      declarations.delete(property);
      return value;
    },
  };
  return { style };
}

describe("inline presentation ownership", () => {
  it("GIVEN absent owned declarations WHEN motion writes them THEN restoration removes only owned properties", () => {
    const target = createTarget();
    const restore = captureInlineStyles([target], ["transform", "translate"]);
    target.style.setProperty("transform", "translateX(12px)");
    target.style.setProperty("translate", "none");
    target.style.setProperty("--unrelated-signal", "lime");
    restore();
    expect(target.style.getPropertyValue("transform")).toBe("");
    expect(target.style.getPropertyValue("translate")).toBe("");
    expect(target.style.getPropertyValue("--unrelated-signal")).toBe("lime");
  });

  it("GIVEN an important original declaration WHEN motion replaces it THEN the exact value and priority return", () => {
    const target = createTarget();
    target.style.setProperty("opacity", "0.8", "important");
    const restore = captureInlineStyles([target], ["opacity"]);
    target.style.setProperty("opacity", "0");
    restore();
    expect(target.style.getPropertyValue("opacity")).toBe("0.8");
    expect(target.style.getPropertyPriority("opacity")).toBe("important");
  });

  it("GIVEN independent targets WHEN restoration repeats THEN each original declaration remains stable", () => {
    const first = createTarget();
    const second = createTarget();
    first.style.setProperty("rotate", "2deg");
    second.style.setProperty("rotate", "-18deg");
    const restore = captureInlineStyles([first, second], ["rotate"]);
    first.style.setProperty("rotate", "none");
    second.style.removeProperty("rotate");
    restore();
    restore();
    expect(first.style.getPropertyValue("rotate")).toBe("2deg");
    expect(second.style.getPropertyValue("rotate")).toBe("-18deg");
  });

  it("GIVEN no targets or no properties WHEN restoration runs THEN unrelated declarations are unchanged", () => {
    const target = createTarget();
    target.style.setProperty("opacity", "0.5");
    captureInlineStyles([], ["opacity"])();
    captureInlineStyles([target], [])();
    expect(target.style.getPropertyValue("opacity")).toBe("0.5");
  });
});
