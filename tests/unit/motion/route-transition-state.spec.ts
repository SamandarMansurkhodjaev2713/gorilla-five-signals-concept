import { describe, expect, it } from "vitest";

import { createRouteCode } from "@/motion/route-transition-state";

describe("createRouteCode", () => {
  it("GIVEN a localized home URL WHEN its code is resolved THEN HOME is returned", () => {
    expect(createRouteCode(new URL("https://example.test/uz/"))).toBe("HOME");
  });

  it("GIVEN a hyphenated product URL WHEN its code is resolved THEN the slug becomes a readable signal", () => {
    expect(
      createRouteCode(
        new URL("https://example.test/uz/products/mango-coconut/"),
      ),
    ).toBe("MANGO COCONUT");
  });

  it("GIVEN an unsupported script-only slug WHEN it is normalized THEN the safe fallback is returned", () => {
    expect(createRouteCode(new URL("https://example.test/uz/частота/"))).toBe(
      "SIGNAL",
    );
  });

  it("GIVEN malformed percent encoding WHEN it is normalized THEN the safe fallback is returned", () => {
    expect(createRouteCode(new URL("https://example.test/uz/%E0%A4%A/"))).toBe(
      "SIGNAL",
    );
  });

  it("GIVEN an oversized slug WHEN it is normalized THEN the route chrome stays bounded", () => {
    const code = createRouteCode(
      new URL(
        "https://example.test/uz/an-excessively-long-destination-signal-name/",
      ),
    );
    expect(code.length).toBeLessThanOrEqual(24);
  });
});
