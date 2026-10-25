import { describe, expect, it } from "vitest";

import {
  createProductHistoryState,
  ownedProductFromHistory,
  PRODUCT_HISTORY_STATE_KEY,
} from "@/features/product-explorer/product-explorer-url";

const OWNER_PATHNAME = "/uz/";
const ALLOWED_SLUGS = new Set(["original", "zero", "extra"]);

function ownedState(product = "zero") {
  return createProductHistoryState(
    { index: 7, scrollX: 31, scrollY: 47 },
    product,
    OWNER_PATHNAME,
  );
}

describe("product explorer history ownership", () => {
  it("GIVEN Astro and third-party metadata WHEN a product entry is created THEN every existing field is retained without mutation", () => {
    const frameworkState = {
      index: 12,
      scrollX: 144,
      scrollY: 920,
      astro: { direction: "forward" },
      consumer: "preserve-me",
    } as const;

    const state = createProductHistoryState(
      frameworkState,
      "zero",
      OWNER_PATHNAME,
    );

    expect(state).not.toBe(frameworkState);
    expect(state).toMatchObject(frameworkState);
    expect(frameworkState).not.toHaveProperty(PRODUCT_HISTORY_STATE_KEY);
    expect(
      ownedProductFromHistory({
        allowedSlugs: ALLOWED_SLUGS,
        currentHref: "https://example.test/uz/?product=zero",
        ownerPathname: OWNER_PATHNAME,
        state,
      }),
    ).toBe("zero");
  });

  it.each([
    ["null", null],
    ["undefined", undefined],
    ["a primitive", "zero"],
    ["an array", []],
    ["an unowned legacy product field", { product: "zero" }],
    ["a null namespace", { [PRODUCT_HISTORY_STATE_KEY]: null }],
    [
      "an unknown version",
      {
        [PRODUCT_HISTORY_STATE_KEY]: {
          ownerPathname: OWNER_PATHNAME,
          product: "zero",
          version: 2,
        },
      },
    ],
    [
      "a non-string product",
      {
        [PRODUCT_HISTORY_STATE_KEY]: {
          ownerPathname: OWNER_PATHNAME,
          product: 0,
          version: 1,
        },
      },
    ],
  ])(
    "GIVEN %s history state WHEN ownership is resolved THEN it remains framework-owned",
    (_scenario, state) => {
      expect(
        ownedProductFromHistory({
          allowedSlugs: ALLOWED_SLUGS,
          currentHref: "https://example.test/uz/?product=zero",
          ownerPathname: OWNER_PATHNAME,
          state,
        }),
      ).toBeNull();
    },
  );

  it.each([
    [
      "the active controller belongs to another route",
      "/ru/",
      "https://example.test/uz/?product=zero",
      ownedState(),
    ],
    [
      "the current location is another route",
      OWNER_PATHNAME,
      "https://example.test/ru/?product=zero",
      ownedState(),
    ],
    [
      "the URL product does not match the owned entry",
      OWNER_PATHNAME,
      "https://example.test/uz/?product=extra",
      ownedState(),
    ],
    [
      "the owned product is no longer allowed",
      OWNER_PATHNAME,
      "https://example.test/uz/?product=retired",
      ownedState("retired"),
    ],
  ])(
    "GIVEN %s WHEN ownership is resolved THEN Astro retains the traversal",
    (_scenario, ownerPathname, currentHref, state) => {
      expect(
        ownedProductFromHistory({
          allowedSlugs: ALLOWED_SLUGS,
          currentHref,
          ownerPathname,
          state,
        }),
      ).toBeNull();
    },
  );
});
