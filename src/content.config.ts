import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";

import { mediaSchema } from "./content/schema/media";
import { productSchema } from "./content/schema/product";
import { sourceSchema } from "./content/schema/source";
import {
  cultureSchema,
  faqSchema,
  flavorSchema,
  legalSchema,
  storeSchema,
} from "./content/schema/support";

const jsonCollection = (directory: string) =>
  glob({ base: `./src/content/${directory}`, pattern: "**/*.json" });

const products = defineCollection({
  loader: jsonCollection("products"),
  schema: productSchema,
});

const flavors = defineCollection({
  loader: jsonCollection("flavors"),
  schema: flavorSchema,
});

const stores = defineCollection({
  loader: jsonCollection("stores"),
  schema: storeSchema,
});

const culture = defineCollection({
  loader: jsonCollection("culture"),
  schema: cultureSchema,
});

const faqs = defineCollection({
  loader: jsonCollection("faqs"),
  schema: faqSchema,
});

const legal = defineCollection({
  loader: jsonCollection("legal"),
  schema: legalSchema,
});

const media = defineCollection({
  loader: jsonCollection("media"),
  schema: mediaSchema,
});

const sources = defineCollection({
  loader: jsonCollection("sources"),
  schema: sourceSchema,
});

export const collections = {
  culture,
  faqs,
  flavors,
  legal,
  media,
  products,
  sources,
  stores,
};
