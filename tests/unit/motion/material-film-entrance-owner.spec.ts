import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/motion/inline-style-snapshot", () => ({
  captureInlineStyles: vi.fn(),
}));
vi.mock("@/motion/scene-setups/material-film-native", () => ({
  MATERIAL_PRESENTATION_PROPERTIES: ["opacity", "visibility"],
  MATERIAL_PRESENTATION_SELECTOR: ".material-target",
  createNativeMaterialEntrance: vi.fn(),
}));

import { captureInlineStyles } from "@/motion/inline-style-snapshot";
import { MaterialFilmEntranceOwner } from "@/motion/scene-setups/material-film-entrance-owner";
import { createNativeMaterialEntrance } from "@/motion/scene-setups/material-film-native";

import type { SceneSetupContext } from "@/motion/create-scene";
import type { FiniteAnimationPlayer } from "@/motion/native/finite-animation-player";
import type { Mock } from "vitest";

interface Harness {
  readonly context: SceneSetupContext;
  readonly contextKill: Mock<(revert?: boolean) => void>;
  readonly fallback: Mock<(onComplete: () => void) => void>;
  readonly failures: unknown[];
  readonly playerDestroy: Mock<() => void>;
  readonly playerPlay: Mock<() => void>;
  readonly restore: Mock<() => void>;
}

function createHarness(
  options: { readonly tier?: "full" | "lite" } = {},
): Harness {
  const cleanupOrder: string[] = [];
  const contextKill = vi.fn((): void => {
    cleanupOrder.push("context");
  });
  const restore = vi.fn((): void => {
    cleanupOrder.push("restore");
  });
  vi.mocked(captureInlineStyles).mockReturnValue(restore);
  const playerPlay = vi.fn<() => void>();
  const playerDestroy = vi.fn<() => void>();
  const playerPort = { destroy: playerDestroy, play: playerPlay };
  // TYPE-EXCEPTION: This focused owner fake exposes only the public player
  // lifecycle; native construction is independently covered by player tests.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  const player = playerPort as unknown as FiniteAnimationPlayer;
  vi.mocked(createNativeMaterialEntrance).mockReturnValue(player);
  const contextPort = {
    capability: { kind: options.tier ?? "full" },
    gsap: {
      context: vi.fn((callback: () => void) => {
        callback();
        return { kill: contextKill };
      }),
    },
    queryAll: vi.fn(() => [{ style: {} }]),
    root: {},
  };
  // TYPE-EXCEPTION: The owner test supplies only the scoped context ports it
  // consumes; setup registration and browser rendering are tested elsewhere.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  const context = contextPort as unknown as SceneSetupContext;
  return {
    context,
    contextKill,
    fallback: vi.fn<(onComplete: () => void) => void>(),
    failures: [],
    playerDestroy,
    playerPlay,
    restore,
  };
}

function createOwner(harness: Harness): MaterialFilmEntranceOwner {
  return new MaterialFilmEntranceOwner({
    context: harness.context,
    onFailure: (error): void => {
      harness.failures.push(error);
    },
    playFallback: harness.fallback,
  });
}

function nativeOptions() {
  const invocation = vi.mocked(createNativeMaterialEntrance).mock.calls[0];
  if (invocation === undefined) throw new Error("Missing native invocation.");
  return invocation[0];
}

function aggregateCauses(error: unknown): readonly unknown[] {
  if (!(error instanceof AggregateError))
    throw new Error("Expected an AggregateError.");
  const causes: unknown = Reflect.get(error, "errors");
  if (!Array.isArray(causes)) throw new Error("Expected aggregate causes.");
  return causes;
}

beforeEach(() => {
  vi.mocked(captureInlineStyles).mockReset();
  vi.mocked(createNativeMaterialEntrance).mockReset();
});

describe("MaterialFilmEntranceOwner", () => {
  it("GIVEN a native entrance WHEN it completes THEN repeated starts and teardown cannot retain or replay its player", () => {
    const harness = createHarness();
    const owner = createOwner(harness);

    owner.start();
    owner.start();
    nativeOptions().onComplete();
    owner.destroy();

    expect(createNativeMaterialEntrance).toHaveBeenCalledTimes(1);
    expect(harness.playerPlay).toHaveBeenCalledTimes(1);
    expect(harness.playerDestroy).toHaveBeenCalledTimes(1);
    expect(harness.fallback).not.toHaveBeenCalled();
    expect(harness.failures).toEqual([]);
  });

  it("GIVEN Lite motion WHEN native setup starts THEN the owner preserves the Lite choreography tier", () => {
    const harness = createHarness({ tier: "lite" });
    const owner = createOwner(harness);

    owner.start();

    expect(nativeOptions().tier).toBe("lite");
    owner.destroy();
  });

  it("GIVEN native boundary construction throws WHEN start runs THEN the exact failure is reported before fallback", () => {
    const harness = createHarness();
    const setupError = new Error("native boundary failed");
    vi.mocked(createNativeMaterialEntrance).mockImplementation(() => {
      throw setupError;
    });
    const owner = createOwner(harness);

    expect(() => owner.start()).not.toThrow();

    expect(harness.failures).toEqual([setupError]);
    expect(harness.fallback).toHaveBeenCalledTimes(1);
    owner.destroy();
  });

  it("GIVEN native completion cleanup throws WHEN completion arrives THEN cleanup failure is reported without replay", () => {
    const harness = createHarness();
    const cleanupError = new Error("native cancel failed");
    harness.playerDestroy.mockImplementation(() => {
      throw cleanupError;
    });
    const owner = createOwner(harness);
    owner.start();

    expect(() => nativeOptions().onComplete()).not.toThrow();

    expect(aggregateCauses(harness.failures[0])).toEqual([cleanupError]);
    expect(harness.fallback).not.toHaveBeenCalled();
  });

  it("GIVEN native support is unavailable WHEN fallback completes THEN its nested context is killed before exact inline restoration", () => {
    const harness = createHarness();
    const cleanupOrder: string[] = [];
    harness.contextKill.mockImplementation(() => cleanupOrder.push("context"));
    harness.restore.mockImplementation(() => cleanupOrder.push("restore"));
    vi.mocked(createNativeMaterialEntrance).mockReturnValue(null);
    const owner = createOwner(harness);

    owner.start();
    const fallbackInvocation = harness.fallback.mock.calls[0];
    if (fallbackInvocation === undefined)
      throw new Error("Missing fallback invocation.");
    fallbackInvocation[0]();

    expect(cleanupOrder).toEqual(["context", "restore"]);
    expect(harness.contextKill).toHaveBeenCalledWith(false);
    expect(harness.failures).toEqual([]);
  });

  it("GIVEN fallback completes synchronously during context creation WHEN the context arrives late THEN late cleanup remains ordered and idempotent", () => {
    const harness = createHarness();
    vi.mocked(createNativeMaterialEntrance).mockReturnValue(null);
    harness.fallback.mockImplementation((onComplete) => onComplete());
    const owner = createOwner(harness);

    owner.start();
    owner.destroy();

    expect(harness.contextKill).toHaveBeenCalledTimes(1);
    expect(harness.contextKill).toHaveBeenCalledWith(false);
    expect(harness.restore).toHaveBeenCalledTimes(2);
    expect(harness.failures).toEqual([]);
  });

  it("GIVEN native failure arrives before teardown WHEN fallback starts THEN a stale repeat cannot restart fallback after teardown", () => {
    const harness = createHarness();
    const failure = new Error("native setup failed");
    const owner = createOwner(harness);
    owner.start();

    nativeOptions().onFailure(failure);
    owner.destroy();
    nativeOptions().onFailure(failure);

    expect(harness.fallback).toHaveBeenCalledTimes(1);
    expect(harness.contextKill).toHaveBeenCalledTimes(1);
    expect(harness.restore).toHaveBeenCalledTimes(1);
    expect(harness.failures).toEqual([failure, failure]);
  });

  it("GIVEN fallback setup and both cleanup operations fail WHEN rollback runs THEN all exact causes reach the reporter", () => {
    const harness = createHarness();
    const setupError = new Error("fallback setup failed");
    const killError = new Error("context kill failed");
    const restoreError = new Error("snapshot restore failed");
    vi.mocked(createNativeMaterialEntrance).mockReturnValue(null);
    harness.fallback.mockImplementation(() => {
      throw setupError;
    });
    harness.contextKill.mockImplementation(() => {
      throw killError;
    });
    harness.restore.mockImplementation(() => {
      throw restoreError;
    });
    const owner = createOwner(harness);

    expect(() => owner.start()).not.toThrow();

    const failure = harness.failures[0];
    expect(failure).toMatchObject({
      message: "Material-film fallback initialization and cleanup failed.",
    });
    const causes = aggregateCauses(failure);
    expect(causes[0]).toBe(setupError);
    expect(aggregateCauses(causes[1])).toEqual([killError, restoreError]);
  });

  it("GIVEN fallback setup alone fails WHEN rollback succeeds THEN the original setup cause reaches the reporter unchanged", () => {
    const harness = createHarness();
    const setupError = new Error("fallback setup failed");
    vi.mocked(createNativeMaterialEntrance).mockReturnValue(null);
    harness.fallback.mockImplementation(() => {
      throw setupError;
    });
    const owner = createOwner(harness);

    owner.start();

    expect(harness.failures).toEqual([setupError]);
    expect(harness.contextKill).toHaveBeenCalledWith(false);
    expect(harness.restore).toHaveBeenCalledTimes(1);
  });

  it("GIVEN teardown wins before start WHEN a stale visibility callback arrives THEN no presentation can be allocated", () => {
    const harness = createHarness();
    const owner = createOwner(harness);

    owner.destroy();
    owner.start();

    expect(createNativeMaterialEntrance).not.toHaveBeenCalled();
    expect(harness.fallback).not.toHaveBeenCalled();
  });
});
