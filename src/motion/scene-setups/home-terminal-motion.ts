import type { SceneSetup, SceneSetupContext } from "../create-scene";
import { MOTION_DURATION_SECONDS, MOTION_EASE } from "../tokens";
import { markSceneReady, playOnceWhenVisible } from "./shared";

const COPY_SELECTOR = ".tashkent-terminal__copy > *";
const FIELD_SELECTOR = ".tashkent-terminal__field";
const WORD_SELECTOR = ".tashkent-terminal__word";
const COORDINATE_SELECTOR = ".tashkent-terminal__coordinate";
const ROUTE_SELECTOR = ".tashkent-terminal__route";
const NODE_SELECTOR = ".tashkent-terminal__route i";
const LOCATOR_SELECTOR = ".tashkent-terminal__locator";
const LOCATOR_COPY_SELECTOR =
  ".tashkent-terminal__locator > :not(.tashkent-terminal__grid):not(.tashkent-terminal__marker)";
const LOCATOR_SIGNAL_SELECTOR = [
  ".tashkent-terminal__grid",
  ".tashkent-terminal__marker",
].join(", ");
const PRESENTATION_SELECTOR = [
  COPY_SELECTOR,
  FIELD_SELECTOR,
  WORD_SELECTOR,
  COORDINATE_SELECTOR,
  ROUTE_SELECTOR,
  NODE_SELECTOR,
  LOCATOR_SELECTOR,
  LOCATOR_COPY_SELECTOR,
  LOCATOR_SIGNAL_SELECTOR,
].join(", ");
const PRESENTATION_PROPERTIES = ["clip-path", "opacity"] as const;
const TRACE_STAGGER_SECONDS = 0.055;

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

function animateTerminalLead(
  context: SetupContext,
  timeline: SceneTimeline,
): void {
  timeline.from(context.queryAll<HTMLElement>(COPY_SELECTOR), {
    opacity: 0,
    clipPath: "inset(0 0 100% 0)",
    duration: MOTION_DURATION_SECONDS.standard,
    ease: MOTION_EASE.enter,
    stagger: TRACE_STAGGER_SECONDS,
  });
  timeline.from(
    context.query<HTMLElement>(FIELD_SELECTOR),
    {
      opacity: 0,
      clipPath: "inset(0 100% 0 0)",
      duration: MOTION_DURATION_SECONDS.scene,
      ease: MOTION_EASE.material,
    },
    0.08,
  );
}

function animateCoordinateTrace(
  context: SetupContext,
  timeline: SceneTimeline,
): void {
  if (context.capability.kind !== "full") return;
  timeline.from(
    context.queryAll<HTMLElement>(
      [WORD_SELECTOR, ROUTE_SELECTOR, COORDINATE_SELECTOR].join(", "),
    ),
    {
      opacity: 0,
      duration: MOTION_DURATION_SECONDS.standard,
      ease: MOTION_EASE.enter,
      stagger: TRACE_STAGGER_SECONDS,
    },
    0.24,
  );
  timeline.from(
    context.queryAll<HTMLElement>(NODE_SELECTOR),
    {
      opacity: 0,
      duration: MOTION_DURATION_SECONDS.quick,
      ease: MOTION_EASE.snap,
      stagger: TRACE_STAGGER_SECONDS,
    },
    0.36,
  );
}

function animateLocatorHandoff(
  context: SetupContext,
  timeline: SceneTimeline,
): void {
  timeline.from(
    context.query<HTMLElement>(LOCATOR_SELECTOR),
    {
      opacity: 0,
      clipPath: "inset(8% 8% 8% 8%)",
      duration: MOTION_DURATION_SECONDS.scene,
      ease: MOTION_EASE.material,
    },
    context.capability.kind === "full" ? 0.48 : 0.22,
  );
  if (context.capability.kind !== "full") return;
  timeline.from(
    context.queryAll<HTMLElement>(LOCATOR_SIGNAL_SELECTOR),
    {
      opacity: 0,
      duration: MOTION_DURATION_SECONDS.standard,
      ease: MOTION_EASE.enter,
      stagger: TRACE_STAGGER_SECONDS,
    },
    0.56,
  );
  timeline.from(
    context.queryAll<HTMLElement>(LOCATOR_COPY_SELECTOR),
    {
      opacity: 0,
      clipPath: "inset(0 0 100% 0)",
      duration: MOTION_DURATION_SECONDS.standard,
      ease: MOTION_EASE.enter,
      stagger: TRACE_STAGGER_SECONDS,
    },
    0.62,
  );
}

function createTerminalHandoff(context: SetupContext): void {
  const clear = (): void => clearPresentation(context.root);
  const timeline = context.gsap.timeline({ onComplete: clear });
  animateTerminalLead(context, timeline);
  animateCoordinateTrace(context, timeline);
  animateLocatorHandoff(context, timeline);
}

export const setupCultureScene: SceneSetup = (context): (() => void) => {
  const cleanupReady = markSceneReady(context);
  context.onCleanup((): void => clearAfterContextRevert(context.root));
  if (context.capability.kind !== "reduced") {
    playOnceWhenVisible(context, (): void => createTerminalHandoff(context));
  }
  return cleanupReady;
};

export const setupLocatorScene: SceneSetup = (context): (() => void) =>
  markSceneReady(context);
