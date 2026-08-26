# Locator data and outbound policy

- Version: 1.0
- Verified: 2026-07-26
- Market: Uzbekistan

## Current verified data

The official Gorilla cities API contains one Uzbekistan record:

| ID | City | Coordinates | Updated | Source |
|---:|---|---|---|---|
| 36 | Tashkent | `41.2994958, 69.2400734` | 2020-10-15 | SRC-GORILLA-UZ-CITIES-001 |

Its description says that information is unavailable for the region. It does
not contain a retailer, branch, stock status, address, or opening hours.

Therefore:

- no pin may be styled as a store;
- no retailer card may be generated from the city center;
- no “available now,” “nearest,” “open,” or distance claim may appear;
- geolocation is unnecessary in v1;
- the accessible list remains primary even after retailer data arrives.

## Safe phase-A experience

The route is a transparent search handoff, not a live store locator.

1. The visitor selects Tashkent.
2. The UI states that verified store addresses are not yet available.
3. The visitor may open a clearly labelled live third-party map search.
4. The UI states that third-party results and availability may change.
5. A product-information/contact route remains available.

### Outbound templates

These URLs initiate a third-party search; they do not assert that any result is
an authorized retailer.

| Provider | Destination | Label |
|---|---|---|
| Google Maps | <https://www.google.com/maps/search/?api=1&query=Gorilla%20Energy%20Tashkent> | Search Google Maps |
| Yandex Maps | <https://yandex.uz/maps/10335/tashkent/search/Gorilla%20Energy/> | Search Yandex Maps |
| Official Instagram | <https://www.instagram.com/gorillaenergy.uz> | Open the official Uzbekistan Instagram account |

The implementation must add `rel="noopener noreferrer"` to external links and
must not append precise coordinates or personal data to analytics.

## Phase-B retailer contract

A verified retailer record must have:

```text
stable retailer ID
display name in every enabled locale
full address in every enabled locale
city/area
latitude and longitude
source ID
source updated timestamp
record verified timestamp
availability wording supplied by the source
outbound URL with a verified HTTPS host
status: active | temporarily-unavailable | archived
```

Opening hours, stock, price, distance, and “authorized” status are separate
claims and require separate source fields. The feed must be bounded, cached with
a freshness timestamp, schema-validated, and fall back to the phase-A experience
on timeout or invalid data.

## Localized state copy

| State | Uzbek | Russian | English |
|---|---|---|---|
| Phase-A notice | Tasdiqlangan savdo nuqtalari ro‘yxati hozircha mavjud emas. Xarita qidiruvi uchinchi tomon natijalarini ko‘rsatadi; mavjudlikni joyning o‘zida tekshiring. | Подтверждённого списка точек продаж пока нет. Поиск на карте показывает результаты третьей стороны; уточняйте наличие непосредственно в магазине. | A verified store list is not available yet. Map search results come from a third party; check availability with the store. |
| No result | Bu hudud bo‘yicha tasdiqlangan savdo nuqtasi topilmadi. | Для этого района нет подтверждённых точек продаж. | No verified store has been found for this area. |
| Error | Qidiruvni hozir ochib bo‘lmadi. Keyinroq urinib ko‘ring yoki bog‘lanish sahifasiga o‘ting. | Сейчас не удалось открыть поиск. Повторите попытку позже или перейдите на страницу контактов. | Search could not be opened. Try again later or go to Contact. |
| Stale data | Ma’lumotlar {date} sanasida tekshirilgan. Yo‘lga chiqishdan oldin mavjudlikni aniqlashtiring. | Данные проверены {date}. Уточните наличие перед поездкой. | Data was verified on {date}. Check availability before travelling. |
