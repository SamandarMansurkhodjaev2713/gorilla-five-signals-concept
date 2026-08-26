# Content source registry

- Registry version: 1.0
- Last verified: 2026-07-26
- Market: Uzbekistan (`UZ`)
- Source locale policy: Uzbek Latin first, Russian and English parity
- Owner: product/content/localization

## Status vocabulary

| Status | Meaning |
|---|---|
| `primary-current` | A current first-party or government source suitable for factual research. |
| `primary-stale` | A first-party source whose record is old enough to require fresh confirmation. |
| `supporting` | Useful context, but not sufficient by itself for a product claim. |
| `quarantined` | Internally inconsistent, incomplete, or unsafe to publish without stronger evidence. |
| `superseded` | Retained for audit history but not used in current content. |

An official API response is evidence of what the official website currently
publishes. It is not automatically evidence that packaging, certification, or
legal wording is current. Packaging and signed brand truth remain the release
authority for regulated product facts.

## Primary sources

### SRC-GORILLA-UZ-WEB-001

| Field | Value |
|---|---|
| Status | `primary-current` |
| Publisher | Gorilla Energy Uzbekistan |
| URL | <https://www.gorillaenergy.uz/> |
| Market | UZ |
| Locales observed | `uz`, `ru`, `en` |
| Retrieved | 2026-07-26 |
| Used for | Current public navigation, company footer, official social routing, public product presentation |
| Limitations | Client-rendered; product and FAQ truth arrives from the API below; the website itself does not prove package-level accuracy |

### SRC-GORILLA-UZ-PRODUCTS-UZ-001

| Field | Value |
|---|---|
| Status | `primary-current`, with quarantined fields listed in the truth table |
| Publisher | Gorilla Energy official API |
| URL | <https://core.gorillaenergy.com/api/products?page%5Ball%5D=1&filter%5Bpublish%5D=1&filter%5Bsite_version%5D=9> |
| Request header | `Accept-Language: uz` |
| Retrieved | 2026-07-26 |
| HTTP | 200 |
| Response bytes | 18,539 |
| SHA-256 | `e602cd32912310b1580ae4ab843aa28c4b6db0eef059ddc4ed77910fcd529caf` |
| Used for | Uzbek names, local five-SKU inventory, descriptions, composition and nutrition research |

### SRC-GORILLA-UZ-PRODUCTS-RU-001

| Field | Value |
|---|---|
| Status | `primary-current`, with quarantined fields listed in the truth table |
| Publisher | Gorilla Energy official API |
| URL | <https://core.gorillaenergy.com/api/products?page%5Ball%5D=1&filter%5Bpublish%5D=1&filter%5Bsite_version%5D=9> |
| Request header | `Accept-Language: ru` |
| Retrieved | 2026-07-26 |
| HTTP | 200 |
| Response bytes | 29,041 |
| SHA-256 | `ab4e6652846a7f25f8c1e5cc074bf07d4fd5b3c1df7a18b93199fe0a279e64c0` |
| Used for | Russian names and parity checking |

### SRC-GORILLA-UZ-PRODUCTS-EN-001

| Field | Value |
|---|---|
| Status | `primary-current`, with quarantined fields listed in the truth table |
| Publisher | Gorilla Energy official API |
| URL | <https://core.gorillaenergy.com/api/products?page%5Ball%5D=1&filter%5Bpublish%5D=1&filter%5Bsite_version%5D=9> |
| Request header | `Accept-Language: en` |
| Retrieved | 2026-07-26 |
| HTTP | 200 |
| Response bytes | 19,649 |
| SHA-256 | `807ce64658693d4d925d1fba4cd3f49d624d35662a82c7659f47c2ce843fad1f` |
| Used for | English names and parity checking |

### SRC-GORILLA-UZ-FAQ-001

The endpoint currently returns a global list. Only published records whose
`site_versions` contain the Uzbekistan site-version ID `9` are in scope.

| Locale/header | HTTP | Response bytes | SHA-256 |
|---|---:|---:|---|
| `uz` | 200 | 45,238 | `9a0d87d68865c5f0765b06c72d676583ff9f32baa0cf844f4c6e084c97b149c5` |
| `ru` | 200 | 59,112 | `61d63ecc8bb2c0d9fa20a996f4b93f06fb37c301d82c7d958579c3403cd969e8` |
| `en` | 200 | 44,351 | `10c0c17dd4057346af9169b46eab8191ed4a19519d34d09b7afad6140f62b4d4` |

- URL: <https://core.gorillaenergy.com/api/faqs>
- Retrieved: 2026-07-26
- Uzbekistan result: 9 published entries in every locale.
- Used for: production/expiry location, age threshold for sponsorship, logo
  trademark status, and contact routing.
- Limitation: most entries were last updated in February 2024; they are not a
  source for nutrition or current campaign offers.

### SRC-GORILLA-UZ-CITIES-001

| Field | Value |
|---|---|
| Status | `primary-stale` |
| Publisher | Gorilla Energy official API |
| URL | <https://core.gorillaenergy.com/api/cities?page%5Ball%5D=1> |
| Request header | `Accept-Language: uz` |
| Retrieved | 2026-07-26 |
| HTTP | 200 |
| SHA-256 | `76adb45cf645a0d8fa3fa0b8d0f1cb0f2a3b4a6176f59b263d572b4e40ffeed0` |
| Uzbekistan records | One: Tashkent, coordinates `41.2994958, 69.2400734` |
| Record updated | 2020-10-15 |
| Limitation | The record explicitly says regional information is unavailable and contains no retailer/store addresses |

This source proves only that the official API recognizes Tashkent as an
Uzbekistan city entry. It does not prove availability at any retailer.

### SRC-GORILLA-UZ-SOCIAL-001

| Field | Value |
|---|---|
| Status | `primary-stale` |
| Publisher | Gorilla Energy official API and official website bundle |
| API URL | <https://core.gorillaenergy.com/api/socials?page%5Ball%5D=1> |
| Retrieved | 2026-07-26 |
| Uzbekistan API records | 10 Instagram post/reel URLs, last updated 2024-01-30 |
| Official account URL observed in current site bundle | <https://www.instagram.com/gorillaenergy.uz> |
| Limitation | Individual posts are stale campaign material and are not part of the launch copy deck |

Only the official account destination is retained as an outbound link. No
individual post is embedded or represented as current.

### SRC-UZ-ADS-COMMITTEE-001

| Field | Value |
|---|---|
| Status | `primary-current` |
| Publisher | Competition Promotion and Consumer Protection Committee of Uzbekistan |
| URL | <https://raqobat.gov.uz/uz/istemolchidan-savol-3/> |
| Retrieved | 2026-07-26 |
| Used for | Energy-drink advertising restrictions and warning-content requirement |

The source says every energy-drink advertisement must contain information about
the harm of excessive consumption and about people for whom consumption is not
recommended. It also describes restrictions concerning consumption depictions,
successful athletes, implied social/sport/physical/mental benefits, and minors.

### SRC-UZ-GOV-ADS-001

| Field | Value |
|---|---|
| Status | `supporting` |
| Publisher | Government portal of Uzbekistan |
| URL | <https://gov.uz/oz/advice/74/document/1286> |
| Retrieved | 2026-07-26 |
| Used for | Supporting overview of advertising and certification requirements |

### SRC-UZ-GORILLA-ENFORCEMENT-001

| Field | Value |
|---|---|
| Status | `supporting` |
| Publisher | Competition Promotion and Consumer Protection Committee of Uzbekistan |
| URL | <https://raqobat.gov.uz/gorilla-energetik-ichimligi-reklamasini-keng-targib-qilgan-aion-beverages-mchjga-nisbatan-reklama-qonunchiligi-buzilishi-yuzasidan-tegishli-tasir-choralari-korildi/> |
| Retrieved | 2026-07-26 |
| Used for | Brand-specific compliance risk context |

### SRC-OWNER-LEGAL-WARNING-001

| Field | Value |
|---|---|
| Status | `primary-current`, owner/legal approved |
| Authority | Project owner and their legal team |
| Evidence | `docs/release/APPROVAL_REGISTER.md` |
| Grounding source | SRC-UZ-ADS-COMMITTEE-001 |
| Approved | 2026-07-26 |
| Used for | Conservative responsible-use warning in UZ/RU/EN |

Approved source wording:

- UZ: `Energetik ichimliklarni haddan ziyod iste’mol qilish zararli.
  Iste’mol qilish tavsiya etilmaydigan shaxslar haqidagi ma’lumotni mahsulot
  qadoqlaridan tekshiring.`
- RU: `Чрезмерное употребление энергетических напитков вредно. Проверьте на
  упаковке информацию о лицах, которым употребление не рекомендуется.`
- EN: `Excessive consumption of energy drinks is harmful. Check the packaging
  for information about people for whom consumption is not recommended.`

## Required but not yet present in the repository

The user has confirmed that usage permissions exist and that legal handling is
external. The following factual release evidence still needs a stable source
record or checksum before regulated copy can be marked `release-approved`:

| Required record | Why it remains necessary |
|---|---|
| Current front/back/bottom photography of every Uzbekistan can | Resolves formula, units, warnings, volume, manufacturer/importer, and date placement |
| Current certificate or signed product truth sheet | Resolves contradictory API nutrition data |
| Warning placement matrix | Warning copy is owner/legal approved; final placement still requires screenshot review on every independently shareable context |
| Approved retailer feed or signed store list | The current official API contains no Uzbekistan retailer addresses |
| Signed contact routing sheet | Prevents publishing a non-owned or obsolete inbox/phone number |

Until those records exist, the production content layer must render only claims
marked `publishable` in `CLAIM_TRUTH_TABLE.md` and must use the locator's honest
empty/search state.
