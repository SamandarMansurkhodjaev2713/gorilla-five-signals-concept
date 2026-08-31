import type { SceneSetup, SceneSetupContext } from "../create-scene";
import { MOTION_DURATION_SECONDS, MOTION_EASE } from "../tokens";
import { playOnceWhenVisible } from "./shared";

const COPY_SELECTOR = ".home-material-film__copy-inner";
const STAGE_SELECTOR = ".home-material-film__stage";
const CALIBRATION_SELECTOR = ".home-material-film__calibration span";
const CROSSHAIR_SELECTOR = ".home-material-film__crosshair > *";
const PRESENTATION_SELECTOR = [
  COPY_SELECTOR,
  STAGE_SELECTOR,
  CALIBRATION_SELECTOR,
  CROSSHAIR_SELECTOR,
].join(", ");
const PRESENTATION_PROPERTIES = [
  "clip-path",
  "opacity",
  "scale",
  "transform",
  "translate",
  "visibility",
] as const;
const CALIBRATION_STAGGER_SECONDS = 0.04;

type SetupContext = Parameters<SceneSetup>[0];
type SceneTimeline = ReturnType<SceneSetupContext["gsap"]["timeline"]>;

function clearPresentation(root: HTMLElement): void {
  root
    .querySelectorAll<HTMLElement>(PRESENTATION_SELECTOR)
    .forEach((element): void => {
      for (const property of PRESENTATION_PROPERTIES) {
        element.style.removeProperty(property);
      }
    });
}

function clearAfterContextRevert(root: HTMLElement): void {
  clearPresentation(root);
  queueMicrotask((): void => clearPresentation(root));
}

function animateStage(context: SetupContext, timeline: SceneTimeline): void {
  const stage = context.query<HTMLElement>(STAGE_SELECTOR);
  timeline.from(
    stage,
    {
      autoAlpha: 0,
      clipPath:
        context.capability.kind === "full"
          ? "inset(6% 4% 6% 4%)"
          : "inset(2% 0 2% 0)",
      duration: MOTION_DURATION_SECONDS.scene,
      ease: MOTION_EASE.material,
    },
    0,
  );
}

function animateOverlay(context: SetupContext, timeline: SceneTimeline): void {
  timeline.from(
    context.queryAll<HTMLElement>(CALIBRATION_SELECTOR),
    {
      autoAlpha: 0,
      clipPath: "inset(0 0 100% 0)",
      duration: MOTION_DURATION_SECONDS.standard,
      ease: MOTION_EASE.enter,
      stagger: CALIBRATION_STAGGER_SECONDS,
    },
    0.18,
  );
  timeline.from(
    context.queryAll<HTMLElement>(CROSSHAIR_SELECTOR),
    {
      autoAlpha: 0,
      clipPath: "inset(100% 0 0 0)",
      duration: MOTION_DURATION_SECONDS.standard,
      ease: MOTION_EASE.enter,
      stagger: CALIBRATION_STAGGER_SECONDS,
    },
    0.24,
  );
}

function createMaterialEntrance(context: SetupContext): void {
  const clear = (): void => clearPresentation(context.root);
  const timeline = context.gsap.timeline({ onComplete: clear });
  timeline.from(
    context.query<HTMLElement>(COPY_SELECTOR),
    {
      autoAlpha: 0,
      clipPath: "inset(0 0 100% 0)",
      duration: MOTION_DURATION_SECONDS.scene,
      ease: MOTION_EASE.enter,
    },
    0,
  );
  animateStage(context, timeline);
  animateOverlay(context, timeline);
}

export function mountMaterialFilmMotion(context: SetupContext): void {
  context.onCleanup((): void => clearAfterContextRevert(context.root));
  if (context.capability.kind !== "reduced") {
    playOnceWhenVisible(context, (): void => createMaterialEntrance(context));
  }
}
