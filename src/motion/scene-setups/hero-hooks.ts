export const HERO_HOOKS = Object.freeze({
  frequency: "[data-motion-hero-frequency]",
  ghosts: "[data-hero-ghost]",
  orbit: "[data-motion-hero-orbit]",
  primary: "[data-hero-primary-can]",
  plate: "[data-motion-hero-band]",
  support: "[data-motion-hero-support]",
  title: "[data-motion-hero-title]",
});

export const HERO_PRESENTATION_SELECTOR = Object.values(HERO_HOOKS).join(", ");
