export const SCENE_IDS = [
  "responsible-entry",
  "navigation",
  "hero",
  "range-manifesto",
  "flavor-explorer",
  "product-lab",
  "product-world",
  "product-compare",
  "material-film",
  "culture-signal",
  "store-locator",
  "culture-atlas",
  "find-handoff",
  "faq-safety",
  "contact-partnership",
  "contact-switchboard",
  "footer",
] as const;

export type SceneId = (typeof SCENE_IDS)[number];

export type MotionCapability =
  | { kind: "full"; reason: "capable-fine-pointer" | "user-enabled" }
  | { kind: "lite"; reason: "touch" | "data-saver" | "user-selected" }
  | {
      kind: "reduced";
      reason: "system-preference" | "user-disabled" | "runtime-fallback";
    };

export type ScenePhase =
  "idle" | "mounting" | "active" | "destroying" | "destroyed";

export interface SceneHandle {
  readonly id: SceneId;
  readonly capability: MotionCapability;
  getPhase(): ScenePhase;
  destroy(): void;
}

export interface SceneDefinition {
  readonly id: SceneId;
  readonly selector: `[data-motion-scene="${SceneId}"]`;
  readonly mountOnceVisible: boolean;
}

export const SCENE_DEFINITIONS: readonly SceneDefinition[] = SCENE_IDS.map(
  (id): SceneDefinition => ({
    id,
    selector: `[data-motion-scene="${id}"]`,
    mountOnceVisible: !["responsible-entry", "navigation", "hero"].includes(id),
  }),
);
