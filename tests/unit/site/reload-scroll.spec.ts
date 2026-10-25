import { describe, expect, it, vi } from "vitest";

import {
  parseReloadScrollHandoff,
  readInitialReloadScroll,
} from "@/features/site/reload-scroll";

const HANDOFF_PATH = "/uz/";
function createHandoff(position: number, path = HANDOFF_PATH): string {
  return JSON.stringify({ path, position });
}

describe("one-use reload handoff validation", () => {
  it.each([0, 600])(
    "GIVEN a same-route coordinate %s WHEN parsed THEN a typed captured result is returned",
    (position) => {
      expect(
        parseReloadScrollHandoff({
          serialized: createHandoff(position),
          path: HANDOFF_PATH,
        }),
      ).toEqual({ kind: "captured", position });
    },
  );
  it.each([null, undefined])(
    "GIVEN absent storage %s WHEN parsed THEN absence is explicit",
    (serialized) => {
      expect(
        parseReloadScrollHandoff({ serialized, path: HANDOFF_PATH }),
      ).toEqual({ kind: "absent" });
    },
  );
  it("GIVEN malformed JSON WHEN parsed THEN rejection is classified without accepting content", () => {
    expect(
      parseReloadScrollHandoff({ serialized: "{", path: HANDOFF_PATH }),
    ).toEqual({ kind: "discarded", reason: "invalid-json" });
  });
  it.each([
    0,
    "null",
    "[]",
    "{}",
    " ".repeat(2049),
    JSON.stringify({ path: HANDOFF_PATH, position: -1 }),
    JSON.stringify({ path: HANDOFF_PATH, position: "600" }),
  ])(
    "GIVEN an invalid handoff %j WHEN parsed THEN the record is rejected",
    (serialized) => {
      expect(
        parseReloadScrollHandoff({ serialized, path: HANDOFF_PATH }),
      ).toEqual({ kind: "discarded", reason: "invalid-record" });
    },
  );
  it("GIVEN a different route WHEN parsed THEN its coordinate cannot leak into the current document", () => {
    expect(
      parseReloadScrollHandoff({
        serialized: createHandoff(600, "/uz/contact/"),
        path: HANDOFF_PATH,
      }),
    ).toEqual({ kind: "discarded", reason: "different-route" });
  });
  it("GIVEN an unexpected parser failure WHEN inspected THEN it is not mislabeled as malformed input", () => {
    const failure = new RangeError("Fixture parser failure");
    const parser = vi.spyOn(JSON, "parse").mockImplementationOnce(() => {
      throw failure;
    });
    try {
      expect(() =>
        parseReloadScrollHandoff({
          serialized: createHandoff(600),
          path: HANDOFF_PATH,
        }),
      ).toThrow(failure);
    } finally {
      parser.mockRestore();
    }
  });
});

describe("initial reload scroll capture", () => {
  it("GIVEN a legacy app coordinate without a pagehide snapshot WHEN a reload starts THEN old route state remains compatible", () => {
    expect(
      readInitialReloadScroll({
        navigationType: "reload",
        historyState: { gorillaScrollY: 600, scrollY: 0 },
      }),
    ).toBe(600);
  });
  it("GIVEN a fresh pagehide snapshot and stale router/menu coordinates WHEN a reload starts THEN the actual departing viewport wins", () => {
    expect(
      readInitialReloadScroll({
        navigationType: "reload",
        historyState: {
          scrollY: 0,
          gorillaScrollY: 0,
        },
        handoffPosition: 600,
      }),
    ).toBe(600);
  });

  it("GIVEN a captured top coordinate WHEN router state is nonzero THEN zero remains a valid preferred snapshot", () => {
    expect(
      readInitialReloadScroll({
        navigationType: "reload",
        historyState: { scrollY: 600 },
        handoffPosition: 0,
      }),
    ).toBe(0);
  });

  it("GIVEN an invalid pagehide snapshot WHEN router state is valid THEN validation falls back without accepting NaN", () => {
    expect(
      readInitialReloadScroll({
        navigationType: "reload",
        historyState: { scrollY: 600 },
        handoffPosition: NaN,
      }),
    ).toBe(600);
  });
  it.each([0, 600, 597.5])(
    "GIVEN a reload coordinate %s WHEN captured THEN zero and finite positive positions survive",
    (scrollY) => {
      expect(
        readInitialReloadScroll({
          navigationType: "reload",
          historyState: { scrollY },
        }),
      ).toBe(scrollY);
    },
  );

  it.each([undefined, null, "navigate", "back_forward", "prerender"])(
    "GIVEN navigation type %s WHEN captured THEN a fresh load or traversal cannot use the reload fallback",
    (navigationType) => {
      expect(
        readInitialReloadScroll({
          navigationType,
          historyState: { scrollY: 600 },
          handoffPosition: 600,
        }),
      ).toBeNull();
    },
  );

  it.each([
    undefined,
    null,
    [],
    "600",
    {},
    { scrollY: "600" },
    { scrollY: -1 },
    { scrollY: NaN },
    { scrollY: Infinity },
  ])(
    "GIVEN invalid history state %j WHEN captured THEN no unsafe coordinate is restored",
    (historyState) => {
      expect(
        readInitialReloadScroll({ navigationType: "reload", historyState }),
      ).toBeNull();
    },
  );

  it("GIVEN a captured reload WHEN live router state changes later THEN the captured coordinate remains unchanged", () => {
    const historyState = { scrollY: 600 };
    const captured = readInitialReloadScroll({
      navigationType: "reload",
      historyState,
    });
    historyState.scrollY = 668;
    expect(captured).toBe(600);
  });
});
