import type { SceneSetupContext } from "../create-scene";
import { MOTION_DURATION_SECONDS, MOTION_EASE } from "../tokens";

const MENU_SELECTOR = "[data-motion-menu]";
const PANEL_SELECTOR = "[data-motion-menu-panel]";
const MENU_MOTION_TARGET_SELECTOR = [
  ".mobile-navigation nav a",
  ".menu-motion-console",
  ".menu-locales",
].join(", ");
const FULL_MENU_SPEC = Object.freeze({
  opacityFrom: 0.72,
  staggerSeconds: 0.032,
  translateY: 24,
});
const LITE_MENU_SPEC = Object.freeze({ opacityFrom: 0.86 });

type SceneTimeline = ReturnType<SceneSetupContext["gsap"]["timeline"]>;

function clearMenuMotion(
  context: SceneSetupContext,
  targets: readonly HTMLElement[],
): void {
  context.gsap.set(targets, { clearProps: "opacity,transform" });
  delete context.root.dataset.menuMotion;
}

function createMenuTimeline(
  context: SceneSetupContext,
  targets: readonly HTMLElement[],
  onComplete: () => void,
): SceneTimeline {
  const timeline = context.gsap.timeline({ onComplete });
  if (context.capability.kind === "full") {
    return timeline.fromTo(
      targets,
      { opacity: FULL_MENU_SPEC.opacityFrom, y: FULL_MENU_SPEC.translateY },
      {
        duration: MOTION_DURATION_SECONDS.standard,
        ease: MOTION_EASE.enter,
        opacity: 1,
        stagger: FULL_MENU_SPEC.staggerSeconds,
        y: 0,
      },
    );
  }
  return timeline.fromTo(
    targets,
    { opacity: LITE_MENU_SPEC.opacityFrom },
    {
      duration: MOTION_DURATION_SECONDS.quick,
      ease: MOTION_EASE.enter,
      opacity: 1,
    },
  );
}

export function setupNavigationMenuMotion(
  context: SceneSetupContext,
): () => void {
  const menu = context.query<HTMLDetailsElement>(MENU_SELECTOR);
  const panel = menu?.querySelector<HTMLElement>(PANEL_SELECTOR) ?? null;
  const targets = panel
    ? Array.from(
        panel.querySelectorAll<HTMLElement>(MENU_MOTION_TARGET_SELECTOR),
      )
    : [];
  let timeline: SceneTimeline | null = null;

  const settle = (): void => {
    timeline?.kill();
    timeline = null;
    clearMenuMotion(context, targets);
  };
  const synchronize = (): void => {
    settle();
    if (!menu?.open || targets.length === 0) {
      return;
    }
    context.root.dataset.menuMotion = "running";
    timeline = createMenuTimeline(context, targets, settle);
  };

  if (menu && panel && context.capability.kind !== "reduced") {
    context.listen(menu, "toggle", synchronize);
    context.listen(panel, "focusin", settle);
    context.listen(panel, "pointerdown", settle);
  }
  return settle;
}
