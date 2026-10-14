import { readFileSync } from "node:fs";

import { describe, expect, it, vi } from "vitest";

import {
  observeReadyOutcome,
  ownReadyOutcome,
  skipOwnedTransition,
  type ReadyOutcomeEvent,
} from "../../../node_modules/astro/dist/transitions/ready-owner.js";

function createTransition() {
  const ready = Promise.withResolvers<void>();
  const update = Promise.withResolvers<void>();
  const finished = Promise.withResolvers<void>();
  const state = { phase: "active" };
  const transition = {
    ready: ready.promise,
    updateCallbackDone: update.promise,
    finished: finished.promise,
  };
  const ownership = { isSuperseded: () => state.phase === "superseded" };
  return { finished, ownership, ready, state, transition, update };
}

function createPlatform() {
  return {
    reportError: vi.fn<(error: unknown) => void>(),
    reportOutcome: vi.fn<(outcome: ReadyOutcomeEvent) => void>(),
  };
}

describe("version-pinned Astro native readiness owner", () => {
  it("GIVEN native readiness succeeds WHEN observed THEN the original native promise identities remain intact", async () => {
    const fixture = createTransition();
    const outcome = observeReadyOutcome(fixture.transition, fixture.ownership);
    fixture.update.resolve();
    fixture.ready.resolve();

    await expect(outcome).resolves.toEqual({ kind: "ready" });
    expect(fixture.transition.ready).toBe(fixture.ready.promise);
    expect(fixture.transition.updateCallbackDone).toBe(fixture.update.promise);
    expect(fixture.transition.finished).toBe(fixture.finished.promise);
  });

  it("GIVEN an owned skip before readiness WHEN DOM update is pending THEN cancellation classification waits for the real DOM outcome", async () => {
    const fixture = createTransition();
    const settled = vi.fn();
    const outcome = observeReadyOutcome(fixture.transition, fixture.ownership);
    const observation = outcome.then(settled);
    fixture.state.phase = "superseded";
    fixture.ready.reject(
      new DOMException("Transition was skipped", "AbortError"),
    );
    await Promise.resolve();
    expect(settled).not.toHaveBeenCalled();
    fixture.update.resolve();

    await expect(outcome).resolves.toEqual({
      kind: "superseded",
      reason: "owned-supersession",
    });
    await observation;
    expect(settled).toHaveBeenCalledOnce();
  });

  it("GIVEN readiness already fulfilled WHEN an owned skip arrives THEN readiness does not become a false cancellation", async () => {
    const fixture = createTransition();
    const outcome = observeReadyOutcome(fixture.transition, fixture.ownership);
    fixture.update.resolve();
    fixture.ready.resolve();
    await expect(outcome).resolves.toEqual({ kind: "ready" });
    fixture.state.phase = "superseded";
    fixture.ready.reject(new DOMException("Late skip", "AbortError"));

    await expect(outcome).resolves.toEqual({ kind: "ready" });
  });

  it("GIVEN an unowned AbortError WHEN the DOM update succeeds THEN the unexpected visual error remains reportable", async () => {
    const fixture = createTransition();
    const error = new DOMException("Unexpected abort", "AbortError");
    const outcome = observeReadyOutcome(fixture.transition, fixture.ownership);
    fixture.ready.reject(error);
    fixture.update.resolve();

    await expect(outcome).resolves.toEqual({ kind: "ready-failed", error });
  });

  it("GIVEN a non-Abort visual error WHEN an owned skip exists THEN the visual failure is not misclassified", async () => {
    const fixture = createTransition();
    const error = new DOMException("Invalid visual state", "InvalidStateError");
    const outcome = observeReadyOutcome(fixture.transition, fixture.ownership);
    fixture.state.phase = "superseded";
    fixture.ready.reject(error);
    fixture.update.resolve();

    await expect(outcome).resolves.toEqual({ kind: "ready-failed", error });
  });

  it("GIVEN an Error merely named AbortError WHEN superseded THEN only a real native DOMException qualifies for expected cancellation", async () => {
    const fixture = createTransition();
    const error = new Error("Application failure");
    error.name = "AbortError";
    const outcome = observeReadyOutcome(fixture.transition, fixture.ownership);
    fixture.state.phase = "superseded";
    fixture.ready.reject(error);
    fixture.update.resolve();

    await expect(outcome).resolves.toEqual({ kind: "ready-failed", error });
  });

  it("GIVEN a callback failure after owned cancellation WHEN observed THEN the original router retains diagnostics without an extra ready report", async () => {
    const fixture = createTransition();
    const error = new Error("DOM update failed");
    const outcome = observeReadyOutcome(fixture.transition, fixture.ownership);
    fixture.state.phase = "superseded";
    fixture.ready.reject(
      new DOMException("Transition was skipped", "AbortError"),
    );
    await Promise.resolve();
    fixture.update.reject(error);

    await expect(outcome).resolves.toEqual({
      kind: "update-failed",
      diagnosticOwner: "astro-router",
      error,
    });
  });

  it("GIVEN the original finished cleanup owner WHEN cancellation and completion settle THEN cleanup remains exactly once", async () => {
    const fixture = createTransition();
    const cleanup = vi.fn();
    const originalCleanup = fixture.transition.finished.finally(cleanup);
    const outcome = observeReadyOutcome(fixture.transition, fixture.ownership);
    fixture.state.phase = "superseded";
    fixture.ready.reject(
      new DOMException("Transition was skipped", "AbortError"),
    );
    fixture.update.resolve();
    fixture.finished.resolve();
    fixture.finished.resolve();
    await outcome;
    await originalCleanup;

    expect(cleanup).toHaveBeenCalledOnce();
  });

  it("GIVEN the pinned installed router WHEN inspecting the patch boundary THEN only native readiness gains ownership and original finally chains remain", () => {
    const router = readFileSync(
      new URL(
        "../../../node_modules/astro/dist/transitions/router.js",
        import.meta.url,
      ),
      "utf8",
    );
    expect(router).toContain("mostRecentTransition.transitionSkipped = true;");
    expect(router).toContain("ownNativeReadyOutcome(currentTransition);");
    expect(router).toContain(
      "currentTransition.viewTransition?.updateCallbackDone.finally(async () => {",
    );
    expect(router).toContain(
      "currentTransition.viewTransition?.finished.finally(() => {",
    );
    expect(router).toContain(
      "skipOwnedTransition(mostRecentTransition.viewTransition",
    );
  });

  it("GIVEN a native skip throws WHEN supersession is attempted THEN ownership stays unclaimed and a later AbortError is unexpected", async () => {
    const fixture = createTransition();
    const skipError = new Error("Native skip failed");
    const native = {
      skipTransition: vi.fn(() => {
        throw skipError;
      }),
    };
    const markSuperseded = vi.fn(() => {
      fixture.state.phase = "superseded";
    });
    expect(() => skipOwnedTransition(native, { markSuperseded })).toThrow(
      skipError,
    );
    expect(markSuperseded).not.toHaveBeenCalled();
    const platform = createPlatform();
    const observation = ownReadyOutcome(
      fixture.transition,
      fixture.ownership,
      platform,
    );
    const error = new DOMException("Unrelated abort", "AbortError");
    fixture.ready.reject(error);
    fixture.update.resolve();
    await observation;

    expect(platform.reportError).toHaveBeenCalledExactlyOnceWith(error);
    expect(platform.reportOutcome).not.toHaveBeenCalled();
  });

  it("GIVEN an owned successful native skip WHEN update succeeds THEN one structured cancellation is emitted and no error is reported", async () => {
    const fixture = createTransition();
    const platform = createPlatform();
    const native = {
      skipTransition: vi.fn(() =>
        fixture.ready.reject(new DOMException("Skipped", "AbortError")),
      ),
    };
    const observation = ownReadyOutcome(
      fixture.transition,
      fixture.ownership,
      platform,
    );
    skipOwnedTransition(native, {
      markSuperseded: () => {
        fixture.state.phase = "superseded";
      },
    });
    fixture.update.resolve();
    await observation;

    expect(native.skipTransition).toHaveBeenCalledOnce();
    expect(platform.reportOutcome).toHaveBeenCalledExactlyOnceWith({
      status: "superseded",
      reason: "owned-supersession",
    });
    expect(platform.reportError).not.toHaveBeenCalled();
  });

  it("GIVEN readiness completed WHEN owned supersession follows THEN no cancellation event or error is emitted", async () => {
    const fixture = createTransition();
    const platform = createPlatform();
    fixture.update.resolve();
    fixture.ready.resolve();
    await ownReadyOutcome(fixture.transition, fixture.ownership, platform);
    skipOwnedTransition(
      { skipTransition: vi.fn() },
      {
        markSuperseded: () => {
          fixture.state.phase = "superseded";
        },
      },
    );

    expect(platform.reportOutcome).not.toHaveBeenCalled();
    expect(platform.reportError).not.toHaveBeenCalled();
  });

  it("GIVEN DOM callback rejection WHEN readiness rejects THEN delegated diagnostics add no ready error report", async () => {
    const fixture = createTransition();
    const platform = createPlatform();
    const error = new Error("Callback failure");
    const observation = ownReadyOutcome(
      fixture.transition,
      fixture.ownership,
      platform,
    );
    fixture.ready.reject(error);
    await Promise.resolve();
    fixture.update.reject(error);
    await observation;

    expect(platform.reportOutcome).toHaveBeenCalledExactlyOnceWith({
      status: "update-failed",
      diagnosticOwner: "astro-router",
    });
    expect(platform.reportError).not.toHaveBeenCalled();
  });

  it("GIVEN structured outcome dispatch throws WHEN the readiness owner settles THEN the terminal path reports that unexpected failure once", async () => {
    const fixture = createTransition();
    const platform = createPlatform();
    const error = new Error("Outcome dispatch failed");
    platform.reportOutcome.mockImplementation(() => {
      throw error;
    });
    const observation = ownReadyOutcome(
      fixture.transition,
      fixture.ownership,
      platform,
    );
    fixture.state.phase = "superseded";
    fixture.ready.reject(new DOMException("Skipped", "AbortError"));
    fixture.update.resolve();
    await observation;

    expect(platform.reportError).toHaveBeenCalledExactlyOnceWith(error);
    expect(platform.reportOutcome).toHaveBeenCalledOnce();
  });
});
