import { describe, expect, it, vi } from "vitest";

import { createSceneRegistry } from "@/motion/scene-registry";

import type { SceneHandle, SceneId } from "@/motion/scene-contract";

function buildHandle(
  id: SceneId,
  destroy: SceneHandle["destroy"] = vi.fn(),
): SceneHandle {
  return {
    capability: { kind: "full", reason: "capable-fine-pointer" },
    destroy,
    getPhase: () => "active",
    id,
  };
}

describe("createSceneRegistry", () => {
  it("GIVEN a mounted scene WHEN it is unmounted twice THEN owned cleanup runs once", () => {
    const registry = createSceneRegistry();
    const destroy = vi.fn();
    registry.mount(buildHandle("hero", destroy));
    expect(registry.has("hero")).toBe(true);

    registry.unmount("hero");
    registry.unmount("hero");

    expect(registry.has("hero")).toBe(false);
    expect(destroy).toHaveBeenCalledTimes(1);
  });

  it("GIVEN a duplicate scene WHEN it is mounted THEN the rejected handle is cleaned and identity stays unique", () => {
    const registry = createSceneRegistry();
    const rejectedDestroy = vi.fn();
    registry.mount(buildHandle("hero"));

    expect(() => registry.mount(buildHandle("hero", rejectedDestroy))).toThrow(
      'Scene "hero" is already mounted.',
    );
    expect(rejectedDestroy).toHaveBeenCalledTimes(1);
  });

  it("GIVEN several mounted scenes WHEN the registry is destroyed twice THEN cleanup is reverse-ordered and idempotent", () => {
    const order: SceneId[] = [];
    const registry = createSceneRegistry();
    registry.mount(buildHandle("hero", () => order.push("hero")));
    registry.mount(buildHandle("footer", () => order.push("footer")));

    registry.destroy();
    registry.destroy();

    expect(order).toEqual(["footer", "hero"]);
  });

  it("GIVEN cleanup failures WHEN the registry is destroyed THEN every scene is attempted and errors are aggregated", () => {
    const registry = createSceneRegistry();
    const successfulCleanup = vi.fn();
    registry.mount(
      buildHandle("hero", () => {
        throw new Error("hero cleanup failed");
      }),
    );
    registry.mount(buildHandle("footer", successfulCleanup));

    expect(() => registry.destroy()).toThrow(AggregateError);
    expect(successfulCleanup).toHaveBeenCalledTimes(1);
  });

  it("GIVEN a destroyed registry WHEN a scene mounts THEN the handle is cleaned before rejection", () => {
    const registry = createSceneRegistry();
    const destroy = vi.fn();
    registry.destroy();

    expect(() => registry.mount(buildHandle("hero", destroy))).toThrow(
      "Cannot mount a scene into a destroyed registry.",
    );
    expect(destroy).toHaveBeenCalledTimes(1);
  });
});
