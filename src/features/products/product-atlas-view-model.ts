import type { SupportedLocale } from "@/config/site";
import type { ProductView } from "@/features/site/catalog";
import type { SiteCopy } from "@/features/site/copy";

import type { ProductAtlasCopy } from "./product-atlas-copy";

export interface ProductAtlasEntry {
  readonly index: number;
  readonly number: string;
  readonly product: ProductView;
}

export interface ProductAtlasViewModel {
  readonly copy: SiteCopy;
  readonly locale: SupportedLocale;
  readonly products: readonly ProductView[];
  readonly text: ProductAtlasCopy;
}
