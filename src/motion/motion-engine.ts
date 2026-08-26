import type { gsap as GsapApi } from "gsap";
import type { ScrollTrigger as ScrollTriggerApi } from "gsap/ScrollTrigger";

export interface MotionEngine {
  readonly gsap: typeof GsapApi;
  readonly ScrollTrigger: typeof ScrollTriggerApi;
}

let pendingEngine: Promise<MotionEngine> | undefined;

async function importMotionEngine(): Promise<MotionEngine> {
  const [gsapModule, scrollTriggerModule] = await Promise.all([
    import("gsap"),
    import("gsap/ScrollTrigger"),
  ]);

  gsapModule.gsap.registerPlugin(scrollTriggerModule.ScrollTrigger);

  return {
    gsap: gsapModule.gsap,
    ScrollTrigger: scrollTriggerModule.ScrollTrigger,
  };
}

export async function loadMotionEngine(): Promise<MotionEngine> {
  if (pendingEngine) {
    return pendingEngine;
  }

  pendingEngine = importMotionEngine().catch((error: unknown) => {
    pendingEngine = undefined;
    throw error;
  });

  return pendingEngine;
}
