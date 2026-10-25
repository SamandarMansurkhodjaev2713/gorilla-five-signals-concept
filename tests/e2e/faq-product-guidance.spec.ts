import { expect, test } from "@playwright/test";

import caffeine from "../../src/content/faqs/caffeine.json" with { type: "json" };
import productInformation from "../../src/content/faqs/product-information.json" with { type: "json" };
import { LOCALES } from "./support/site";

const EXPECTED_ANSWERS = {
  en: [
    "Check the caffeine content on the label of the can you are buying.",
    "Check ingredients and nutrition on the label of the can you are buying.",
  ],
  ru: [
    "Содержание кофеина смотрите на этикетке приобретаемой банки.",
    "Состав и пищевую ценность смотрите на этикетке приобретаемой банки.",
  ],
  uz: [
    "Kofein miqdorini xarid qilayotgan bankangiz yorlig‘idan tekshiring.",
    "Tarkib va ozuqaviy qiymatni xarid qilayotgan bankangiz yorlig‘idan tekshiring.",
  ],
} as const;
const QUESTIONS = [caffeine.question, productInformation.question] as const;

test.use({
  contextOptions: { javaScriptEnabled: false, reducedMotion: "reduce" },
});

for (const locale of LOCALES) {
  test(`GIVEN ${locale} FAQ without scripts WHEN product questions open THEN answers guide to the purchased label without promising unavailable site values`, async ({
    page,
  }) => {
    const response = await page.goto(`/${locale}/faq/`, {
      waitUntil: "domcontentloaded",
    });
    expect(response?.status()).toBe(200);
    for (const [index, question] of QUESTIONS.entries()) {
      const expectedAnswer = EXPECTED_ANSWERS[locale][index];
      if (expectedAnswer === undefined)
        throw new Error("Every product question needs an expected answer.");
      const answer = page
        .locator("details")
        .filter({ has: page.getByText(question[locale], { exact: true }) });
      await expect(answer).toHaveCount(1);
      await answer.locator("summary").click();
      await expect(answer).toHaveAttribute("open", "");
      await expect(answer.locator(".manual-answer > p").last()).toHaveText(
        expectedAnswer,
      );
    }
  });
}
