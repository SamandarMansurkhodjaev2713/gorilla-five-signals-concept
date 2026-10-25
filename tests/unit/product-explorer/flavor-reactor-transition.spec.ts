import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Mock } from "vitest";

import { animateWorld } from "@/features/flavor-reactor/flavor-reactor-choreography";
import { captureReactorPresentation } from "@/features/flavor-reactor/flavor-reactor-presentation";
import { ReactorTransition } from "@/features/flavor-reactor/flavor-reactor-transition";

import type { ReactorContext } from "@/features/flavor-reactor/flavor-reactor-presentation";

vi.mock("@/features/flavor-reactor/flavor-reactor-choreography", () => ({
  animateWorld: vi.fn(),
}));
vi.mock("@/features/flavor-reactor/flavor-reactor-presentation", () => ({
  captureReactorPresentation: vi.fn(),
}));

const LEAVING_ATTRIBUTE = "data-reactor-leaving";
const PREPARING_ATTRIBUTE = "data-reactor-preparing";
const animateWorldMock = vi.mocked(animateWorld);
const capturePresentationMock = vi.mocked(captureReactorPresentation);

class ElementHarness {
  private readonly attributes = new Map<string, string>();

  constructor(
    leaving: string | null = null,
    private readonly onMutation: () => void = () => undefined,
  ) {
    if (leaving !== null) this.attributes.set(LEAVING_ATTRIBUTE, leaving);
  }

  getAttribute(name: string): string | null {
    return this.attributes.get(name) ?? null;
  }

  primeAttribute(name: string, value: string): void {
    this.attributes.set(name, value);
  }

  removeAttribute(name: string): void {
    this.attributes.delete(name);
    this.onMutation();
  }

  setAttribute(name: string, value: string): void {
    this.attributes.set(name, value);
    this.onMutation();
  }
}

interface TransitionHarness {
  readonly cleanupOrder: string[];
  readonly context: ReactorContext;
  readonly contextCalls: Mock<
    (callback: () => void) => { kill(revert: boolean): void }
  >;
  readonly failures: unknown[];
  readonly incoming: HTMLElement;
  readonly incomingHarness: ElementHarness;
  readonly onComplete: Mock<() => void>;
  readonly onFailure: Mock<(error: unknown) => void>;
  readonly outgoing: HTMLElement | null;
  readonly outgoingHarness: ElementHarness | null;
  readonly kill: Mock<(revert: boolean) => void>;
  readonly restorePresentation: Mock<() => void>;
  readonly root: HTMLElement;
}

function asElement(element: ElementHarness): HTMLElement {
  // TYPE-EXCEPTION: The transition only consumes the three attribute methods
  // implemented by this focused DOM ownership fake.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  return element as unknown as HTMLElement;
}

function createTransitionHarness(
  options: {
    readonly incomingPreparing?: string;
    readonly outgoing?: "absent" | "leased" | "none";
  } = {},
): TransitionHarness {
  const cleanupOrder: string[] = [];
  const failures: unknown[] = [];
  const incomingHarness = new ElementHarness(null, () =>
    cleanupOrder.push("preparing"),
  );
  if (options.incomingPreparing !== undefined) {
    incomingHarness.primeAttribute(
      PREPARING_ATTRIBUTE,
      options.incomingPreparing,
    );
  }
  const rootHarness = new ElementHarness();
  const outgoingKind = options.outgoing ?? "absent";
  const outgoingHarness =
    outgoingKind === "none"
      ? null
      : new ElementHarness(
          outgoingKind === "leased" ? "previous-owner" : null,
          () => cleanupOrder.push("lease"),
        );
  const kill = vi.fn((revert: boolean): void => {
    cleanupOrder.push(revert ? "context-revert" : "context");
  });
  const restorePresentation = vi.fn((): void => {
    cleanupOrder.push("presentation");
  });
  const onComplete = vi.fn((): void => {
    cleanupOrder.push("complete");
  });
  const onFailure = vi.fn((error: unknown): void => {
    failures.push(error);
  });
  const contextCalls = vi.fn(
    (callback: () => void): { kill(revert: boolean): void } => {
      callback();
      return { kill };
    },
  );
  const contextValue = {
    gsap: { context: contextCalls, timeline: vi.fn() },
    root: asElement(rootHarness),
  };

  return {
    // TYPE-EXCEPTION: animateWorld is mocked, so this focused context fake only
    // implements the root and GSAP context surfaces consumed by the transition.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    context: contextValue as unknown as ReactorContext,
    cleanupOrder,
    contextCalls,
    failures,
    incoming: asElement(incomingHarness),
    incomingHarness,
    onComplete,
    onFailure,
    outgoing: outgoingHarness === null ? null : asElement(outgoingHarness),
    outgoingHarness,
    kill,
    restorePresentation,
    root: contextValue.root,
  };
}

function createTransition(harness: TransitionHarness): ReactorTransition {
  capturePresentationMock.mockReturnValueOnce(harness.restorePresentation);
  const transition = new ReactorTransition({
    context: harness.context,
    incoming: harness.incoming,
    onComplete: harness.onComplete,
    onFailure: harness.onFailure,
    outgoing: harness.outgoing,
  });
  harness.cleanupOrder.length = 0;
  return transition;
}

function firstAnimationOptions(): Parameters<typeof animateWorld>[0] {
  const invocation = animateWorldMock.mock.calls[0];
  if (invocation === undefined) {
    throw new Error("Expected animateWorld to have been invoked.");
  }
  return invocation[0];
}

function throwUnknown(cause: unknown): never {
  // External animation boundaries may throw any JavaScript value.
  throw cause;
}

function aggregateCauses(error: unknown): readonly unknown[] {
  if (!(error instanceof AggregateError)) {
    throw new Error("Expected an AggregateError failure.");
  }
  const causes: unknown = Reflect.get(error, "errors");
  if (!Array.isArray(causes)) {
    throw new Error("Expected AggregateError causes.");
  }
  return causes;
}

beforeEach(() => {
  animateWorldMock.mockReset();
  capturePresentationMock.mockReset();
});

describe("ReactorTransition", () => {
  it("GIVEN a fresh transition WHEN play is requested twice THEN one owned animation starts with the exact invocation options", () => {
    const harness = createTransitionHarness();
    const transition = createTransition(harness);
    let preparingDuringAnimation: string | null = null;
    animateWorldMock.mockImplementation((options) => {
      preparingDuringAnimation =
        options.incoming.getAttribute(PREPARING_ATTRIBUTE);
      return options.context.gsap.timeline();
    });

    expect(harness.incomingHarness.getAttribute(PREPARING_ATTRIBUTE)).toBe("");

    transition.play();
    transition.play();

    expect(capturePresentationMock).toHaveBeenCalledTimes(1);
    expect(capturePresentationMock).toHaveBeenCalledWith(
      harness.incoming,
      harness.outgoing,
    );
    expect(harness.contextCalls).toHaveBeenCalledTimes(1);
    expect(harness.contextCalls).toHaveBeenCalledWith(
      expect.any(Function),
      harness.root,
    );
    expect(animateWorldMock).toHaveBeenCalledTimes(1);
    const animationOptions = firstAnimationOptions();
    expect(animationOptions.context).toBe(harness.context);
    expect(animationOptions.incoming).toBe(harness.incoming);
    expect(animationOptions.outgoing).toBe(harness.outgoing);
    expect(typeof animationOptions.onComplete).toBe("function");
    expect(preparingDuringAnimation).toBe("");
    expect(
      harness.incomingHarness.getAttribute(PREPARING_ATTRIBUTE),
    ).toBeNull();
  });

  it("GIVEN an outgoing world with an existing lease WHEN transition is constructed and destroyed THEN the lease is acquired before play and restored exactly", () => {
    const harness = createTransitionHarness({
      incomingPreparing: "previous-preparing",
      outgoing: "leased",
    });
    const transition = createTransition(harness);

    expect(harness.outgoingHarness?.getAttribute(LEAVING_ATTRIBUTE)).toBe("");
    expect(harness.incomingHarness.getAttribute(PREPARING_ATTRIBUTE)).toBe("");
    expect(harness.contextCalls).not.toHaveBeenCalled();

    transition.destroy();

    expect(harness.outgoingHarness?.getAttribute(LEAVING_ATTRIBUTE)).toBe(
      "previous-owner",
    );
    expect(harness.incomingHarness.getAttribute(PREPARING_ATTRIBUTE)).toBe(
      "previous-preparing",
    );
    expect(harness.kill).not.toHaveBeenCalled();
    expect(harness.restorePresentation).toHaveBeenCalledTimes(1);
    expect(harness.onComplete).toHaveBeenCalledTimes(1);
    expect(harness.cleanupOrder).toEqual([
      "presentation",
      "preparing",
      "lease",
      "complete",
    ]);
  });

  it("GIVEN a playing transition WHEN animation completes repeatedly THEN only its nested context and completion callback release once", () => {
    const harness = createTransitionHarness();
    const transition = createTransition(harness);
    transition.play();
    const complete = firstAnimationOptions().onComplete;

    complete();
    complete();
    transition.destroy();

    expect(harness.kill).toHaveBeenCalledTimes(1);
    expect(harness.kill).toHaveBeenCalledWith(false);
    expect(harness.restorePresentation).toHaveBeenCalledTimes(1);
    expect(harness.onComplete).toHaveBeenCalledTimes(1);
    expect(harness.outgoingHarness?.getAttribute(LEAVING_ATTRIBUTE)).toBeNull();
    expect(
      harness.incomingHarness.getAttribute(PREPARING_ATTRIBUTE),
    ).toBeNull();
    expect(harness.cleanupOrder).toEqual([
      "preparing",
      "context",
      "presentation",
      "preparing",
      "lease",
      "complete",
    ]);
  });

  it("GIVEN animation completes synchronously inside GSAP context WHEN the context is assigned late THEN it is killed once and the original snapshot is restored afterward", () => {
    const harness = createTransitionHarness({ outgoing: "leased" });
    const transition = createTransition(harness);
    animateWorldMock.mockImplementation((options) => {
      options.onComplete();
      return options.context.gsap.timeline();
    });

    expect(() => transition.play()).not.toThrow();

    expect(harness.kill).toHaveBeenCalledTimes(1);
    expect(harness.kill).toHaveBeenCalledWith(false);
    expect(harness.restorePresentation).toHaveBeenCalledTimes(2);
    expect(harness.onComplete).toHaveBeenCalledTimes(1);
    expect(harness.outgoingHarness?.getAttribute(LEAVING_ATTRIBUTE)).toBe(
      "previous-owner",
    );
    expect(harness.cleanupOrder).toEqual([
      "presentation",
      "preparing",
      "lease",
      "complete",
      "preparing",
      "context",
      "presentation",
    ]);
    expect(harness.failures).toEqual([]);
  });

  it("GIVEN synchronous completion and both late cleanup operations fail WHEN play returns THEN their exact causes are aggregated without duplicate owner release", () => {
    const harness = createTransitionHarness({
      incomingPreparing: "previous-preparing",
      outgoing: "leased",
    });
    const transition = createTransition(harness);
    const killError = new Error("late context kill failed");
    const restoreError = new Error("late snapshot restore failed");
    animateWorldMock.mockImplementation((options) => {
      options.onComplete();
      return options.context.gsap.timeline();
    });
    harness.kill.mockImplementationOnce((revert) => {
      harness.cleanupOrder.push(revert ? "context-revert" : "context");
      throw killError;
    });
    harness.restorePresentation
      .mockImplementationOnce(() => harness.cleanupOrder.push("presentation"))
      .mockImplementationOnce(() => {
        harness.cleanupOrder.push("presentation");
        throw restoreError;
      });

    expect(() => transition.play()).not.toThrow();

    expect(harness.kill).toHaveBeenCalledTimes(1);
    expect(harness.kill).toHaveBeenCalledWith(false);
    expect(harness.restorePresentation).toHaveBeenCalledTimes(2);
    expect(harness.onComplete).toHaveBeenCalledTimes(1);
    expect(harness.outgoingHarness?.getAttribute(LEAVING_ATTRIBUTE)).toBe(
      "previous-owner",
    );
    expect(harness.incomingHarness.getAttribute(PREPARING_ATTRIBUTE)).toBe(
      "previous-preparing",
    );
    expect(harness.cleanupOrder).toEqual([
      "presentation",
      "preparing",
      "lease",
      "complete",
      "preparing",
      "context",
      "presentation",
    ]);
    expect(harness.failures).toHaveLength(1);
    const lateFailure = harness.failures[0];
    expect(lateFailure).toMatchObject({
      message: "Late Reactor presentation cleanup failed.",
    });
    expect(aggregateCauses(lateFailure)).toEqual([killError, restoreError]);
  });

  it("GIVEN a transition destroyed before play WHEN play is later requested THEN no context or world animation can start", () => {
    const harness = createTransitionHarness();
    const transition = createTransition(harness);

    transition.destroy();
    transition.play();

    expect(harness.contextCalls).not.toHaveBeenCalled();
    expect(animateWorldMock).not.toHaveBeenCalled();
    expect(harness.restorePresentation).toHaveBeenCalledTimes(1);
    expect(harness.onComplete).toHaveBeenCalledTimes(1);
    expect(harness.outgoingHarness?.getAttribute(LEAVING_ATTRIBUTE)).toBeNull();
  });

  it("GIVEN a playing transition destroyed by a newer selection WHEN stale completion arrives THEN it stays inert", () => {
    const harness = createTransitionHarness({
      incomingPreparing: "previous-preparing",
      outgoing: "leased",
    });
    const transition = createTransition(harness);
    transition.play();
    const staleComplete = firstAnimationOptions().onComplete;

    expect(harness.incomingHarness.getAttribute(PREPARING_ATTRIBUTE)).toBe(
      "previous-preparing",
    );

    transition.destroy();
    staleComplete();
    transition.play();

    expect(harness.kill).toHaveBeenCalledTimes(1);
    expect(harness.kill).toHaveBeenCalledWith(false);
    expect(harness.restorePresentation).toHaveBeenCalledTimes(1);
    expect(harness.onComplete).toHaveBeenCalledTimes(1);
    expect(harness.contextCalls).toHaveBeenCalledTimes(1);
    expect(harness.outgoingHarness?.getAttribute(LEAVING_ATTRIBUTE)).toBe(
      "previous-owner",
    );
    expect(harness.incomingHarness.getAttribute(PREPARING_ATTRIBUTE)).toBe(
      "previous-preparing",
    );
  });

  it("GIVEN animateWorld partially mutates then throws undefined WHEN play starts THEN ownership rolls back and reports the exact string without leaking", () => {
    const harness = createTransitionHarness({ outgoing: "leased" });
    const transition = createTransition(harness);
    animateWorldMock.mockImplementation(() => {
      return throwUnknown(undefined);
    });

    expect(() => transition.play()).not.toThrow();

    expect(harness.kill).toHaveBeenCalledTimes(1);
    expect(harness.kill).toHaveBeenCalledWith(false);
    expect(harness.restorePresentation).toHaveBeenCalledTimes(1);
    expect(harness.outgoingHarness?.getAttribute(LEAVING_ATTRIBUTE)).toBe(
      "previous-owner",
    );
    expect(harness.onComplete).toHaveBeenCalledTimes(1);
    expect(harness.failures).toEqual([undefined]);
    transition.play();
    expect(animateWorldMock).toHaveBeenCalledTimes(1);
  });

  it("GIVEN GSAP context construction throws WHEN play starts THEN cleanup completes and the failure is reported without escaping", () => {
    const harness = createTransitionHarness();
    const transition = createTransition(harness);
    const constructionError = new Error("malformed GSAP context");
    harness.contextCalls.mockImplementationOnce(() => {
      throw constructionError;
    });

    expect(() => transition.play()).not.toThrow();

    expect(animateWorldMock).not.toHaveBeenCalled();
    expect(harness.kill).not.toHaveBeenCalled();
    expect(harness.restorePresentation).toHaveBeenCalledTimes(1);
    expect(harness.onComplete).toHaveBeenCalledTimes(1);
    expect(harness.failures).toEqual([constructionError]);
  });

  it("GIVEN owned context rollback throws WHEN completion runs THEN later cleanup and onComplete still run before reporting", () => {
    const harness = createTransitionHarness({ outgoing: "leased" });
    const transition = createTransition(harness);
    const rollbackError = new Error("context rollback failed");
    transition.play();
    harness.kill.mockImplementationOnce(() => {
      harness.cleanupOrder.push("context");
      throw rollbackError;
    });

    expect(() => firstAnimationOptions().onComplete()).not.toThrow();

    expect(harness.restorePresentation).toHaveBeenCalledTimes(1);
    expect(harness.outgoingHarness?.getAttribute(LEAVING_ATTRIBUTE)).toBe(
      "previous-owner",
    );
    expect(harness.onComplete).toHaveBeenCalledTimes(1);
    expect(harness.cleanupOrder).toEqual([
      "preparing",
      "context",
      "presentation",
      "preparing",
      "lease",
      "complete",
    ]);
    expect(harness.failures).toHaveLength(1);
    const cleanupFailure = harness.failures[0];
    expect(cleanupFailure).toBeInstanceOf(AggregateError);
    expect(cleanupFailure).toMatchObject({
      message: "Reactor transition cleanup failed.",
    });
    expect(aggregateCauses(cleanupFailure)).toEqual([rollbackError]);
  });

  it("GIVEN animation setup and rollback both fail WHEN play runs THEN all cleanup completes and the combined failure is reported without leaking", () => {
    const harness = createTransitionHarness({ outgoing: "leased" });
    const transition = createTransition(harness);
    const setupError = new Error("animation setup failed");
    const rollbackError = new Error("animation rollback failed");
    animateWorldMock.mockImplementation(() => {
      throw setupError;
    });
    harness.kill.mockImplementationOnce(() => {
      harness.cleanupOrder.push("context");
      throw rollbackError;
    });

    expect(() => transition.play()).not.toThrow();

    expect(harness.restorePresentation).toHaveBeenCalledTimes(1);
    expect(harness.outgoingHarness?.getAttribute(LEAVING_ATTRIBUTE)).toBe(
      "previous-owner",
    );
    expect(harness.onComplete).toHaveBeenCalledTimes(1);
    expect(harness.cleanupOrder).toEqual([
      "context",
      "presentation",
      "preparing",
      "lease",
      "complete",
    ]);
    expect(harness.failures).toHaveLength(1);
    const combinedFailure = harness.failures[0];
    expect(combinedFailure).toBeInstanceOf(AggregateError);
    expect(combinedFailure).toMatchObject({
      message: "Reactor initialization and cleanup failed.",
    });
    const combinedCauses = aggregateCauses(combinedFailure);
    expect(combinedCauses).toHaveLength(2);
    expect(combinedCauses[0]).toBe(setupError);
    const cleanupFailure = combinedCauses[1];
    expect(cleanupFailure).toBeInstanceOf(AggregateError);
    expect(aggregateCauses(cleanupFailure)).toEqual([rollbackError]);
  });

  it("GIVEN no outgoing world WHEN transition completes THEN incoming animation and cleanup remain valid", () => {
    const harness = createTransitionHarness({
      incomingPreparing: "external-preparing",
      outgoing: "none",
    });
    const transition = createTransition(harness);

    expect(harness.incomingHarness.getAttribute(PREPARING_ATTRIBUTE)).toBe(
      "external-preparing",
    );

    transition.play();
    expect(harness.incomingHarness.getAttribute(PREPARING_ATTRIBUTE)).toBe(
      "external-preparing",
    );
    firstAnimationOptions().onComplete();

    expect(firstAnimationOptions().outgoing).toBeNull();
    expect(harness.kill).toHaveBeenCalledTimes(1);
    expect(harness.kill).toHaveBeenCalledWith(false);
    expect(harness.onComplete).toHaveBeenCalledTimes(1);
    expect(harness.incomingHarness.getAttribute(PREPARING_ATTRIBUTE)).toBe(
      "external-preparing",
    );
  });
});
