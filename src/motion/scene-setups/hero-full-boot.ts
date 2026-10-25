import {
  HERO_COMPACT_MEDIA_QUERY,
  resolveHeroCanEntrySpec,
} from "../hero-can-spec";
import { MOTION_DURATION_SECONDS, MOTION_EASE } from "../tokens";
import { HERO_HOOKS } from "./hero-hooks";

import type { SceneSetupContext } from "../create-scene";
import type { SetupStage } from "../setup-stage-queue";

const FREQUENCY_STAGGER_SECONDS = 0.045;
const GHOST_ENTRY_SCALE = 0.82;
const GHOST_ENTRY_X_PX = 44;
const GHOST_STAGGER_SECONDS = 0.04;
const SUPPORT_ENTRY_Y_PX = 18;
const SUPPORT_STAGGER_SECONDS = 0.05;
const TITLE_ENTRY_Y_PERCENT = 104;
const OVERLAP_SECONDS = Object.freeze({
  title: 0.12,
  primary: 0.58,
  plate: 0.54,
  ghosts: 0.3,
  support: 0.18,
});
type HeroTimeline = ReturnType<SceneSetupContext["gsap"]["timeline"]>;
type HeroTweenVars = Parameters<SceneSetupContext["gsap"]["from"]>[1];

export interface HeroBootStage {
  readonly targets: readonly HTMLElement[];
  readonly run: SetupStage;
}

interface HeroGroup {
  readonly targets: readonly HTMLElement[];
  readonly variables: () => HeroTweenVars;
  readonly overlapSeconds?: number;
  readonly staggerSeconds?: number;
}

function prepareTween(timeline: HeroTimeline, install: SetupStage): void {
  const previous = new Set(timeline.getChildren(false, true, false));
  install();
  for (const tween of timeline.getChildren(false, true, false)) {
    if (previous.has(tween)) continue;
    tween.totalProgress(1, true);
    tween.totalProgress(0, true);
  }
}

function groupStages(
  timeline: HeroTimeline,
  group: HeroGroup,
): readonly HeroBootStage[] {
  let startSeconds: number | null = null;
  return group.targets.map((target, index) => ({
    targets: [target],
    run: (): void => {
      startSeconds ??= timeline.duration() - (group.overlapSeconds ?? 0);
      const position = startSeconds + index * (group.staggerSeconds ?? 0);
      prepareTween(timeline, (): void => {
        timeline.from(target, group.variables(), position);
      });
    },
  }));
}

function optionalTarget(target: HTMLElement | null): readonly HTMLElement[] {
  return target === null ? [] : [target];
}

function requireTargets(
  context: SceneSetupContext,
  selector: string,
): readonly HTMLElement[] {
  const targets = context.queryAll<HTMLElement>(selector);
  if (targets.length === 0) throw new Error(`Full Hero requires ${selector}.`);
  return targets;
}

function primaryVariables(context: SceneSetupContext): HeroTweenVars {
  const entry = resolveHeroCanEntrySpec({
    compact:
      context.root.ownerDocument.defaultView?.matchMedia(
        HERO_COMPACT_MEDIA_QUERY,
      ).matches === true,
  });
  return {
    duration: MOTION_DURATION_SECONDS.entranceMax,
    ease: MOTION_EASE.settle,
    rotate: entry.rotationDegrees,
    scale: entry.scale,
    y: entry.travelY,
  };
}

function createGroups(context: SceneSetupContext): readonly HeroGroup[] {
  return [
    {
      targets: requireTargets(context, HERO_HOOKS.frequency),
      staggerSeconds: FREQUENCY_STAGGER_SECONDS,
      variables: () => ({
        duration: MOTION_DURATION_SECONDS.standard,
        ease: MOTION_EASE.material,
        scaleY: 0,
        transformOrigin: "top center",
      }),
    },
    {
      targets: requireTargets(context, HERO_HOOKS.title),
      overlapSeconds: OVERLAP_SECONDS.title,
      staggerSeconds: FREQUENCY_STAGGER_SECONDS,
      variables: () => ({
        clipPath: "inset(0 0 100% 0)",
        duration: MOTION_DURATION_SECONDS.scene,
        ease: MOTION_EASE.enter,
        yPercent: TITLE_ENTRY_Y_PERCENT,
      }),
    },
    {
      targets: optionalTarget(context.query<HTMLElement>(HERO_HOOKS.primary)),
      overlapSeconds: OVERLAP_SECONDS.primary,
      variables: () => primaryVariables(context),
    },
    {
      targets: optionalTarget(context.query<HTMLElement>(HERO_HOOKS.plate)),
      overlapSeconds: OVERLAP_SECONDS.plate,
      variables: () => ({
        clipPath: "inset(0 100% 0 0)",
        duration: MOTION_DURATION_SECONDS.scene,
        ease: MOTION_EASE.material,
      }),
    },
    {
      targets: requireTargets(context, HERO_HOOKS.ghosts),
      overlapSeconds: OVERLAP_SECONDS.ghosts,
      staggerSeconds: GHOST_STAGGER_SECONDS,
      variables: () => ({
        autoAlpha: 0,
        duration: MOTION_DURATION_SECONDS.standard,
        ease: MOTION_EASE.enter,
        scale: GHOST_ENTRY_SCALE,
        x: GHOST_ENTRY_X_PX,
      }),
    },
    {
      targets: requireTargets(context, HERO_HOOKS.support),
      overlapSeconds: OVERLAP_SECONDS.support,
      staggerSeconds: SUPPORT_STAGGER_SECONDS,
      variables: () => ({
        autoAlpha: 0,
        duration: MOTION_DURATION_SECONDS.standard,
        ease: MOTION_EASE.enter,
        y: SUPPORT_ENTRY_Y_PX,
      }),
    },
  ];
}

/** Preserve effective stagger/overlap timings while preparing only one target per frame. */
export function createFullHeroBoot(context: SceneSetupContext): {
  readonly stages: readonly HeroBootStage[];
  readonly play: SetupStage;
} {
  const timeline = context.gsap.timeline({ paused: true });
  return {
    stages: createGroups(context).flatMap((group) =>
      groupStages(timeline, group),
    ),
    play: (): void => {
      timeline.play(0);
    },
  };
}
