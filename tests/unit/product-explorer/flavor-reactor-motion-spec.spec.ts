import { describe, expect, it } from "vitest";

import {
  FLAVOR_MOTION_SLUGS,
  FLAVOR_TRAJECTORIES,
  getFlavorTrajectory,
} from "@/features/flavor-reactor/flavor-reactor-motion-spec";

describe("flavor reactor motion specification", () => {
  it("GIVEN five flavor worlds WHEN their non-color trajectories resolve THEN every signature is distinct", () => {
    const signatures = FLAVOR_MOTION_SLUGS.map((slug) =>
      JSON.stringify(FLAVOR_TRAJECTORIES[slug]),
    );

    expect(new Set(signatures).size).toBe(FLAVOR_MOTION_SLUGS.length);
  });

  it("GIVEN an absent or unknown flavor slug WHEN its trajectory resolves THEN the motion contract fails closed", () => {
    expect(() => getFlavorTrajectory(undefined)).toThrow(
      'Missing flavor-reactor motion trajectory for "".',
    );
    expect(() => getFlavorTrajectory("unknown")).toThrow(
      'Missing flavor-reactor motion trajectory for "unknown".',
    );
  });
});
