import type { SceneSetup } from "@/motion/create-scene";
import { captureInlineStyles } from "@/motion/inline-style-snapshot";

import { getFlavorTrajectory } from "./flavor-reactor-motion-spec";
import type { FlavorTrajectory } from "./flavor-reactor-motion-spec";

export const REACTOR_MOTION_SELECTOR = Object.freeze({
  copy: "[data-motion-copy]",
  current: "[data-reactor-current]",
  material: "[data-reactor-material]",
  orbit: "[data-reactor-orbit]",
  product: "[data-motion-product]",
  selected: "[data-reactor-world][data-motion-selected]",
  shard: "[data-reactor-shard]",
  word: "[data-reactor-word]",
  world: "[data-reactor-world]",
});

export type ReactorContext = Parameters<SceneSetup>[0];

const PRESENTATION_PROPERTIES = [
  "clip-path",
  "opacity",
  "rotate",
  "scale",
  "transform",
  "transform-origin",
  "translate",
  "visibility",
] as const;
const ANIMATED_TARGETS = [
  REACTOR_MOTION_SELECTOR.product,
  REACTOR_MOTION_SELECTOR.copy,
  REACTOR_MOTION_SELECTOR.word,
  REACTOR_MOTION_SELECTOR.material,
  REACTOR_MOTION_SELECTOR.orbit,
  REACTOR_MOTION_SELECTOR.shard,
].join(", ");

/** Preserve only the two participating worlds, including declaration priorities. */
export function captureReactorPresentation(
  incoming: HTMLElement,
  outgoing: HTMLElement | null,
): () => void {
  const worlds = new Set(outgoing === null ? [incoming] : [incoming, outgoing]);
  const targets = [...worlds].flatMap((world) => [
    world,
    ...world.querySelectorAll<HTMLElement>(ANIMATED_TARGETS),
  ]);
  return captureInlineStyles(targets, PRESENTATION_PROPERTIES);
}

export function selectedWorld(context: ReactorContext): HTMLElement | null {
  return context.query<HTMLElement>(REACTOR_MOTION_SELECTOR.selected);
}

export function trajectoryFor(world: HTMLElement): FlavorTrajectory {
  return getFlavorTrajectory(world.dataset.flavor);
}

export function requireWorldElement(
  world: HTMLElement,
  selector: string,
): HTMLElement {
  const element = world.querySelector<HTMLElement>(selector);
  if (element === null) {
    throw new Error(`Flavor world hook is missing: ${selector}`);
  }
  return element;
}

export function updateProgress(
  context: ReactorContext,
  world: HTMLElement,
): void {
  const worlds = context.queryAll<HTMLElement>(REACTOR_MOTION_SELECTOR.world);
  const index = worlds.indexOf(world);
  const current = context.query<HTMLElement>(REACTOR_MOTION_SELECTOR.current);
  if (current !== null && index >= 0) {
    const label = String(index + 1).padStart(2, "0");
    if (current.textContent !== label) current.textContent = label;
  }
}
