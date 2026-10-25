import type { HomeServiceTargets } from "@/motion/scene-setups/home-service-motion-contract";

function serviceTarget(name: string): HTMLElement {
  const port = { name };
  // TYPE-EXCEPTION: Pure plan and adapter tests preserve opaque target
  // identity; no unimplemented DOM behavior is read from this fixture.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  return port as unknown as HTMLElement;
}

export function createHomeServiceTargets(): HomeServiceTargets {
  return {
    header: serviceTarget("header"),
    rows: Array.from({ length: 3 }, (_, index) =>
      serviceTarget(`row-${String(index)}`),
    ),
    action: serviceTarget("action"),
    contact: serviceTarget("contact"),
    contactWord: serviceTarget("contact-word"),
    contactCopy: Array.from({ length: 5 }, (_, index) =>
      serviceTarget(`contact-copy-${String(index)}`),
    ),
  };
}
