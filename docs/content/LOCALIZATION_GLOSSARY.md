# Localization glossary and style guide

- Version: 1.0
- Source locale: Uzbek Latin
- Review order: Uzbek editor → Russian editor → English editor → legal parity

## Brand and product terms

| Semantic ID | Uzbek | Russian | English | Rule |
|---|---|---|---|---|
| `brand` | Gorilla Energy | Gorilla Energy | Gorilla Energy | Never translate. |
| `original` | Asl | Оригинал | Original | UI label from current local API. |
| `zero` | Shakarsiz | ZERO | ZERO | Preserve official locale label. |
| `extra` | EXTRA | EXTRA | EXTRA | Uppercase. |
| `mangoCoconut` | Mango–Kokos | Манго — Кокос | Mango–Coconut | En dash in UZ/EN; spaced em dash in RU. |
| `lycheePear` | Lichi–Nok | Личи — груша | Lychee–Pear | English editorial label includes pear because product composition and description do. |
| `energyDrink` | energetik ichimlik | энергетический напиток | energy drink | Use in legal/product context, not as a hype adjective. |
| `range` | mahsulotlar qatori | линейка продуктов | product range | Prefer over slang. |
| `flavour` | ta’m yo‘nalishi | вкусовое направление | flavour direction | Avoid calling unverified ingredients “natural”. |
| `ingredients` | tarkibi | состав | ingredients | Package-level fact. |
| `nutrition` | ozuqaviy qiymati | пищевая ценность | nutrition | Package-level fact. |
| `caffeine` | kofein | кофеин | caffeine | Always pair a numeric value with `mg` and `100 ml`. |
| `sugarFree` | shakarsiz | без сахара | sugar-free | Conditional product claim until package verification. |
| `verified` | tasdiqlangan | подтверждённый | verified | Means source-linked, not merely plausible. |
| `availability` | mavjudlik | наличие | availability | Never imply live stock without a feed. |

## Navigation terms

| Semantic ID | Uzbek | Russian | English |
|---|---|---|---|
| `products` | Mahsulotlar | Продукты | Products |
| `compare` | Solishtirish | Сравнить | Compare |
| `find` | Qayerdan izlash | Где искать | Find |
| `culture` | Madaniyat | Культура | Culture |
| `faq` | Savollar | Вопросы | FAQ |
| `contact` | Bog‘lanish | Контакты | Contact |

## Uzbek orthography

- Use Uzbek Latin, not Cyrillic.
- Use typographic modifier apostrophe consistently: `O‘zbekiston`, `o‘z`,
  `g‘`, `to‘liq`.
- Never mix Russian UI strings into Uzbek routes.
- Use sentence case for UI; display headlines may be uppercase visually through
  CSS, not duplicated as separate content.
- Keep line breaks out of content data. Composition owns wrapping.
- Use `ml`, `mg`, `kJ`, and `kcal` only when the underlying fact is approved.
- Decimal separator in Uzbek and Russian is a comma; English uses a point.
- A non-breaking space belongs between a number and its unit in rendered text.

## Russian style

- Use `ё` where required for clarity (`подтверждённый`).
- Avoid unnecessary English slang.
- Use `вы` in neutral lower case unless beginning a sentence.
- Prefer direct instructions over noun-heavy bureaucratic phrases.
- Product names preserve their official brand casing.

## English style

- Use British spelling for interface copy: `flavour`, `organisation`.
- Use sentence case.
- Avoid “boost,” “power,” “performance,” “focus,” and other effect language
  unless an approved claim explicitly requires it.
- `Find` means a search handoff, not a verified in-stock store locator.

## Prohibited drift

Do not translate the signal concept into biological or performance language:

| Avoid | Why |
|---|---|
| `energiya darajasi`, `уровень энергии`, `energy level` | Implies a product-caused physiological state. |
| `kuchliroq`, `мощнее`, `stronger` | Comparative claim without a baseline. |
| `fokus`, `концентрация`, `focus` | Cognitive benefit claim. |
| `tun bo‘yi`, `всю ночь`, `all night` | Duration/performance implication. |
| `siz uchun xavfsiz`, `безопасно для вас`, `safe for you` | Unverified safety claim. |

## Parity gate

Every localized record must have:

- the same semantic ID;
- the same CTA destination;
- the same factual scope and warning prominence;
- a product name mapped by this glossary;
- no extra claim introduced during translation;
- date/number/unit formatting appropriate to the locale;
- editorial and legal reviewer status.

English stays disabled if any English route, warning, metadata field, alt text,
validation message, or error state is missing.
