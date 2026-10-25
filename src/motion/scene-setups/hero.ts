import { captureInlineStyles } from "../inline-style-snapshot";
import { createFullHeroBoot } from "./hero-full-boot";
import { HERO_HOOKS, HERO_PRESENTATION_SELECTOR } from "./hero-hooks";
import { animateLiteSignalBoot } from "./hero-lite";
import { mountPointerDepth } from "./hero-pointer-depth";
import { markSceneReady } from "./shared";

import type { SceneSetup, SceneSetupContext } from "../create-scene";
import type { Cleanup } from "../cleanup-stack";
import type { SetupStage } from "../setup-stage-queue";
import type { HeroBootStage } from "./hero-full-boot";

type HeroPresentationContext = ReturnType<SceneSetupContext["gsap"]["context"]>;
const HERO_PRESENTATION_PROPERTIES = [
  "clip-path",
  "opacity",
  "rotate",
  "scale",
  "transform",
  "transform-origin",
  "translate",
  "visibility",
] as const;

function createPresentation(
  context: SceneSetupContext,
  touched: ReadonlySet<HTMLElement>,
): HeroPresentationContext {
  const targets = context.queryAll<HTMLElement>(HERO_PRESENTATION_SELECTOR);
  const restoreStyles = captureInlineStyles(
    targets,
    HERO_PRESENTATION_PROPERTIES,
  );
  const presentation: HeroPresentationContext = context.gsap.context(() => {
    return (): void => {
      try {
        if (touched.size > 0)
          presentation.ignore(() =>
            context.gsap.set([...touched], { clearProps: "transform" }),
          );
      } finally {
        restoreStyles();
      }
    };
  }, context.root);
  return presentation;
}

function preparePresentationStage(
  stage: HeroBootStage,
  touched: Set<HTMLElement>,
): Cleanup {
  const targets = stage.targets;
  const restoreRest = captureInlineStyles(
    targets,
    HERO_PRESENTATION_PROPERTIES,
  );
  for (const target of targets) touched.add(target);
  try {
    stage.run();
    return captureInlineStyles(targets, HERO_PRESENTATION_PROPERTIES);
  } finally {
    // Cached animation setup is retained; visitors keep the unchanged SSR pose.
    restoreRest();
  }
}

function queueFullBoot(
  context: SceneSetupContext,
  presentation: HeroPresentationContext,
  touched: Set<HTMLElement>,
): void {
  const boot = createFullHeroBoot(context);
  const startPoses: Cleanup[] = [];
  const enqueue = (stage: SetupStage): void => {
    context.stage((): void => {
      presentation.add(stage);
    });
  };
  for (const stage of boot.stages) {
    enqueue((): void => {
      startPoses.push(preparePresentationStage(stage, touched));
    });
  }
  enqueue((): void => {
    // quickSetter folds the orbit's CSS translate into its transform cache.
    startPoses.push(
      preparePresentationStage(
        {
          targets: context.queryAll<HTMLElement>(HERO_HOOKS.orbit),
          run: (): void => mountPointerDepth(context),
        },
        touched,
      ),
    );
  });
  enqueue((): void => {
    for (const applyStartPose of startPoses) applyStartPose();
    boot.play();
    context.onCleanup(markSceneReady(context));
  });
}

export const setupHero: SceneSetup = (context): void => {
  if (context.capability.kind === "reduced") {
    context.onCleanup(markSceneReady(context));
    return;
  }
  const touched = new Set<HTMLElement>();
  const presentation = createPresentation(context, touched);
  presentation.add((): void => {
    if (context.capability.kind === "lite") {
      for (const target of context.queryAll<HTMLElement>(
        [HERO_HOOKS.title, HERO_HOOKS.primary, HERO_HOOKS.plate].join(", "),
      ))
        touched.add(target);
      animateLiteSignalBoot(context);
      context.onCleanup(markSceneReady(context));
    } else {
      queueFullBoot(context, presentation, touched);
    }
  });
};
