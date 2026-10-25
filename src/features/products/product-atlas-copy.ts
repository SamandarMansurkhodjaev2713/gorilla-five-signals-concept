import type { SupportedLocale } from "@/config/site";

export interface ProductAtlasCopy {
  readonly activeFrequency: string;
  readonly archiveBrief: string;
  readonly chapter: string;
  readonly collectionWall: string;
  readonly currentRange: string;
  readonly five: string;
  readonly frequencies: string;
  readonly frequencyArchive: string;
  readonly scrollToScan: string;
}

const PRODUCT_ATLAS_COPY: Readonly<Record<SupportedLocale, ProductAtlasCopy>> =
  {
    en: {
      activeFrequency: "Selected flavor",
      archiveBrief:
        "Explore five Gorilla products. Choose a flavor and compare it with another.",
      chapter: "Product",
      collectionWall: "Choose your flavor",
      currentRange: "Gorilla range",
      five: "Five",
      frequencies: "flavors",
      frequencyArchive: "Find your flavor",
      scrollToScan: "Explore the flavors",
    },
    ru: {
      activeFrequency: "Выбранный вкус",
      archiveBrief: "Выберите свой вкус Gorilla и сравните его с другими.",
      chapter: "Продукт",
      collectionWall: "Выберите свой вкус",
      currentRange: "Линейка Gorilla",
      five: "Пять",
      frequencies: "вкусов",
      frequencyArchive: "Найди свой вкус",
      scrollToScan: "Листайте вкусы",
    },
    uz: {
      activeFrequency: "Tanlangan ta’m",
      archiveBrief: "Gorilla ta’mlarini ko‘ring va yoqqanlarini taqqoslang.",
      chapter: "Mahsulot",
      collectionWall: "Ta’mingizni tanlang",
      currentRange: "Gorilla mahsulotlari",
      five: "Besh",
      frequencies: "ta’m",
      frequencyArchive: "Ta’mingizni tanlang",
      scrollToScan: "Ta’mlarni ko‘ring",
    },
  };

export function getProductAtlasCopy(locale: SupportedLocale): ProductAtlasCopy {
  return PRODUCT_ATLAS_COPY[locale];
}
