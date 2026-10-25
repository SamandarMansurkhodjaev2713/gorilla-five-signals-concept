import { NATIVE_MOTION_EASING } from "../native-easing";
import {
  FiniteAnimationPlayer,
  supportsFiniteAnimationPlayer,
} from "../native/finite-animation-player";
import { hasInlinePresentation } from "../native/presentation-guard";
import { MATERIAL_FILM_TIMING_SECONDS } from "./material-film-motion-spec";

import type { FiniteAnimationCue } from "../native/finite-animation-player";

export const MATERIAL_COPY_SELECTOR = ".home-material-film__copy-inner";
export const MATERIAL_STAGE_SELECTOR = ".home-material-film__stage";
export const MATERIAL_CALIBRATION_SELECTOR =
  ".home-material-film__calibration span";
export const MATERIAL_CROSSHAIR_SELECTOR = ".home-material-film__crosshair > *";
export const MATERIAL_PRESENTATION_SELECTOR = [
  MATERIAL_COPY_SELECTOR,
  MATERIAL_STAGE_SELECTOR,
  MATERIAL_CALIBRATION_SELECTOR,
  MATERIAL_CROSSHAIR_SELECTOR,
].join(", ");
export const MATERIAL_PRESENTATION_PROPERTIES = [
  "clip-path",
  "opacity",
  "scale",
  "transform",
  "translate",
  "visibility",
] as const;
const NATIVE_PRESENTATION_PROPERTIES = [
  "clip-path",
  "opacity",
  "visibility",
] as const;
const MILLISECONDS_PER_SECOND = 1_000;
const SCENE_DURATION_MS =
  MATERIAL_FILM_TIMING_SECONDS.sceneDuration * MILLISECONDS_PER_SECOND;
const STANDARD_DURATION_MS =
  MATERIAL_FILM_TIMING_SECONDS.standardDuration * MILLISECONDS_PER_SECOND;
const CALIBRATION_DELAY_MS =
  MATERIAL_FILM_TIMING_SECONDS.calibrationDelay * MILLISECONDS_PER_SECOND;
const CROSSHAIR_DELAY_MS =
  MATERIAL_FILM_TIMING_SECONDS.crosshairDelay * MILLISECONDS_PER_SECOND;
const ITEM_STAGGER_MS =
  MATERIAL_FILM_TIMING_SECONDS.itemStagger * MILLISECONDS_PER_SECOND;
const REST_CLIP_PATH = "inset(0 0 0 0)";

export type MaterialEntranceTier = "full" | "lite";

export interface MaterialEntranceTargets {
  readonly copy: HTMLElement;
  readonly stage: HTMLElement;
  readonly calibration: readonly HTMLElement[];
  readonly crosshair: readonly HTMLElement[];
}

function requireTarget(root: HTMLElement, selector: string): HTMLElement {
  const target = root.querySelector<HTMLElement>(selector);
  if (target === null)
    throw new Error(`Material-film motion hook is missing: ${selector}`);
  return target;
}

export function readMaterialEntranceTargets(
  root: HTMLElement,
): MaterialEntranceTargets {
  return {
    copy: requireTarget(root, MATERIAL_COPY_SELECTOR),
    stage: requireTarget(root, MATERIAL_STAGE_SELECTOR),
    calibration: [
      ...root.querySelectorAll<HTMLElement>(MATERIAL_CALIBRATION_SELECTOR),
    ],
    crosshair: [
      ...root.querySelectorAll<HTMLElement>(MATERIAL_CROSSHAIR_SELECTOR),
    ],
  };
}

function revealCue(options: {
  readonly target: HTMLElement;
  readonly role: string;
  readonly clipPath: string;
  readonly delayMs: number;
  readonly durationMs: number;
  readonly easing: string;
}): FiniteAnimationCue {
  return {
    ...options,
    frames: [
      { clipPath: options.clipPath, opacity: 0, visibility: "hidden" },
      { clipPath: REST_CLIP_PATH, opacity: 1, visibility: "visible" },
    ],
  };
}

function staggeredCues(options: {
  readonly targets: readonly HTMLElement[];
  readonly role: string;
  readonly clipPath: string;
  readonly initialDelayMs: number;
}): readonly FiniteAnimationCue[] {
  return options.targets.map((target, index) =>
    revealCue({
      target,
      role: options.role,
      clipPath: options.clipPath,
      delayMs: options.initialDelayMs + ITEM_STAGGER_MS * index,
      durationMs: STANDARD_DURATION_MS,
      easing: NATIVE_MOTION_EASING.enter,
    }),
  );
}

export function createMaterialEntrancePlan(options: {
  readonly targets: MaterialEntranceTargets;
  readonly tier: MaterialEntranceTier;
}): readonly FiniteAnimationCue[] {
  const { targets } = options;
  return [
    revealCue({
      target: targets.copy,
      role: "copy",
      clipPath: "inset(0 0 100% 0)",
      delayMs: 0,
      durationMs: SCENE_DURATION_MS,
      easing: NATIVE_MOTION_EASING.enter,
    }),
    revealCue({
      target: targets.stage,
      role: "stage",
      clipPath:
        options.tier === "full" ? "inset(6% 4% 6% 4%)" : "inset(2% 0 2% 0)",
      delayMs: 0,
      durationMs: SCENE_DURATION_MS,
      easing: NATIVE_MOTION_EASING.material,
    }),
    ...staggeredCues({
      targets: targets.calibration,
      role: "calibration",
      clipPath: "inset(0 0 100% 0)",
      initialDelayMs: CALIBRATION_DELAY_MS,
    }),
    ...staggeredCues({
      targets: targets.crosshair,
      role: "crosshair",
      clipPath: "inset(100% 0 0 0)",
      initialDelayMs: CROSSHAIR_DELAY_MS,
    }),
  ];
}

function hasCustomInlinePresentation(
  targets: MaterialEntranceTargets,
): boolean {
  const elements = [
    targets.copy,
    targets.stage,
    ...targets.calibration,
    ...targets.crosshair,
  ];
  return hasInlinePresentation(elements, NATIVE_PRESENTATION_PROPERTIES);
}

/** Build an explicit native plan without computed-style or geometry reads. */
export function createNativeMaterialEntrance(options: {
  readonly root: HTMLElement;
  readonly tier: MaterialEntranceTier;
  readonly onComplete: () => void;
  readonly onFailure: (error: unknown) => void;
}): FiniteAnimationPlayer | null {
  const windowValue = options.root.ownerDocument.defaultView;
  if (windowValue === null || !supportsFiniteAnimationPlayer(windowValue))
    return null;
  const targets = readMaterialEntranceTargets(options.root);
  if (hasCustomInlinePresentation(targets)) return null;
  return new FiniteAnimationPlayer({
    documentValue: options.root.ownerDocument,
    cues: createMaterialEntrancePlan({ targets, tier: options.tier }),
    idPrefix: "gorilla-material-film",
    label: "Material-film",
    onComplete: options.onComplete,
    onFailure: options.onFailure,
  });
}
