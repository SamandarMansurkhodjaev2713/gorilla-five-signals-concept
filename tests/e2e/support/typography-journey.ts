import { expect } from "@playwright/test";
import type { Page } from "@playwright/test";

import { getSiteCopy } from "../../../src/features/site/copy";
import type { SupportedLocale } from "../../../src/config/site";
import { waitForCompactFonts } from "./compact-fonts";
import {
  verifyCompactHeadingClearance,
  verifyCompactMenu,
} from "./compact-header";
import { expectNoHorizontalOverflow, expectSemanticPage } from "./site";
import { openTypographyDuelCompare } from "./typography-compare";
import {
  applyTypographyStress,
  verifyDiscretionaryLabel,
  verifyEntireLabelLine,
  verifyNativeTarget,
  verifyTypographyStress,
  verifyWholeWords,
} from "./typography-integrity";

const HERO_GROUPS = ["Gorilla Energy", "Uzbekistan", "01—05"];
const RANGE_TEXT = "01—05";
const LOGO_CAP_PX = 44;
const GAP_CAP_PX = 8;

export interface TypographyScenario {
  readonly locale: SupportedLocale;
  readonly enlarged: boolean;
  readonly noJs: boolean;
}

/** Actual localized action words must fit; text content stays canonical. */
export async function verifyHeroTypography(
  page: Page,
  scenario: TypographyScenario,
): Promise<void> {
  const groups = page.locator(".hero-kicker__group");
  await expect(groups).toHaveText(HERO_GROUPS);
  for (const group of await groups.all())
    await verifyWholeWords(group, page.locator(".hero-kicker"));
  await verifyEntireLabelLine(
    groups.filter({ hasText: /^01—05$/u }),
    page.locator(".hero-kicker"),
  );
  const actions = page.locator(".hero-actions > a");
  await expect(actions).toHaveCount(2);
  await expect(page.locator(".hero-primary-action")).toHaveText(
    getSiteCopy(scenario.locale).allProducts,
  );
  for (const action of await actions.all()) {
    await verifyNativeTarget(action);
    await verifyWholeWords(action);
    if (scenario.enlarged) await verifyTypographyStress(action);
  }
  if (scenario.enlarged)
    await verifyTypographyStress(page.locator(".hero-copydeck > p"));
}

async function verifyHeaderTypography(
  page: Page,
  scenario: TypographyScenario,
): Promise<void> {
  const brand = page.locator(".site-header .brand");
  const summary = page.locator(".site-header .mobile-navigation > summary");
  await verifyNativeTarget(brand);
  await verifyNativeTarget(summary);
  const metrics = await page.locator(".site-header").evaluate((header) => ({
    gap: Number.parseFloat(getComputedStyle(header).columnGap),
    logo: header.querySelector(".brand img")?.getBoundingClientRect().width,
  }));
  expect(metrics.logo).toBeDefined();
  expect(metrics.logo).toBeGreaterThan(0);
  expect(metrics.logo).toBeLessThanOrEqual(LOGO_CAP_PX);
  expect(metrics.gap).toBeLessThanOrEqual(GAP_CAP_PX);
  if (!scenario.noJs) {
    await verifyCompactMenu(page);
    await verifyCompactHeadingClearance(page);
    return;
  }
  await verifyNoJsMenu(page, scenario);
}

async function verifyNoJsMenu(
  page: Page,
  scenario: TypographyScenario,
): Promise<void> {
  const summary = page.locator(".site-header .mobile-navigation > summary");
  const menu = page.locator(".mobile-navigation");
  await summary.focus();
  await summary.press("Enter");
  await expect(menu).toHaveAttribute("open", "");
  await expect(page.locator(".mobile-navigation__panel")).toBeVisible();
  await summary.press("Enter");
  await expect(menu).not.toHaveAttribute("open", "");
  await summary.press("Enter");
  const close = page.locator("[data-native-menu-close]");
  await expect(close).toHaveAccessibleName(
    getSiteCopy(scenario.locale).closeMenu,
  );
  await expect(page.locator("button[data-motion-menu-close]")).toBeHidden();
  await verifyNativeTarget(close);
  await close.focus();
  await expect(close).toBeFocused();
  await Promise.all([
    page.waitForEvent("domcontentloaded"),
    close.press("Enter"),
  ]);
  await expect(page).toHaveURL(new RegExp(`/${scenario.locale}/$`, "u"));
  await expect(menu).not.toHaveAttribute("open", "");
  await waitForCompactFonts(page);
  if (scenario.enlarged) await applyTypographyStress(page);
  await verifyHeroTypography(page, scenario);
}

/** The display label can break only at authored syllables when enlarged. */
export async function verifyDuelTypography(
  page: Page,
  scenario: TypographyScenario,
): Promise<void> {
  const action = page.locator(".home-duel__action");
  const label = action.locator("b");
  await label.scrollIntoViewIfNeeded();
  await expect(label).toHaveText(
    getSiteCopy(scenario.locale).navigation.compare,
  );
  if (scenario.enlarged) {
    await verifyTypographyStress(label);
    await verifyDiscretionaryLabel(label, action);
  } else {
    await verifyEntireLabelLine(label, action);
  }
  const arena = page.locator(".home-duel__arena");
  await verifyNativeTarget(arena);
  await openTypographyDuelCompare(page, {
    locale: scenario.locale,
    mode: scenario.noJs ? "no-js" : "reduced",
  });
}

async function verifyAtlasTypography(
  page: Page,
  scenario: TypographyScenario,
): Promise<void> {
  await expectSemanticPage(page, scenario.locale, "products/?motion=static");
  await waitForCompactFonts(page);
  if (scenario.enlarged) await applyTypographyStress(page);
  const metadata = page.locator(".archive-hero__meta");
  const range = metadata.locator(".archive-hero__range");
  await expect(range).toHaveText(RANGE_TEXT);
  await verifyEntireLabelLine(range, metadata);
  const label = metadata.locator(".type-label");
  expect(
    (await label.textContent())?.replace(RANGE_TEXT, "").replace("/", "").trim()
      .length,
  ).toBeGreaterThan(0);
  await verifyWholeWords(label, metadata);
  const coordinates = metadata.locator(".archive-hero__coordinate");
  await expect(coordinates).toHaveText(["41.2995° N", "69.2401° E"]);
  for (const coordinate of await coordinates.all())
    await verifyEntireLabelLine(coordinate, metadata);
  if (scenario.enlarged) await verifyTypographyStress(label);
  const briefLabel = page.locator(".archive-hero__brief .type-label");
  await verifyWholeWords(briefLabel, page.locator(".archive-hero__brief"));
  if (scenario.enlarged) await verifyTypographyStress(briefLabel);
  await expectNoHorizontalOverflow(page);
}

/** Natural routes and controls remain active in every typography mode. */
export async function runTypographyJourney(
  page: Page,
  scenario: TypographyScenario,
): Promise<void> {
  await page.addInitScript(() =>
    sessionStorage.setItem("gorilla-responsible-entry-confirmed", "true"),
  );
  await expectSemanticPage(page, scenario.locale, "?motion=static");
  await waitForCompactFonts(page);
  if (scenario.enlarged) await applyTypographyStress(page);
  await verifyHeroTypography(page, scenario);
  await expectNoHorizontalOverflow(page);
  await verifyHeaderTypography(page, scenario);
  await verifyDuelTypography(page, scenario);
  await verifyAtlasTypography(page, scenario);
}
