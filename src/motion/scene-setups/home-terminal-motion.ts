import type { SceneSetup, SceneSetupContext } from "../create-scene";
import { publishMotionDiagnostic } from "../diagnostics";
import { MOTION_EASE } from "../tokens";
import { HomeTerminalEntranceOwner } from "./home-terminal-entrance-owner";
import { TERMINAL_MOTION_TIMING_SECONDS } from "./home-terminal-motion-spec";
import {
  TERMINAL_COORDINATE_SELECTOR,
  TERMINAL_COPY_SELECTOR,
  TERMINAL_FIELD_SELECTOR,
  TERMINAL_LOCATOR_COPY_SELECTOR,
  TERMINAL_LOCATOR_SELECTOR,
  TERMINAL_LOCATOR_SIGNAL_SELECTOR,
  TERMINAL_NODE_SELECTOR,
  TERMINAL_ROUTE_SELECTOR,
  TERMINAL_WORD_SELECTOR,
} from "./home-terminal-motion-contract";
import { markSceneReady, playOnceWhenVisible } from "./shared";

type SetupContext = Parameters<SceneSetup>[0];
type SceneTimeline = ReturnType<SceneSetupContext["gsap"]["timeline"]>;

function animateTerminalLead(
  context: SetupContext,
  timeline: SceneTimeline,
): void {
  const timing = TERMINAL_MOTION_TIMING_SECONDS;
  timeline.from(context.queryAll<HTMLElement>(TERMINAL_COPY_SELECTOR), {
    opacity: 0,
    clipPath: "inset(0 0 100% 0)",
    duration: timing.standardDuration,
    ease: MOTION_EASE.enter,
    stagger: timing.traceStagger,
  });
  timeline.from(
    context.query<HTMLElement>(TERMINAL_FIELD_SELECTOR),
    {
      opacity: 0,
      clipPath: "inset(0 100% 0 0)",
      duration: timing.sceneDuration,
      ease: MOTION_EASE.material,
    },
    timing.fieldDelay,
  );
}

function animateCoordinateTrace(
  context: SetupContext,
  timeline: SceneTimeline,
): void {
  if (context.capability.kind !== "full") return;
  const timing = TERMINAL_MOTION_TIMING_SECONDS;
  timeline.from(
    context.queryAll<HTMLElement>(
      [
        TERMINAL_WORD_SELECTOR,
        TERMINAL_ROUTE_SELECTOR,
        TERMINAL_COORDINATE_SELECTOR,
      ].join(", "),
    ),
    {
      opacity: 0,
      duration: timing.standardDuration,
      ease: MOTION_EASE.enter,
      stagger: timing.traceStagger,
    },
    timing.coordinateDelay,
  );
  timeline.from(
    context.queryAll<HTMLElement>(TERMINAL_NODE_SELECTOR),
    {
      opacity: 0,
      duration: timing.quickDuration,
      ease: MOTION_EASE.snap,
      stagger: timing.traceStagger,
    },
    timing.nodeDelay,
  );
}

function animateLocatorHandoff(
  context: SetupContext,
  timeline: SceneTimeline,
): void {
  const timing = TERMINAL_MOTION_TIMING_SECONDS;
  timeline.from(
    context.query<HTMLElement>(TERMINAL_LOCATOR_SELECTOR),
    {
      opacity: 0,
      clipPath: "inset(8% 8% 8% 8%)",
      duration: timing.sceneDuration,
      ease: MOTION_EASE.material,
    },
    context.capability.kind === "full"
      ? timing.locatorFullDelay
      : timing.locatorLiteDelay,
  );
  if (context.capability.kind !== "full") return;
  timeline.from(
    context.queryAll<HTMLElement>(TERMINAL_LOCATOR_SIGNAL_SELECTOR),
    {
      opacity: 0,
      duration: timing.standardDuration,
      ease: MOTION_EASE.enter,
      stagger: timing.traceStagger,
    },
    timing.locatorSignalDelay,
  );
  timeline.from(
    context.queryAll<HTMLElement>(TERMINAL_LOCATOR_COPY_SELECTOR),
    {
      opacity: 0,
      clipPath: "inset(0 0 100% 0)",
      duration: timing.standardDuration,
      ease: MOTION_EASE.enter,
      stagger: timing.traceStagger,
    },
    timing.locatorCopyDelay,
  );
}

function createTerminalHandoff(
  context: SetupContext,
  onComplete: () => void,
): void {
  const timeline = context.gsap.timeline({ onComplete });
  animateTerminalLead(context, timeline);
  animateCoordinateTrace(context, timeline);
  animateLocatorHandoff(context, timeline);
}

function reportEntranceFailure(context: SetupContext, error: unknown): void {
  const windowValue = context.root.ownerDocument.defaultView;
  if (windowValue === null) return;
  publishMotionDiagnostic(windowValue, {
    code: "scene-mount-failed",
    sceneId: "culture-signal",
    message: error instanceof Error ? error.message : String(error),
  });
}

export const setupCultureScene: SceneSetup = (context): (() => void) => {
  const cleanupReady = markSceneReady(context);
  const owner = new HomeTerminalEntranceOwner({
    context,
    onFailure: (error): void => reportEntranceFailure(context, error),
    playFallback: (onComplete): void =>
      createTerminalHandoff(context, onComplete),
  });
  context.onCleanup((): void => owner.destroy());
  if (context.capability.kind !== "reduced")
    playOnceWhenVisible(context, (): void => owner.start());
  return cleanupReady;
};

export const setupLocatorScene: SceneSetup = (context): (() => void) =>
  markSceneReady(context);
