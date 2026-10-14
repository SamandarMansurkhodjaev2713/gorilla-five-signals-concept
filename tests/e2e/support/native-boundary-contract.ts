import { z } from "zod";

export type NativeReadyPhase =
  | { readonly kind: "pending" }
  | { readonly kind: "fulfilled" }
  | {
      readonly kind: "rejected";
      readonly reason: "native-abort" | "unexpected";
    };

export interface NativeBoundaryEvidence {
  readonly contactIntents: number;
  readonly nativeTransitions: number;
  readonly firstReady: NativeReadyPhase;
  readonly finalReady: NativeReadyPhase;
  readonly firstOwnedSkips: number;
  readonly outcomes: readonly unknown[];
  readonly unhandled: readonly string[];
}

const EXPECTED_NATIVE_TRANSITIONS = 2;
const EXPECTED_CONTACT_INTENTS = 1;
const MAXIMUM_FIRST_OWNED_SKIPS = EXPECTED_CONTACT_INTENTS;
const supersededOutcome = z
  .object({
    status: z.literal("superseded"),
    reason: z.literal("owned-supersession"),
  })
  .strict();

/** Reject absent ownership evidence even when a test observer handles readiness. */
export function nativeBoundaryFailures(
  evidence: NativeBoundaryEvidence,
): string[] {
  const failures: string[] = [];
  if (evidence.nativeTransitions !== EXPECTED_NATIVE_TRANSITIONS)
    failures.push("Two real native transitions are required.");
  if (evidence.contactIntents !== EXPECTED_CONTACT_INTENTS)
    failures.push("Exactly one second real route intent is required.");
  if (
    !Number.isInteger(evidence.firstOwnedSkips) ||
    evidence.firstOwnedSkips < 0 ||
    evidence.firstOwnedSkips > MAXIMUM_FIRST_OWNED_SKIPS
  )
    failures.push(
      "First native skip ownership must be an integer within the route-intent bound.",
    );
  if (evidence.unhandled.length !== 0)
    failures.push("Unhandled promises remain.");
  if (evidence.finalReady.kind !== "fulfilled")
    failures.push("Final Contact native readiness must fulfill.");
  return [...failures, ...readinessOutcomeFailures(evidence)];
}

function readinessOutcomeFailures(evidence: NativeBoundaryEvidence): string[] {
  if (evidence.firstReady.kind === "pending")
    return ["First native readiness is still pending."];
  if (evidence.firstReady.kind === "fulfilled") {
    return evidence.outcomes.length === 0
      ? []
      : ["Fulfilled readiness must not emit cancellation."];
  }
  if (evidence.firstReady.reason !== "native-abort")
    return ["Unexpected native readiness rejection remains."];
  if (evidence.firstOwnedSkips !== 1)
    return [
      "Rejected AbortError must follow exactly one successful owned skip.",
    ];
  return evidence.outcomes.length === 1 &&
    supersededOutcome.safeParse(evidence.outcomes[0]).success
    ? []
    : [
        "Rejected owned AbortError requires exactly one structured cancellation.",
      ];
}
