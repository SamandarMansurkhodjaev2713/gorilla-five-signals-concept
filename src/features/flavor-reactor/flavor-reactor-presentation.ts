import type { SceneSetup } from "@/motion/create-scene";

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

const PRESENTATION_PROPERTIES = [
  "clip-path",
  "opacity",
  "rotate",
  "scale",
  "transform",
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

export type ReactorContext = Parameters<SceneSetup>[0];

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
    current.textContent = String(index + 1).padStart(2, "0");
  }
}

export function resetWorldPresentation(world: HTMLElement): void {
  const targets = [
    world,
    ...world.querySelectorAll<HTMLElement>(ANIMATED_TARGETS),
  ];
  for (const target of targets) {
    for (const property of PRESENTATION_PROPERTIES) {
      target.style.removeProperty(property);
    }
  }
}

export function normalizeWorlds(context: ReactorContext): void {
  for (const world of context.queryAll<HTMLElement>(
    REACTOR_MOTION_SELECTOR.world,
  )) {
    world.removeAttribute("data-reactor-leaving");
    resetWorldPresentation(world);
  }
}

export function prepareWorlds(
  context: ReactorContext,
  active: HTMLElement,
  outgoing: HTMLElement | null,
): void {
  resetWorldPresentation(active);
  if (outgoing !== null) resetWorldPresentation(outgoing);
  normalizeWorlds(context);
  if (outgoing !== null) {
    outgoing.setAttribute("data-reactor-leaving", "");
  }
}

export function settleOutgoing(outgoing: HTMLElement | null): void {
  if (outgoing === null) return;
  outgoing.removeAttribute("data-reactor-leaving");
  resetWorldPresentation(outgoing);
}
