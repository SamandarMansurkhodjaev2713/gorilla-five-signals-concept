import type { SceneSetup, SceneSetupContext } from "../create-scene";
import { publishMotionDiagnostic } from "../diagnostics";
import { MOTION_EASE } from "../tokens";
import { MaterialFilmEntranceOwner } from "./material-film-entrance-owner";
import { MATERIAL_FILM_TIMING_SECONDS } from "./material-film-motion-spec";
import {
  MATERIAL_CALIBRATION_SELECTOR,
  MATERIAL_COPY_SELECTOR,
  MATERIAL_CROSSHAIR_SELECTOR,
  MATERIAL_STAGE_SELECTOR,
} from "./material-film-native";
import { playOnceWhenVisible } from "./shared";
type SetupContext = Parameters<SceneSetup>[0];
type SceneTimeline = ReturnType<SceneSetupContext["gsap"]["timeline"]>;

function animateStage(context: SetupContext, timeline: SceneTimeline): void {
  const stage = context.query<HTMLElement>(MATERIAL_STAGE_SELECTOR);
  timeline.from(
    stage,
    {
      autoAlpha: 0,
      clipPath:
        context.capability.kind === "full"
          ? "inset(6% 4% 6% 4%)"
          : "inset(2% 0 2% 0)",
      duration: MATERIAL_FILM_TIMING_SECONDS.sceneDuration,
      ease: MOTION_EASE.material,
    },
    0,
  );
}

function animateOverlay(context: SetupContext, timeline: SceneTimeline): void {
  timeline.from(
    context.queryAll<HTMLElement>(MATERIAL_CALIBRATION_SELECTOR),
    {
      autoAlpha: 0,
      clipPath: "inset(0 0 100% 0)",
      duration: MATERIAL_FILM_TIMING_SECONDS.standardDuration,
      ease: MOTION_EASE.enter,
      stagger: MATERIAL_FILM_TIMING_SECONDS.itemStagger,
    },
    MATERIAL_FILM_TIMING_SECONDS.calibrationDelay,
  );
  timeline.from(
    context.queryAll<HTMLElement>(MATERIAL_CROSSHAIR_SELECTOR),
    {
      autoAlpha: 0,
      clipPath: "inset(100% 0 0 0)",
      duration: MATERIAL_FILM_TIMING_SECONDS.standardDuration,
      ease: MOTION_EASE.enter,
      stagger: MATERIAL_FILM_TIMING_SECONDS.itemStagger,
    },
    MATERIAL_FILM_TIMING_SECONDS.crosshairDelay,
  );
}

function createMaterialEntrance(
  context: SetupContext,
  onComplete: () => void,
): void {
  const timeline = context.gsap.timeline({ onComplete });
  timeline.from(
    context.query<HTMLElement>(MATERIAL_COPY_SELECTOR),
    {
      autoAlpha: 0,
      clipPath: "inset(0 0 100% 0)",
      duration: MATERIAL_FILM_TIMING_SECONDS.sceneDuration,
      ease: MOTION_EASE.enter,
    },
    0,
  );
  animateStage(context, timeline);
  animateOverlay(context, timeline);
}

function reportEntranceFailure(context: SetupContext, error: unknown): void {
  const windowValue = context.root.ownerDocument.defaultView;
  if (windowValue === null) return;
  publishMotionDiagnostic(windowValue, {
    code: "scene-mount-failed",
    sceneId: "material-film",
    message: error instanceof Error ? error.message : String(error),
  });
}

export function mountMaterialFilmMotion(context: SetupContext): void {
  const owner = new MaterialFilmEntranceOwner({
    context,
    onFailure: (error): void => reportEntranceFailure(context, error),
    playFallback: (onComplete): void => {
      createMaterialEntrance(context, onComplete);
    },
  });
  context.onCleanup((): void => owner.destroy());
  if (context.capability.kind === "reduced") return;
  playOnceWhenVisible(context, (): void => owner.start());
}
