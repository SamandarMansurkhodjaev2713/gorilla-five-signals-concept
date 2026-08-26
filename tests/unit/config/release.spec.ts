import { describe, expect, it } from "vitest";

import { createRobotsFile, createRobotsMeta } from "@/config/release";

describe("release robots policy", () => {
  it("GIVEN a private release WHEN rendered THEN crawlers are blocked", () => {
    expect(createRobotsMeta("private")).toContain("noindex");
    expect(createRobotsFile("private")).toContain("Disallow: /");
  });

  it("GIVEN a public release WHEN rendered THEN crawlers are allowed", () => {
    expect(createRobotsMeta("public")).toBe("index, follow");
    expect(createRobotsFile("public")).toContain("Allow: /");
  });
});
