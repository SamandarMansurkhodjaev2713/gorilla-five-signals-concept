import type { CollectionEntry } from "astro:content";

import type { SupportedLocale } from "@/config/site";

type FaqEntry = CollectionEntry<"faqs">;

interface FaqGroupSpec {
  readonly id: "product" | "availability" | "partnership" | "contact";
  readonly label: Readonly<Record<SupportedLocale, string>>;
  readonly questionIds: readonly string[];
}

export interface FaqGroupView {
  readonly entries: readonly FaqEntry[];
  readonly id: FaqGroupSpec["id"];
  readonly label: string;
}

const FAQ_GROUP_SPECS: readonly FaqGroupSpec[] = [
  {
    id: "product",
    label: { en: "Product", ru: "Продукт", uz: "Mahsulot" },
    questionIds: [
      "range",
      "zero",
      "caffeine",
      "product-information",
      "date-and-shelf-life",
    ],
  },
  {
    id: "availability",
    label: { en: "Availability", ru: "Наличие", uz: "Mavjudlik" },
    questionIds: ["availability"],
  },
  {
    id: "partnership",
    label: { en: "Partnership", ru: "Партнёрство", uz: "Hamkorlik" },
    questionIds: ["creative-partnerships", "sponsorship-age", "logo-use"],
  },
  {
    id: "contact",
    label: { en: "Contact", ru: "Контакты", uz: "Bog‘lanish" },
    questionIds: ["other-question"],
  },
];

function indexFaqs(
  entries: readonly FaqEntry[],
): ReadonlyMap<string, FaqEntry> {
  const index = new Map<string, FaqEntry>();
  for (const entry of entries) {
    const id = entry.data.faqId;
    if (index.has(id)) {
      throw new Error(`Duplicate FAQ id "${id}".`);
    }
    index.set(id, entry);
  }
  return index;
}

function entriesForGroup(
  spec: FaqGroupSpec,
  index: ReadonlyMap<string, FaqEntry>,
): readonly FaqEntry[] {
  return spec.questionIds.map((id) => {
    const entry = index.get(id);
    if (entry === undefined) {
      throw new Error(`FAQ group "${spec.id}" requires "${id}".`);
    }
    return entry;
  });
}

export function groupFaqs(
  entries: readonly FaqEntry[],
  locale: SupportedLocale,
): readonly FaqGroupView[] {
  const index = indexFaqs(entries);
  const knownIds = new Set(
    FAQ_GROUP_SPECS.flatMap(({ questionIds }) => questionIds),
  );
  const unknown = [...index.keys()].filter((id) => !knownIds.has(id));
  if (unknown.length > 0) {
    throw new Error(`FAQ group is missing for: ${unknown.join(", ")}.`);
  }

  return FAQ_GROUP_SPECS.map((spec) => ({
    entries: entriesForGroup(spec, index),
    id: spec.id,
    label: spec.label[locale],
  }));
}
