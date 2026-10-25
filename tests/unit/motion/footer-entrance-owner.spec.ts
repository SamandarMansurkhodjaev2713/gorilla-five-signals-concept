import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/motion/inline-style-snapshot", () => ({
  captureInlineStyles: vi.fn(),
}));
vi.mock("@/motion/scene-setups/footer-native", () => ({
  createNativeFooterEntrance: vi.fn(),
}));

import { captureInlineStyles } from "@/motion/inline-style-snapshot";
import type { SceneSetupContext } from "@/motion/create-scene";
import type { FiniteAnimationPlayer } from "@/motion/native/finite-animation-player";
import { FooterEntranceOwner } from "@/motion/scene-setups/footer-entrance-owner";
import {
  FOOTER_PRESENTATION_PROPERTIES,
  FOOTER_PRESENTATION_SELECTOR,
} from "@/motion/scene-setups/footer-motion-contract";
import { createNativeFooterEntrance } from "@/motion/scene-setups/footer-native";

import type { Mock } from "vitest";

interface Harness {
  readonly context: SceneSetupContext;
  readonly contextKill: Mock<(revert?: boolean) => void>;
  readonly fallback: Mock<(onComplete: () => void) => void>;
  readonly playerDestroy: Mock<() => void>;
  readonly playerPlay: Mock<() => void>;
  readonly queryAll: Mock<(selector: string) => readonly HTMLElement[]>;
  readonly restore: Mock<() => void>;
  readonly targets: readonly HTMLElement[];
}

function createHarness(): Harness {
  const contextKill = vi.fn<(revert?: boolean) => void>();
  const restore = vi.fn<() => void>();
  const playerPlay = vi.fn<() => void>();
  const playerDestroy = vi.fn<() => void>();
  const targets: readonly HTMLElement[] = [];
  const queryAll = vi.fn<(selector: string) => readonly HTMLElement[]>(
    () => targets,
  );
  vi.mocked(captureInlineStyles).mockReturnValue(restore);
  const playerPort = { destroy: playerDestroy, play: playerPlay };
  // TYPE-EXCEPTION: This focused binding test provides only the public finite
  // player lifecycle; native allocation is independently covered.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  const player = playerPort as unknown as FiniteAnimationPlayer;
  vi.mocked(createNativeFooterEntrance).mockReturnValue(player);
  const contextPort = {
    gsap: {
      context: vi.fn((callback: () => void) => {
        callback();
        return { kill: contextKill };
      }),
    },
    queryAll,
    root: {},
  };
  // TYPE-EXCEPTION: The owner fake supplies only its scoped query and GSAP
  // context ports; scene setup lifecycle is covered at its own boundary.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  const context = contextPort as unknown as SceneSetupContext;
  return {
    context,
    contextKill,
    fallback: vi.fn<(onComplete: () => void) => void>(),
    playerDestroy,
    playerPlay,
    queryAll,
    restore,
    targets,
  };
}

function createOwner(harness: Harness): FooterEntranceOwner {
  return new FooterEntranceOwner({
    context: harness.context,
    onFailure: (): void => undefined,
    playFallback: harness.fallback,
  });
}

function nativeOptions() {
  const invocation = vi.mocked(createNativeFooterEntrance).mock.calls[0];
  if (invocation === undefined) throw new Error("Missing native invocation.");
  return invocation[0];
}

beforeEach(() => {
  vi.mocked(captureInlineStyles).mockReset();
  vi.mocked(createNativeFooterEntrance).mockReset();
});

describe("FooterEntranceOwner", () => {
  it("GIVEN native completion WHEN delivered THEN the player is canceled once and cannot replay", () => {
    const harness = createHarness();
    const owner = createOwner(harness);

    owner.start();
    owner.start();
    nativeOptions().onComplete();
    owner.destroy();

    expect(harness.playerPlay).toHaveBeenCalledTimes(1);
    expect(harness.playerDestroy).toHaveBeenCalledTimes(1);
    expect(harness.fallback).not.toHaveBeenCalled();
  });

  it("GIVEN fallback completion WHEN delivered THEN the scoped context is killed before exact eight-property restoration", () => {
    const harness = createHarness();
    const order: string[] = [];
    harness.contextKill.mockImplementation(() => order.push("context"));
    harness.restore.mockImplementation(() => order.push("restore"));
    vi.mocked(createNativeFooterEntrance).mockReturnValue(null);
    const owner = createOwner(harness);

    owner.start();
    const invocation = harness.fallback.mock.calls[0];
    if (invocation === undefined) throw new Error("Missing fallback call.");
    invocation[0]();

    expect(order).toEqual(["context", "restore"]);
    expect(harness.contextKill).toHaveBeenCalledWith(false);
    expect(harness.queryAll).toHaveBeenCalledWith(FOOTER_PRESENTATION_SELECTOR);
    expect(captureInlineStyles).toHaveBeenCalledWith(
      harness.targets,
      FOOTER_PRESENTATION_PROPERTIES,
    );
  });

  it("GIVEN destroy before visibility WHEN start arrives late THEN no native or fallback presentation is allocated", () => {
    const harness = createHarness();
    const owner = createOwner(harness);

    owner.destroy();
    owner.start();

    expect(createNativeFooterEntrance).not.toHaveBeenCalled();
    expect(captureInlineStyles).not.toHaveBeenCalled();
  });
});
