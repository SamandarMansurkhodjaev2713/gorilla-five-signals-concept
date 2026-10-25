import type { SupportedLocale } from "@/config/site";

interface ProductDetailCopy {
  readonly visualUnavailable: string;
}

const PRODUCT_DETAIL_COPY: Readonly<
  Record<SupportedLocale, ProductDetailCopy>
> = Object.freeze({
  en: { visualUnavailable: "Product visual is temporarily unavailable" },
  ru: { visualUnavailable: "Изображение продукта временно недоступно" },
  uz: { visualUnavailable: "Mahsulot tasviri vaqtincha mavjud emas" },
});

export function getProductDetailCopy(
  locale: SupportedLocale,
): ProductDetailCopy {
  return PRODUCT_DETAIL_COPY[locale];
}
