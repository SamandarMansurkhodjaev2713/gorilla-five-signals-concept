import { describe, expect, it } from "vitest";

import {
  createLocatorPresentation,
  DEFAULT_LOCATOR_LABEL,
} from "@/features/locator/locator-presentation";

describe("locator presentation", () => {
  it("GIVEN a selected product WHEN the handoff renders THEN search intent and product state agree", () => {
    const presentation = createLocatorPresentation(
      "Mango–Kokos",
      "mango-coconut",
    );

    expect(presentation).toEqual({
      flavor: "mango-coconut",
      googleUrl:
        "https://www.google.com/maps/search/?api=1&query=Mango%E2%80%93Kokos%20Tashkent",
      selection: "product",
      status: "Mango–Kokos · Tashkent",
      yandexUrl:
        "https://yandex.uz/maps/10335/tashkent/search/Mango%E2%80%93Kokos%20Tashkent/",
    });
  });

  it("GIVEN an empty label and slug WHEN the handoff renders THEN the honest range fallback wins", () => {
    const presentation = createLocatorPresentation("   ", "");

    expect(presentation.flavor).toBe("original");
    expect(presentation.selection).toBe("range");
    expect(presentation.status).toBe(`${DEFAULT_LOCATOR_LABEL} · Tashkent`);
    expect(presentation.googleUrl).toContain(
      "query=Gorilla%20Energy%20Tashkent",
    );
  });
});
