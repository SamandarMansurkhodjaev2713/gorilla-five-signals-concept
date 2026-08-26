import { expect, test } from "@playwright/test";

import {
  LOCALES,
  ROUTE_SUFFIXES,
  expectSemanticPage,
  localizedPath,
} from "./support/site";

test.describe("locale parity", () => {
  test.skip(({ browserName }) => browserName !== "chromium");

  test("GIVEN any localized route WHEN locale links are inspected THEN the same content path is available in every locale", async ({
    page,
  }) => {
    test.setTimeout(120_000);

    for (const sourceLocale of LOCALES) {
      for (const suffix of ROUTE_SUFFIXES) {
        await expectSemanticPage(page, sourceLocale, suffix);

        for (const targetLocale of LOCALES) {
          await expect(
            page
              .locator(`a[href="${localizedPath(targetLocale, suffix)}"]`)
              .first(),
            `${sourceLocale}${suffix} cannot switch to ${targetLocale}`,
          ).toBeAttached();
        }
      }
    }
  });

  test("GIVEN localized metadata WHEN alternates are inspected THEN every supported locale is declared", async ({
    page,
  }) => {
    for (const locale of LOCALES) {
      await expectSemanticPage(page, locale);

      for (const alternateLocale of LOCALES) {
        await expect(
          page.locator(`link[rel="alternate"][hreflang="${alternateLocale}"]`),
        ).toHaveCount(1);
      }
    }
  });

  test("GIVEN a shareable product selection WHEN locale changes THEN the selected product intent is preserved", async ({
    page,
  }) => {
    await page.goto("/uz/?product=zero");

    for (const locale of LOCALES) {
      await expect(
        page.locator(`a[href="/${locale}/?product=zero"]`).first(),
      ).toBeAttached();
    }
  });

  test("GIVEN each locale WHEN core product routes render THEN visible labels and outbound locale state remain localized", async ({
    page,
  }) => {
    const expectations = {
      en: {
        contact: "Five intents / One official route",
        range: "01 / Range",
        selector: "Choose products to compare",
      },
      ru: {
        contact: "Пять запросов / Один официальный маршрут",
        range: "01 / Линейка",
        selector: "Выберите продукты для сравнения",
      },
      uz: {
        contact: "Besh murojaat / Bitta rasmiy yo‘l",
        range: "01 / Qator",
        selector: "Taqqoslash uchun mahsulotlarni tanlang",
      },
    } as const;

    for (const locale of LOCALES) {
      await expectSemanticPage(page, locale);
      await expect(page.locator(".manifesto .type-label").first()).toHaveText(
        expectations[locale].range,
      );

      await expectSemanticPage(page, locale, "/compare");
      await expect(page.locator(".selector-panel legend")).toHaveText(
        expectations[locale].selector,
      );

      await expectSemanticPage(page, locale, "/contact");
      await expect(page.locator("[data-contact-eyebrow]")).toHaveText(
        expectations[locale].contact,
      );
      await expect(page.locator("[data-contact-official]")).toHaveAttribute(
        "href",
        `https://www.gorillaenergy.uz/?locale=${locale}`,
      );
    }
  });
});
