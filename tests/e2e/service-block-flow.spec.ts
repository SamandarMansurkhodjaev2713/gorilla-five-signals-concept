import { expect, test, type Locator } from "@playwright/test";

import { collectRuntimeErrors } from "./support/site";

const GEOMETRY_TOLERANCE_PX = 0.5;
const PHONE_VIEWPORT = { width: 390, height: 844 };

/** Compare painted boxes, not WebKit's transient pre-paint font measurements. */
async function paintedFlow(root: Locator) {
  await root.screenshot({ animations: "disabled" });
  return root.evaluate((element) => {
    const index = element.querySelector(".home-service-dock__index");
    const contact = element.querySelector(".home-service-dock__contact");
    if (index === null || contact === null)
      throw new Error("Service panels are missing.");
    const rootBox = element.getBoundingClientRect();
    const indexBox = index.getBoundingClientRect();
    const contactBox = contact.getBoundingClientRect();
    return {
      rootHeight: rootBox.height,
      indexHeight: indexBox.height,
      contactHeight: contactBox.height,
      contactOffset: contactBox.top - rootBox.top,
    };
  });
}

function expectStack(box: Awaited<ReturnType<typeof paintedFlow>>): void {
  expect(
    Math.abs(box.rootHeight - box.indexHeight - box.contactHeight),
  ).toBeLessThanOrEqual(GEOMETRY_TOLERANCE_PX);
  expect(Math.abs(box.contactOffset - box.indexHeight)).toBeLessThanOrEqual(
    GEOMETRY_TOLERANCE_PX,
  );
}

test("GIVEN Russian mobile service panels WHEN native answers expand and close THEN root height and contact offset follow the answer growth and restore", async ({
  page,
}) => {
  const errors = await collectRuntimeErrors(page);
  await page.setViewportSize(PHONE_VIEWPORT);
  await page.addInitScript(() => {
    sessionStorage.setItem("gorilla-responsible-entry-confirmed", "true");
    localStorage.setItem("gorilla:motion-preference:v1", "reduced");
  });
  await page.goto("/ru/");
  const root = page.locator(".home-service-dock");
  await root.scrollIntoViewIfNeeded();
  const initial = await paintedFlow(root);
  expectStack(initial);
  const summaries = root.locator("details > summary");
  await expect(summaries).toHaveCount(3);

  for (const summary of await summaries.all()) await summary.press("Enter");
  await expect(root.locator("details[open]")).toHaveCount(3);
  for (const answer of await root.locator("details p").all())
    await expect(answer).toBeVisible();
  const expanded = await paintedFlow(root);
  expectStack(expanded);
  expect(expanded.rootHeight - initial.rootHeight).toBeGreaterThan(
    GEOMETRY_TOLERANCE_PX,
  );
  expect(
    Math.abs(
      expanded.rootHeight -
        initial.rootHeight -
        (expanded.contactOffset - initial.contactOffset),
    ),
  ).toBeLessThanOrEqual(GEOMETRY_TOLERANCE_PX);

  for (const summary of await summaries.all()) await summary.press("Enter");
  await expect(root.locator("details[open]")).toHaveCount(0);
  const restored = await paintedFlow(root);
  expectStack(restored);
  for (const key of [
    "rootHeight",
    "indexHeight",
    "contactHeight",
    "contactOffset",
  ] as const)
    expect(Math.abs(restored[key] - initial[key])).toBeLessThanOrEqual(
      GEOMETRY_TOLERANCE_PX,
    );
  expect(errors).toEqual([]);
});
