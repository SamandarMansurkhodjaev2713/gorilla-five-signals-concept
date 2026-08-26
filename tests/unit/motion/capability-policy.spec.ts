import { describe, expect, it, vi } from "vitest";

import {
  observeMotionCapability,
  resolveMotionCapability,
  type MotionEnvironment,
  type MotionMediaQuery,
  type MotionWindow,
  type UserMotionPreference,
} from "@/motion/capability-policy";

function buildEnvironment(
  overrides: Partial<MotionEnvironment> = {},
): MotionEnvironment {
  return {
    coarsePointer: false,
    saveData: false,
    systemReduced: false,
    userPreference: "system",
    ...overrides,
  };
}

describe("resolveMotionCapability", () => {
  it("GIVEN an explicit reduced preference WHEN capability resolves THEN it overrides every device hint", () => {
    expect(
      resolveMotionCapability(
        buildEnvironment({
          coarsePointer: true,
          saveData: true,
          userPreference: "reduced",
        }),
      ),
    ).toEqual({ kind: "reduced", reason: "user-disabled" });
  });

  it("GIVEN explicit full motion WHEN the system prefers reduced motion THEN the explicit choice wins", () => {
    expect(
      resolveMotionCapability(
        buildEnvironment({
          systemReduced: true,
          userPreference: "full",
        }),
      ),
    ).toEqual({ kind: "full", reason: "user-enabled" });
  });

  it("GIVEN system reduced motion and no override WHEN capability resolves THEN reduced motion is selected", () => {
    expect(
      resolveMotionCapability(buildEnvironment({ systemReduced: true })),
    ).toEqual({ kind: "reduced", reason: "system-preference" });
  });

  it("GIVEN an explicit Lite preference WHEN capability resolves THEN the selected bounded tier wins", () => {
    expect(
      resolveMotionCapability(
        buildEnvironment({
          systemReduced: true,
          userPreference: "lite",
        }),
      ),
    ).toEqual({ kind: "lite", reason: "user-selected" });
  });

  it("GIVEN data saver and a coarse pointer WHEN capability resolves THEN the data-saving reason wins", () => {
    expect(
      resolveMotionCapability(
        buildEnvironment({ coarsePointer: true, saveData: true }),
      ),
    ).toEqual({ kind: "lite", reason: "data-saver" });
  });

  it("GIVEN a capable fine pointer WHEN no constraint exists THEN full motion is selected", () => {
    expect(resolveMotionCapability(buildEnvironment())).toEqual({
      kind: "full",
      reason: "capable-fine-pointer",
    });
  });

  it("GIVEN a coarse pointer without stronger constraints WHEN capability resolves THEN Lite protects the touch device", () => {
    expect(
      resolveMotionCapability(buildEnvironment({ coarsePointer: true })),
    ).toEqual({ kind: "lite", reason: "touch" });
  });
});

class TestMediaQuery extends EventTarget implements MotionMediaQuery {
  public matches: boolean;

  public constructor(matches = false) {
    super();
    this.matches = matches;
  }

  public setMatches(matches: boolean): void {
    this.matches = matches;
    this.dispatchEvent(new Event("change"));
  }
}

describe("observeMotionCapability", () => {
  it("GIVEN changing media and preference inputs WHEN observed THEN only meaningful capability changes publish and cleanup is final", () => {
    const reducedQuery = new TestMediaQuery();
    const pointerQuery = new TestMediaQuery();
    const queries = new Map<string, TestMediaQuery>([
      ["(prefers-reduced-motion: reduce)", reducedQuery],
      ["(pointer: coarse)", pointerQuery],
    ]);
    const windowValue: MotionWindow = {
      matchMedia(query): MotionMediaQuery {
        const result = queries.get(query);
        if (result === undefined) {
          throw new Error(`Unexpected media query: ${query}`);
        }
        return result;
      },
    };
    const changes = vi.fn();
    let preference: UserMotionPreference = "system";
    const controller = observeMotionCapability({
      navigatorValue: {
        connection: { saveData: false },
        userAgent: "unit-test",
      },
      onChange: changes,
      userPreference: () => preference,
      windowValue,
    });

    expect(controller.current()).toEqual({
      kind: "full",
      reason: "capable-fine-pointer",
    });
    controller.refresh();
    expect(changes).not.toHaveBeenCalled();

    pointerQuery.setMatches(true);
    expect(changes).toHaveBeenLastCalledWith({ kind: "lite", reason: "touch" });

    preference = "reduced";
    controller.refresh();
    expect(changes).toHaveBeenLastCalledWith({
      kind: "reduced",
      reason: "user-disabled",
    });

    const callsBeforeDestroy = changes.mock.calls.length;
    controller.destroy();
    reducedQuery.setMatches(true);
    expect(changes).toHaveBeenCalledTimes(callsBeforeDestroy);
  });

  it("GIVEN a data-saving connection WHEN observed THEN Lite is reported without unsafe assumptions about connection shape", () => {
    const query = new TestMediaQuery();
    const windowValue: MotionWindow = {
      matchMedia: () => query,
    };

    const controller = observeMotionCapability({
      navigatorValue: {
        connection: { saveData: true },
        userAgent: "unit-test",
      },
      onChange: vi.fn(),
      userPreference: () => "system",
      windowValue,
    });
    expect(controller.current()).toEqual({
      kind: "lite",
      reason: "data-saver",
    });
    controller.destroy();

    const unknownConnectionController = observeMotionCapability({
      navigatorValue: {
        connection: "unsupported",
        userAgent: "unit-test",
      },
      onChange: vi.fn(),
      userPreference: () => "system",
      windowValue,
    });
    expect(unknownConnectionController.current()).toEqual({
      kind: "full",
      reason: "capable-fine-pointer",
    });
    unknownConnectionController.destroy();
  });
});
