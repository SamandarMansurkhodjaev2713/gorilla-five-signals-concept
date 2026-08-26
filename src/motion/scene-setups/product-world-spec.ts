import type { SceneSetupContext } from "../create-scene";

type TweenVars = Parameters<SceneSetupContext["gsap"]["from"]>[1];

interface ProductWorldScrollSpec {
  readonly aura: TweenVars;
  readonly copy: TweenVars;
  readonly field: TweenVars;
  readonly media: TweenVars;
  readonly particles: TweenVars;
  readonly volume: TweenVars;
}

export interface ProductWorldMotionSpec {
  readonly aura: TweenVars;
  readonly copy: TweenVars;
  readonly field: TweenVars;
  readonly handoff: TweenVars;
  readonly id: string;
  readonly information: TweenVars;
  readonly media: TweenVars;
  readonly particles: TweenVars;
  readonly reflection: TweenVars;
  readonly scroll: ProductWorldScrollSpec;
  readonly vectors: TweenVars;
  readonly volume: TweenVars;
}

const SHIFT_FAR_PX = 112;
const SHIFT_MID_PX = 72;
const SHIFT_NEAR_PX = 40;
const ROTATION_HARD_DEG = 12;
const ROTATION_MID_DEG = 7;
const ROTATION_SOFT_DEG = 3;
const SCALE_COLLAPSED = 0.32;
const SCALE_COMPRESSED = 0.68;
const SCALE_NEAR = 0.88;
const SCALE_EXPANDED = 1.03;

const WORLD_MOTION = new Map<string, ProductWorldMotionSpec>([
  [
    "original",
    {
      aura: { scale: SCALE_COLLAPSED },
      copy: { autoAlpha: 0, rotate: -ROTATION_MID_DEG, x: -SHIFT_FAR_PX },
      field: { scaleX: SCALE_COLLAPSED, transformOrigin: "left center" },
      handoff: { rotate: ROTATION_MID_DEG, x: SHIFT_FAR_PX },
      id: "rupture-strike",
      information: { rotate: -ROTATION_MID_DEG, x: -SHIFT_MID_PX },
      media: {
        rotate: -ROTATION_HARD_DEG,
        scale: SCALE_COMPRESSED,
        x: SHIFT_FAR_PX,
        y: SHIFT_MID_PX,
      },
      particles: { scaleY: SCALE_COLLAPSED, transformOrigin: "center top" },
      reflection: { autoAlpha: 0, x: SHIFT_NEAR_PX },
      scroll: {
        aura: { rotate: ROTATION_SOFT_DEG, scale: 0.94 },
        copy: { xPercent: -2 },
        field: { xPercent: -4 },
        media: { rotate: -2, xPercent: -7, yPercent: -5 },
        particles: { xPercent: 18, yPercent: -12 },
        volume: { xPercent: 6 },
      },
      vectors: { scaleY: SCALE_COLLAPSED, transformOrigin: "center top" },
      volume: { rotate: -ROTATION_MID_DEG, x: -SHIFT_MID_PX },
    },
  ],
  [
    "zero",
    {
      aura: { scale: SCALE_COLLAPSED },
      copy: { autoAlpha: 0, y: -SHIFT_NEAR_PX },
      field: { rotate: ROTATION_HARD_DEG, scale: SCALE_COMPRESSED },
      handoff: { autoAlpha: 0, scaleY: SCALE_NEAR },
      id: "frequency-lock",
      information: { autoAlpha: 0, scale: SCALE_NEAR },
      media: { autoAlpha: 0, scaleX: SCALE_COMPRESSED, y: SHIFT_MID_PX },
      particles: { scaleX: SCALE_COLLAPSED },
      reflection: { autoAlpha: 0, scaleY: SCALE_COLLAPSED },
      scroll: {
        aura: { rotate: -ROTATION_SOFT_DEG, scale: 0.96 },
        copy: { yPercent: 2 },
        field: { rotate: ROTATION_SOFT_DEG },
        media: { scale: 0.98, yPercent: -7 },
        particles: { rotate: ROTATION_MID_DEG },
        volume: { rotate: -ROTATION_SOFT_DEG },
      },
      vectors: { scale: SCALE_COLLAPSED, transformOrigin: "center" },
      volume: { rotate: -ROTATION_HARD_DEG, scale: SCALE_COMPRESSED },
    },
  ],
  [
    "extra",
    {
      aura: { rotate: -45, scale: SCALE_COLLAPSED },
      copy: { autoAlpha: 0, scaleY: SCALE_COMPRESSED, y: -SHIFT_MID_PX },
      field: { rotate: -ROTATION_HARD_DEG, scale: SCALE_COLLAPSED },
      handoff: { scale: SCALE_NEAR, y: SHIFT_FAR_PX },
      id: "axial-overdrive",
      information: { x: SHIFT_FAR_PX },
      media: {
        rotate: ROTATION_MID_DEG,
        scale: SCALE_COMPRESSED,
        y: SHIFT_FAR_PX,
      },
      particles: { scaleY: SCALE_COLLAPSED, transformOrigin: "center top" },
      reflection: { autoAlpha: 0, y: SHIFT_MID_PX },
      scroll: {
        aura: { rotate: 49, scale: SCALE_NEAR },
        copy: { yPercent: 3 },
        field: { scale: 1.05 },
        media: { scale: SCALE_EXPANDED, yPercent: -10 },
        particles: { scaleY: 1.12 },
        volume: { yPercent: -7 },
      },
      vectors: { scaleX: SCALE_COLLAPSED, transformOrigin: "center" },
      volume: { scaleY: SCALE_COMPRESSED, transformOrigin: "center bottom" },
    },
  ],
  [
    "mango-coconut",
    {
      aura: { rotate: ROTATION_HARD_DEG, scaleX: SCALE_COMPRESSED },
      copy: { autoAlpha: 0, x: -SHIFT_FAR_PX },
      field: { scaleX: SCALE_COLLAPSED, transformOrigin: "center" },
      handoff: { rotate: ROTATION_MID_DEG, x: SHIFT_FAR_PX },
      id: "temperature-collision",
      information: { x: -SHIFT_MID_PX },
      media: {
        rotate: ROTATION_HARD_DEG,
        scale: SCALE_NEAR,
        x: SHIFT_FAR_PX,
      },
      particles: { scaleY: SCALE_COLLAPSED, transformOrigin: "center top" },
      reflection: { autoAlpha: 0, rotate: ROTATION_HARD_DEG },
      scroll: {
        aura: { rotate: -ROTATION_MID_DEG, scaleX: 1.18 },
        copy: { xPercent: 3 },
        field: { xPercent: -4 },
        media: { rotate: -1.5, xPercent: -6, yPercent: -4 },
        particles: { xPercent: 12, yPercent: -5 },
        volume: { xPercent: 4 },
      },
      vectors: { scaleY: SCALE_COLLAPSED, transformOrigin: "center top" },
      volume: { scaleX: SCALE_COMPRESSED, transformOrigin: "center" },
    },
  ],
  [
    "lychee-pear",
    {
      aura: { rotate: ROTATION_HARD_DEG, scale: SCALE_COMPRESSED },
      copy: { autoAlpha: 0, rotate: ROTATION_MID_DEG, x: SHIFT_FAR_PX },
      field: { rotate: -36, scale: SCALE_COMPRESSED },
      handoff: { rotate: -ROTATION_MID_DEG, x: -SHIFT_FAR_PX },
      id: "prismatic-orbit",
      information: { rotate: ROTATION_MID_DEG, y: SHIFT_MID_PX },
      media: {
        rotate: -ROTATION_HARD_DEG,
        scale: SCALE_COMPRESSED,
        x: -SHIFT_FAR_PX,
        y: SHIFT_NEAR_PX,
      },
      particles: { rotate: -ROTATION_HARD_DEG, scaleX: SCALE_COLLAPSED },
      reflection: { autoAlpha: 0, rotate: -ROTATION_MID_DEG },
      scroll: {
        aura: { rotate: -ROTATION_HARD_DEG, scaleX: 1.1 },
        copy: { xPercent: -3 },
        field: { rotate: ROTATION_MID_DEG },
        media: { rotate: 1.5, xPercent: 4, yPercent: -5 },
        particles: { rotate: ROTATION_HARD_DEG, yPercent: -8 },
        volume: { rotate: -ROTATION_MID_DEG },
      },
      vectors: { rotate: ROTATION_HARD_DEG, scaleX: SCALE_COLLAPSED },
      volume: { rotate: ROTATION_HARD_DEG, scale: SCALE_COMPRESSED },
    },
  ],
]);

export function getProductWorldMotion(
  slug: string,
): ProductWorldMotionSpec | undefined {
  return WORLD_MOTION.get(slug);
}
