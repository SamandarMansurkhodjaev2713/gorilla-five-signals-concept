import { beforeEach, describe, expect, it, vi } from "vitest";

import { NATIVE_MOTION_EASING } from "@/motion/native-easing";
import { MANIFESTO_SELECTOR } from "@/motion/scene-setups/manifesto-motion-spec";
import {
  createNativeManifesto,
  readManifestoTargets,
} from "@/motion/scene-setups/manifesto-native";
import { createManifestoPlan } from "@/motion/scene-setups/manifesto-native-plan";

import type { ManifestoTargets } from "@/motion/scene-setups/manifesto-native-plan";

const ports = vi.hoisted(() => {
  const constructions: unknown[] = [];
  return { supported: vi.fn<() => boolean>(), constructions };
});

vi.mock("@/motion/native/finite-animation-player", () => ({
  supportsFiniteAnimationPlayer: ports.supported,
  FiniteAnimationPlayer: class {
    constructor(options: unknown) {
      ports.constructions.push(options);
    }
  },
}));

function target(
  name: string,
  overrides: Readonly<Record<string, string>> = {},
): HTMLElement {
  const value = {
    name,
    style: {
      getPropertyValue: (property: string) => overrides[property] ?? "",
      getPropertyPriority: () => "",
    },
    get offsetWidth(): never {
      throw new Error("Unexpected layout read.");
    },
  };
  // TYPE-EXCEPTION: This pure-plan/inline-guard port preserves target identity;
  // real DOM and native animation playback are verified by browser comparisons.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  return value as unknown as HTMLElement;
}

function targets(): ManifestoTargets {
  return {
    handoff: target("handoff"),
    copy: target("copy"),
    lines: Array.from({ length: 3 }, (_, index) => target(`line-${index}`)),
    transmission: Array.from({ length: 5 }, (_, index) =>
      target(`transmission-${index}`),
    ),
    signals: [target("signal")],
  };
}

function rootFor(
  elements: ManifestoTargets,
  windowValue: unknown = {},
): HTMLElement {
  const root = {
    ownerDocument: { defaultView: windowValue },
    querySelector: (selector: string) =>
      selector === MANIFESTO_SELECTOR.handoff
        ? elements.handoff
        : selector === MANIFESTO_SELECTOR.copy
          ? elements.copy
          : null,
    querySelectorAll: (selector: string) =>
      selector === MANIFESTO_SELECTOR.lines
        ? elements.lines
        : selector === MANIFESTO_SELECTOR.transmission
          ? elements.transmission
          : selector === MANIFESTO_SELECTOR.signals
            ? elements.signals
            : [],
  };
  // TYPE-EXCEPTION: Only ownerDocument and scoped queries are used at this port;
  // the real capability probe/player is tested independently and in browsers.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  return root as unknown as HTMLElement;
}

beforeEach(() => {
  ports.supported.mockReturnValue(true);
  ports.constructions.length = 0;
});

describe("manifesto native choreography", () => {
  it("GIVEN the actual eleven targets WHEN planned THEN implicit appends retain the complete 1250ms schedule", () => {
    const elements = targets();
    const cues = createManifestoPlan(elements);
    expect(cues).toHaveLength(11);
    const expectedStarts = [
      0, 260, 335, 410, 630, 810, 855, 900, 945, 990, 950,
    ];
    expect(cues.map((cue) => cue.delayMs)).toEqual(expectedStarts);
    expect(
      Math.max(...cues.map((cue) => cue.delayMs + cue.durationMs)),
    ).toBeCloseTo(1250, 6);
    expect(cues.map((cue) => cue.durationMs)).toEqual([
      260, 640, 640, 640, 260, 260, 260, 260, 260, 260, 260,
    ]);
    expect(cues[0]).toEqual(
      expect.objectContaining({
        target: elements.handoff,
        easing: NATIVE_MOTION_EASING.material,
        frames: [
          {
            transform: "translateX(-50%) scaleY(0)",
            transformOrigin: "top center",
          },
          {
            transform: "translateX(-50%) scaleY(1)",
            transformOrigin: "top center",
          },
        ],
      }),
    );
    expect(cues[4]).toEqual(
      expect.objectContaining({
        target: elements.copy,
        easing: NATIVE_MOTION_EASING.enter,
        frames: [
          {
            opacity: 0,
            visibility: "hidden",
            transform: "translate3d(0, 24px, 0)",
          },
          {
            opacity: 1,
            visibility: "visible",
            transform: "translate3d(0, 0px, 0)",
          },
        ],
      }),
    );
  });

  it("GIVEN one extra transmission WHEN planned THEN later append positions follow the actual preceding maximum", () => {
    const elements = targets();
    const cues = createManifestoPlan({
      ...elements,
      transmission: [...elements.transmission, target("extra")],
    });
    expect(cues.at(-1)?.delayMs).toBeCloseTo(995, 6);
    expect(
      Math.max(...cues.map((cue) => cue.delayMs + cue.durationMs)),
    ).toBeCloseTo(1295, 6);
  });

  it.each(["lines", "transmission", "signals"] as const)(
    "GIVEN an empty %s group WHEN planned directly THEN an incomplete choreography is rejected",
    (group) => {
      expect(() => createManifestoPlan({ ...targets(), [group]: [] })).toThrow(
        RangeError,
      );
    },
  );
});

describe("manifesto DOM boundary", () => {
  it("GIVEN scoped targets WHEN read THEN all references retain their identities", () => {
    const elements = targets();
    expect(readManifestoTargets(rootFor(elements))).toEqual(elements);
  });

  it("GIVEN ordinary stylesheet poses WHEN native is created THEN no geometry is read and one complete player is constructed", () => {
    const root = rootFor(targets());
    const onComplete = vi.fn(),
      onFailure = vi.fn();
    expect(
      createNativeManifesto({ root, onComplete, onFailure }),
    ).not.toBeNull();
    expect(ports.constructions).toHaveLength(1);
    expect(ports.constructions[0]).toEqual(
      expect.objectContaining({
        idPrefix: "gorilla-manifesto",
        label: "Manifesto",
        onComplete,
        onFailure,
      }),
    );
  });

  it("GIVEN no active window WHEN requested THEN no support probe or player is allocated", () => {
    expect(
      createNativeManifesto({
        root: rootFor(targets(), null),
        onComplete: vi.fn(),
        onFailure: vi.fn(),
      }),
    ).toBeNull();
    expect(ports.supported).not.toHaveBeenCalled();
    expect(ports.constructions).toHaveLength(0);
  });

  it("GIVEN unsupported public native APIs WHEN requested THEN fallback is selected without allocation", () => {
    ports.supported.mockReturnValue(false);
    expect(
      createNativeManifesto({
        root: rootFor(targets()),
        onComplete: vi.fn(),
        onFailure: vi.fn(),
      }),
    ).toBeNull();
    expect(ports.constructions).toHaveLength(0);
  });

  it.each([
    "transform",
    "transform-origin",
    "translate",
    "rotate",
    "scale",
    "clip-path",
    "opacity",
    "visibility",
  ])(
    "GIVEN custom inline %s WHEN requested THEN native never overwrites the authored presentation",
    (property) => {
      const elements = {
        ...targets(),
        copy: target("custom", { [property]: "0" }),
      };
      expect(
        createNativeManifesto({
          root: rootFor(elements),
          onComplete: vi.fn(),
          onFailure: vi.fn(),
        }),
      ).toBeNull();
      expect(ports.constructions).toHaveLength(0);
    },
  );

  it.each(["lines", "transmission", "signals"] as const)(
    "GIVEN a missing %s group WHEN native is requested THEN verified fallback handles the shape",
    (group) => {
      expect(
        createNativeManifesto({
          root: rootFor({ ...targets(), [group]: [] }),
          onComplete: vi.fn(),
          onFailure: vi.fn(),
        }),
      ).toBeNull();
    },
  );

  it("GIVEN a missing required hook WHEN read THEN the contract violation is not silently accepted", () => {
    const root = rootFor(targets());
    vi.spyOn(root, "querySelector").mockReturnValue(null);
    expect(() => readManifestoTargets(root)).toThrow(
      "Manifesto motion hook is missing",
    );
  });
});
