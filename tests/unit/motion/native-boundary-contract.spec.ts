import { describe, expect, it } from "vitest";

import {
  nativeBoundaryFailures,
  type NativeBoundaryEvidence,
} from "../../e2e/support/native-boundary-contract";

const CANCELLATION = { status: "superseded", reason: "owned-supersession" };

function createEvidence(
  overrides: Partial<NativeBoundaryEvidence> = {},
): NativeBoundaryEvidence {
  return {
    contactIntents: 1,
    nativeTransitions: 2,
    firstReady: { kind: "fulfilled" },
    finalReady: { kind: "fulfilled" },
    firstOwnedSkips: 0,
    outcomes: [],
    unhandled: [],
    ...overrides,
  };
}

describe("phase-aware real native navigation contract", () => {
  it("GIVEN readiness fulfilled before supersession WHEN no cancellation event exists THEN valid navigation is accepted", () => {
    expect(nativeBoundaryFailures(createEvidence())).toEqual([]);
  });

  it("GIVEN readiness fulfilled WHEN a later successful skip occurs THEN a cancellation event is still not required", () => {
    expect(
      nativeBoundaryFailures(createEvidence({ firstOwnedSkips: 1 })),
    ).toEqual([]);
  });

  it("GIVEN readiness fulfilled WHEN duplicate skip ownership is recorded THEN the route-intent bound still fails", () => {
    expect(
      nativeBoundaryFailures(createEvidence({ firstOwnedSkips: 2 })),
    ).toContain(
      "First native skip ownership must be an integer within the route-intent bound.",
    );
  });

  it("GIVEN malformed skip counts WHEN readiness fulfilled THEN numeric edge cases cannot bypass ownership validation", () => {
    for (const firstOwnedSkips of [
      -1,
      0.5,
      Number.NaN,
      Number.POSITIVE_INFINITY,
    ]) {
      expect(
        nativeBoundaryFailures(createEvidence({ firstOwnedSkips })),
      ).toContain(
        "First native skip ownership must be an integer within the route-intent bound.",
      );
    }
  });

  it("GIVEN owned native readiness rejects WHEN one structured cancellation exists THEN valid navigation is accepted", () => {
    expect(
      nativeBoundaryFailures(
        createEvidence({
          firstReady: { kind: "rejected", reason: "native-abort" },
          firstOwnedSkips: 1,
          outcomes: [CANCELLATION],
        }),
      ),
    ).toEqual([]);
  });

  it("GIVEN the test observer handles rejected readiness WHEN the production owner emits nothing THEN the missing owner still fails", () => {
    expect(
      nativeBoundaryFailures(
        createEvidence({
          firstReady: { kind: "rejected", reason: "native-abort" },
          firstOwnedSkips: 1,
        }),
      ),
    ).toContain(
      "Rejected owned AbortError requires exactly one structured cancellation.",
    );
  });

  it("GIVEN readiness fulfilled WHEN a bogus cancellation event appears THEN the contract rejects false ownership", () => {
    expect(
      nativeBoundaryFailures(createEvidence({ outcomes: [CANCELLATION] })),
    ).toContain("Fulfilled readiness must not emit cancellation.");
  });

  it("GIVEN an unexpected readiness rejection WHEN even a cancellation event appears THEN the test cannot hide the error", () => {
    expect(
      nativeBoundaryFailures(
        createEvidence({
          firstReady: { kind: "rejected", reason: "unexpected" },
          firstOwnedSkips: 1,
          outcomes: [CANCELLATION],
        }),
      ),
    ).toContain("Unexpected native readiness rejection remains.");
  });

  it("GIVEN skip ownership was not acquired WHEN native readiness rejects THEN a cancellation event alone cannot pass", () => {
    expect(
      nativeBoundaryFailures(
        createEvidence({
          firstReady: { kind: "rejected", reason: "native-abort" },
          outcomes: [CANCELLATION],
        }),
      ),
    ).toContain(
      "Rejected AbortError must follow exactly one successful owned skip.",
    );
  });

  it("GIVEN native readiness rejects WHEN duplicate cancellation events appear THEN cardinality remains strict", () => {
    expect(
      nativeBoundaryFailures(
        createEvidence({
          firstReady: { kind: "rejected", reason: "native-abort" },
          firstOwnedSkips: 1,
          outcomes: [CANCELLATION, CANCELLATION],
        }),
      ),
    ).toContain(
      "Rejected owned AbortError requires exactly one structured cancellation.",
    );
  });

  it("GIVEN cancellation contains unapproved fields WHEN native readiness rejects THEN the strict schema rejects it", () => {
    expect(
      nativeBoundaryFailures(
        createEvidence({
          firstReady: { kind: "rejected", reason: "native-abort" },
          firstOwnedSkips: 1,
          outcomes: [{ ...CANCELLATION, message: "Unexpected payload" }],
        }),
      ),
    ).toContain(
      "Rejected owned AbortError requires exactly one structured cancellation.",
    );
  });

  it("GIVEN empty native targets and pending final state WHEN validation runs THEN it cannot pass vacuously", () => {
    const failures = nativeBoundaryFailures(
      createEvidence({
        contactIntents: 0,
        nativeTransitions: 0,
        firstReady: { kind: "pending" },
        finalReady: { kind: "pending" },
        unhandled: ["unexpected-promise"],
      }),
    );
    expect(failures).toHaveLength(5);
  });
});
