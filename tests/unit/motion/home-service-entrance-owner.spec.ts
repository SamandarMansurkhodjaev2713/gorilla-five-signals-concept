import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/motion/inline-style-snapshot", () => ({
  captureInlineStyles: vi.fn(),
}));
vi.mock("@/motion/scene-setups/home-service-native", () => ({
  createNativeHomeServiceEntrance: vi.fn(),
}));

import { captureInlineStyles } from "@/motion/inline-style-snapshot";
import type { SceneSetupContext } from "@/motion/create-scene";
import type { FiniteAnimationPlayer } from "@/motion/native/finite-animation-player";
import { HomeServiceEntranceOwner } from "@/motion/scene-setups/home-service-entrance-owner";
import {
  SERVICE_PRESENTATION_PROPERTIES,
  SERVICE_PRESENTATION_SELECTOR,
} from "@/motion/scene-setups/home-service-motion-contract";
import { createNativeHomeServiceEntrance } from "@/motion/scene-setups/home-service-native";

import type { Mock } from "vitest";

interface Harness {
  readonly context: SceneSetupContext;
  readonly contextKill: Mock<(revert?: boolean) => void>;
  readonly fallback: Mock<(onComplete: () => void) => void>;
  readonly failures: unknown[];
  readonly playerDestroy: Mock<() => void>;
  readonly playerPlay: Mock<() => void>;
  readonly presentationTargets: readonly HTMLElement[];
  readonly queryAll: Mock<(selector: string) => readonly HTMLElement[]>;
  readonly restore: Mock<() => void>;
}

function createHarness(tier: "full" | "lite" = "full"): Harness {
  const contextKill = vi.fn<(revert?: boolean) => void>();
  const restore = vi.fn<() => void>();
  const playerPlay = vi.fn<() => void>();
  const playerDestroy = vi.fn<() => void>();
  const presentationTargets: readonly HTMLElement[] = [];
  const queryAll = vi.fn<(selector: string) => readonly HTMLElement[]>(
    () => presentationTargets,
  );
  vi.mocked(captureInlineStyles).mockReturnValue(restore);
  const playerPort = { destroy: playerDestroy, play: playerPlay };
  // TYPE-EXCEPTION: This owner test provides only the public player lifecycle;
  // native construction has its own adapter and player coverage.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  const player = playerPort as unknown as FiniteAnimationPlayer;
  vi.mocked(createNativeHomeServiceEntrance).mockReturnValue(player);
  const contextPort = {
    capability: { kind: tier },
    gsap: {
      context: vi.fn((callback: () => void) => {
        callback();
        return { kill: contextKill };
      }),
    },
    queryAll,
    root: {},
  };
  // TYPE-EXCEPTION: The focused owner fake supplies only the scoped context
  // ports consumed here; scene registration is independently covered.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  const context = contextPort as unknown as SceneSetupContext;
  return {
    context,
    contextKill,
    fallback: vi.fn<(onComplete: () => void) => void>(),
    failures: [],
    playerDestroy,
    playerPlay,
    presentationTargets,
    queryAll,
    restore,
  };
}

function createOwner(harness: Harness): HomeServiceEntranceOwner {
  return new HomeServiceEntranceOwner({
    context: harness.context,
    onFailure: (error): void => {
      harness.failures.push(error);
    },
    playFallback: harness.fallback,
  });
}

function nativeOptions() {
  const invocation = vi.mocked(createNativeHomeServiceEntrance).mock.calls[0];
  if (invocation === undefined) throw new Error("Missing native invocation.");
  return invocation[0];
}

beforeEach(() => {
  vi.mocked(captureInlineStyles).mockReset();
  vi.mocked(createNativeHomeServiceEntrance).mockReset();
});

describe("HomeServiceEntranceOwner", () => {
  it.each(["full", "lite"] as const)(
    "GIVEN %s motion WHEN native starts THEN the exact tier is forwarded and completion releases once",
    (tier) => {
      const harness = createHarness(tier);
      const owner = createOwner(harness);

      owner.start();
      nativeOptions().onComplete();
      owner.destroy();

      expect(nativeOptions().tier).toBe(tier);
      expect(harness.playerPlay).toHaveBeenCalledTimes(1);
      expect(harness.playerDestroy).toHaveBeenCalledTimes(1);
      expect(harness.fallback).not.toHaveBeenCalled();
      expect(harness.failures).toEqual([]);
    },
  );

  it("GIVEN native support is unavailable WHEN fallback completes THEN its context is killed before exact snapshot restoration", () => {
    const harness = createHarness();
    const order: string[] = [];
    harness.contextKill.mockImplementation(() => order.push("context"));
    harness.restore.mockImplementation(() => order.push("restore"));
    vi.mocked(createNativeHomeServiceEntrance).mockReturnValue(null);
    const owner = createOwner(harness);

    owner.start();
    const invocation = harness.fallback.mock.calls[0];
    if (invocation === undefined) throw new Error("Missing fallback call.");
    invocation[0]();

    expect(order).toEqual(["context", "restore"]);
    expect(harness.contextKill).toHaveBeenCalledWith(false);
    expect(captureInlineStyles).toHaveBeenCalledWith(
      harness.presentationTargets,
      SERVICE_PRESENTATION_PROPERTIES,
    );
    expect(harness.queryAll).toHaveBeenCalledWith(
      SERVICE_PRESENTATION_SELECTOR,
    );
  });

  it("GIVEN teardown wins before visibility WHEN start arrives late THEN no player or fallback presentation is allocated", () => {
    const harness = createHarness();
    const owner = createOwner(harness);

    owner.destroy();
    owner.start();

    expect(createNativeHomeServiceEntrance).not.toHaveBeenCalled();
    expect(captureInlineStyles).not.toHaveBeenCalled();
    expect(harness.playerPlay).not.toHaveBeenCalled();
  });
});
