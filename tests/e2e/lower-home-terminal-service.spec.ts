import { expect, test } from "@playwright/test";

import { collectRuntimeErrors, expectSemanticPage } from "./support/site";

const TERMINAL_SCENE = '[data-motion-scene="culture-signal"]';
const LOCATOR_SCENE = '[data-motion-scene="store-locator"]';
const FAQ_SCENE = '[data-motion-scene="faq-safety"]';
const CONTACT_SCENE = '[data-motion-scene="contact-partnership"]';
const PRESENTATION_PROPERTIES = ["clip-path", "opacity", "visibility"] as const;
const PRESENTATION_SELECTOR = [
  ".tashkent-terminal__copy > *",
  ".tashkent-terminal__field",
  ".tashkent-terminal__word",
  ".tashkent-terminal__coordinate",
  ".tashkent-terminal__route",
  ".tashkent-terminal__route i",
  ".tashkent-terminal__locator",
  ".tashkent-terminal__locator > *",
  ".home-service-dock__index header",
  ".home-service-dock__questions details",
  ".home-service-dock__questions > .control",
  ".home-service-dock__contact",
  ".home-service-dock__contact-word",
  ".home-service-dock__contact > *",
].join(", ");

async function openConfirmedHome(
  page: Parameters<typeof expectSemanticPage>[0],
  preference: "full" | "lite" | "reduced",
): Promise<void> {
  await page.addInitScript((motionPreference) => {
    sessionStorage.setItem("gorilla-responsible-entry-confirmed", "true");
    localStorage.setItem("gorilla:motion-preference:v1", motionPreference);
  }, preference);
  await expectSemanticPage(page, "uz");
}

async function expectNoPresentationResidue(
  page: Parameters<typeof expectSemanticPage>[0],
): Promise<void> {
  await expect
    .poll(() =>
      page.evaluate(
        ({ properties, selector }) =>
          Array.from(document.querySelectorAll<HTMLElement>(selector)).flatMap(
            (element) =>
              properties.filter(
                (property) => element.style.getPropertyValue(property) !== "",
              ),
          ),
        {
          properties: PRESENTATION_PROPERTIES,
          selector: PRESENTATION_SELECTOR,
        },
      ),
    )
    .toEqual([]);
}

test.describe("terminal and service finite handoffs", () => {
  test.skip(({ browserName }) => browserName !== "chromium");

  test("GIVEN Full motion WHEN terminal and service enter view THEN each composition settles once without stealing CSS-owned properties", async ({
    page,
  }) => {
    await openConfirmedHome(page, "full");
    const terminal = page.locator(TERMINAL_SCENE);
    const service = page.locator(FAQ_SCENE);
    await terminal.scrollIntoViewIfNeeded();
    await expect(terminal).toHaveAttribute("data-motion-ready", "full");
    await expect(page.locator(LOCATOR_SCENE)).toHaveAttribute(
      "data-motion-ready",
      "full",
    );
    await service.scrollIntoViewIfNeeded();
    await expect(service).toHaveAttribute("data-motion-ready", "full");
    await expect(page.locator(CONTACT_SCENE)).toHaveAttribute(
      "data-motion-ready",
      "full",
    );
    await expectNoPresentationResidue(page);

    const cssOwnership = await page.evaluate(() => ({
      contactPlane:
        document.querySelector<HTMLElement>(".home-service-dock__contact-plane")
          ?.style.clipPath ?? "",
      locatorGrid:
        document.querySelector<HTMLElement>(".tashkent-terminal__grid")?.style
          .transform ?? "",
      locatorMarker:
        document.querySelector<HTMLElement>(".tashkent-terminal__marker")?.style
          .transform ?? "",
    }));
    expect(cssOwnership).toEqual({
      contactPlane: "",
      locatorGrid: "",
      locatorMarker: "",
    });
  });

  test("GIVEN Reduced motion WHEN FAQ details are operated THEN native open state and focus remain intact without presentation residue", async ({
    page,
  }) => {
    await openConfirmedHome(page, "reduced");
    const service = page.locator(FAQ_SCENE);
    await service.scrollIntoViewIfNeeded();
    await expect(service).toHaveAttribute("data-motion-ready", "reduced");
    await expect(page.locator(CONTACT_SCENE)).toHaveAttribute(
      "data-motion-ready",
      "reduced",
    );
    const details = service.locator("details").first();
    const summary = details.locator("summary");
    await summary.focus();
    await page.keyboard.press("Enter");

    await expect(details).toHaveAttribute("open", "");
    await expect(summary).toBeFocused();
    await expectNoPresentationResidue(page);
  });

  test("GIVEN mounted lower-home scenes WHEN a route leaves and history restores the homepage THEN scenes remount once without diagnostics", async ({
    page,
  }) => {
    const errors = await collectRuntimeErrors(page);
    await openConfirmedHome(page, "lite");
    await page.locator(TERMINAL_SCENE).scrollIntoViewIfNeeded();
    const initialLocator = page.locator(LOCATOR_SCENE);
    await initialLocator.scrollIntoViewIfNeeded();
    await expect(initialLocator).toHaveAttribute("data-motion-ready", "lite");
    await page.locator(".tashkent-terminal__copy a").click();
    await expect(page).toHaveURL(/\/uz\/culture\/?$/u);
    await page.goBack({ waitUntil: "domcontentloaded" });

    const terminal = page.locator(TERMINAL_SCENE);
    await terminal.scrollIntoViewIfNeeded();
    await expect(terminal).toHaveAttribute("data-motion-ready", "lite");
    const restoredLocator = page.locator(LOCATOR_SCENE);
    await restoredLocator.scrollIntoViewIfNeeded();
    await expect(restoredLocator).toHaveAttribute("data-motion-ready", "lite");
    await expectNoPresentationResidue(page);
    expect(errors).toEqual([]);
  });
});

test.describe("terminal and service no-JavaScript parity", () => {
  test.use({ javaScriptEnabled: false });

  test("GIVEN JavaScript is unavailable WHEN lower-home content renders THEN locator, contact, and native FAQ details remain usable", async ({
    page,
  }) => {
    await expectSemanticPage(page, "uz");
    await expect(page.locator(".tashkent-terminal__locator")).toHaveAttribute(
      "href",
      "/uz/find/",
    );
    await expect(page.locator(".home-service-dock__contact")).toHaveAttribute(
      "href",
      "/uz/contact/",
    );
    const details = page.locator(".home-service-dock details").first();
    await details.locator("summary").click();
    await expect(details).toHaveAttribute("open", "");
    await expect(details.locator("p")).toBeVisible();
  });
});
