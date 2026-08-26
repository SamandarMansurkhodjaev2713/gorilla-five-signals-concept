# Uzbekistan product claim truth table

- Version: 1.0
- Verified: 2026-07-26
- Market: UZ only
- Release rule: package/certificate evidence overrides the website API

## Publication statuses

| Status | UI behavior |
|---|---|
| `publishable` | May be used in the current concept with its source ID. |
| `conditional` | May exist in internal data but must not render until the named evidence arrives. |
| `quarantined` | Must not render as a product fact. |
| `editorial` | Original campaign language; never represented as a physiological or factual claim. |

## Inventory and naming

| Claim ID | Fact | Evidence | Status | Notes |
|---|---|---|---|---|
| CLM-RANGE-COUNT | The official Uzbekistan API currently exposes five published energy-drink products. | SRC-GORILLA-UZ-PRODUCTS-UZ-001 | `publishable` | Snapshot fact, revalidate at release. |
| CLM-ORIGINAL-NAME | `Asl` / `Оригинал` / `Original` | UZ/RU/EN product APIs, code `original`, ID 1 | `publishable` | Locale-specific display names. |
| CLM-ZERO-NAME | `Shakarsiz` / `ZERO` / `ZERO` | UZ/RU/EN product APIs, code `sugar`, ID 11 | `publishable` | Product name is publishable; numeric nutrition is not. |
| CLM-EXTRA-NAME | `EXTRA` in all locales | UZ/RU/EN product APIs, code `extra`, ID 12 | `publishable` | Preserve brand casing. |
| CLM-MANGO-NAME | `Mango-Kokos` / `Манго — Кокос` / `Mango–Coconut` | UZ/RU/EN product APIs, code `mango`, ID 7 | `publishable` | Typographic punctuation is localized, meaning is unchanged. |
| CLM-LYCHEE-NAME | `Lichi-Nok` / `Личи — груша` / `Lychee–Pear` | Product code `lychee`, ID 10; RU and composition fields explicitly include pear | `publishable` | English API name says only “Lychee”; product composition and description say lychee and pear. Use `Lychee–Pear` in editorial navigation, while preserving the official English API label in audit metadata. |

## Composition and nutrition

| Claim ID | SKU | Claim | Cross-locale evidence | Status | Release requirement |
|---|---|---|---|---|---|
| CLM-ORIGINAL-CAFFEINE | Original | Caffeine no more than 32 mg per 100 ml | Consistent in UZ/RU/EN API | `conditional` | Current package/certificate |
| CLM-MANGO-CAFFEINE | Mango–Coconut | Caffeine no more than 30 mg per 100 ml | Consistent in UZ/RU/EN API | `conditional` | Current package/certificate |
| CLM-ZERO-CAFFEINE | ZERO | Caffeine no more than 30 mg per 100 ml | Consistent in UZ/RU/EN API | `conditional` | Current package/certificate |
| CLM-LYCHEE-CAFFEINE | Lychee–Pear | Caffeine no more than 30 mg per 100 ml | Consistent in UZ/RU/EN API | `conditional` | Current package/certificate |
| CLM-EXTRA-CAFFEINE | EXTRA | “Maximum caffeine” | API provides no amount or comparison reference | `quarantined` | Exact package value and lawful wording |
| CLM-ZERO-SUGAR | ZERO | Sugar-free / 0% sugar | Name and composition agree, but Uzbek nutrition contradicts RU/EN | `conditional` | Current package/certificate resolves the contradiction |
| CLM-MANGO-PUREE | Mango–Coconut | Contains mango purée | Consistent composition field in UZ/RU/EN API | `conditional` | Current package ingredient panel |
| CLM-LYCHEE-FLAVOR | Lychee–Pear | Natural lychee and pear aroma/flavor | Consistent composition meaning in UZ/RU/EN API | `conditional` | Current package ingredient panel |
| CLM-EXTRA-TAURINE | EXTRA | Seven times more taurine | Consistent API wording but comparison baseline is not defined | `quarantined` | Exact quantities and named baseline |
| CLM-EXTRA-CARNITINE | EXTRA | Three times more L-carnitine | Consistent API wording but comparison baseline is not defined | `quarantined` | Exact quantities and named baseline |
| CLM-VITAMINS-* | All | Vitamin amounts and daily percentages | API contains likely unit corruption (`mg` where source may mean `µg`) | `quarantined` | Current certified nutrition panel |
| CLM-VOLUME-* | All | Can volume | Not present in the product API | `quarantined` | Current can/package record |

## Critical contradiction: ZERO

The same official local API returned these values on 2026-07-26:

| Locale | Energy per 100 ml | Carbohydrates per 100 ml |
|---|---:|---:|
| Uzbek | 230 kJ / 54 kcal | 13.5 g |
| Russian | 12 kJ / 3 kcal | 0.1 g |
| English | 12 kJ / 3 kcal | 0.1 g |

The Uzbek values contradict both the product name/composition and the other two
locales. No application code may “choose the plausible row.” The entire ZERO
nutrition table remains `quarantined` until package/certificate evidence resolves
it.

## Editorial language: allowed and prohibited

### Allowed as original creative framing

These lines describe the site system or sensory design, not a product effect:

- `Besh xil. Bir signal.`
- `Beshta mahsulotni bir joyda ko‘ring.`
- `Ta’m va tarkib bo‘yicha tanlang.`
- `Five products. One signal.`
- `Choose by flavour and verified product information.`

They have status `editorial` and must not sit visually beside imagery that turns
them into an implied physical, mental, social, or sporting-performance promise.

### Prohibited until separately approved

- “more power,” “maximum energy,” “focus,” “performance,” or “stamina” claims;
- any “before/after” state;
- “no crash,” “healthy,” “safe,” or medical language;
- claims that a product improves mood, cognition, sport, work, nightlife, or
  social success;
- comparative numbers without an explicit, verified baseline;
- claims that product availability or stock is live without a retailer feed.

## UI fallback contract

When a claim is not publishable:

- omit the fact row instead of replacing it with a guessed value;
- never show `0`, `—`, or `N/A` when those marks could be read as product data;
- use the localized sentence “Check the current can label for complete product
  information” only as navigation guidance, not as a substitute warning;
- keep the required warning visible using counsel-approved copy;
- provide a contact route for product-information questions.
