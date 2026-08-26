export const MOTION_DURATION_SECONDS = Object.freeze({
  instant: 0.08,
  quick: 0.16,
  standard: 0.26,
  scene: 0.64,
  entranceMax: 0.88,
});

export const MOTION_STAGGER_SECONDS = Object.freeze({
  tight: 0.032,
  standard: 0.048,
});

export const MOTION_EASE = Object.freeze({
  enter: "power4.out",
  exit: "power3.in",
  material: "expo.out",
  snap: "power3.out",
  settle: "back.out(1.15)",
});

export const MOTION_DISTANCE_PX = Object.freeze({
  controlPressure: 2,
  copyReveal: 24,
  panelReveal: 48,
  sceneReveal: 80,
});

export const MOTION_ROTATION_DEGREES = Object.freeze({
  productTilt: 3,
  materialCut: 8,
});

export const MOTION_LIMIT = Object.freeze({
  mobilePinViewportRatio: 1.5,
  maxSimultaneousReveals: 2,
  minimumStableFrames: 2,
});

export type MotionDuration = keyof typeof MOTION_DURATION_SECONDS;
export type MotionEase = keyof typeof MOTION_EASE;
