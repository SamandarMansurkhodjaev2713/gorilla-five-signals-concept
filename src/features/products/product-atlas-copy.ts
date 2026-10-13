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
  readonly scan: string;
  readonly scrollToScan: string;
}

const PRODUCT_ATLAS_COPY: Readonly<Record<SupportedLocale, ProductAtlasCopy>> =
  {
    en: {
      activeFrequency: "Active frequency",
      archiveBrief:
        "Explore five Gorilla products. Choose a can, open its details, or compare your selection.",
      chapter: "Frequency record",
      collectionWall: "Five-can collection wall",
      currentRange: "Current Uzbekistan range",
      five: "Five",
      frequencies: "frequencies",
      frequencyArchive: "Tashkent frequency archive",
      scan: "live scan",
      scrollToScan: "Scroll to scan the archive",
    },
    ru: {
      activeFrequency: "Активная частота",
      archiveBrief:
        "Откройте пять продуктов Gorilla. Выберите банку, узнайте о ней больше или сравните варианты.",
      chapter: "Запись частоты",
      collectionWall: "Стена коллекции из пяти банок",
      currentRange: "Актуальная линейка Узбекистана",
      five: "Пять",
      frequencies: "частот",
      frequencyArchive: "Архив частот Ташкента",
      scan: "сканирование",
      scrollToScan: "Прокрутите, чтобы сканировать архив",
    },
    uz: {
      activeFrequency: "Faol chastota",
      archiveBrief:
        "Gorilla’ning beshta mahsuloti bilan tanishing. Bankani tanlang, batafsil ko‘ring yoki variantlarni taqqoslang.",
      chapter: "Chastota yozuvi",
      collectionWall: "Besh banka kolleksiya devori",
      currentRange: "O‘zbekistonning joriy qatori",
      five: "Besh",
      frequencies: "chastota",
      frequencyArchive: "Toshkent chastotalar arxivi",
      scan: "jonli skan",
      scrollToScan: "Arxivni skan qilish uchun aylantiring",
    },
  };

export function getProductAtlasCopy(locale: SupportedLocale): ProductAtlasCopy {
  return PRODUCT_ATLAS_COPY[locale];
}
