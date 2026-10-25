import type { SupportedLocale } from "@/config/site";

export const LOCATOR_INSTAGRAM_URL =
  "https://www.instagram.com/gorillaenergy.uz";
export const LOCATOR_YANDEX_URL =
  "https://yandex.uz/maps/10335/tashkent/search/Gorilla%20Energy/";

const LOCATOR_COPY = {
  en: {
    city: "City",
    contact: "Contact",
    context: "Map search in Tashkent",
    eyebrow: "Gorilla in Tashkent",
    google: "Search Google Maps",
    instagram: "Official Uzbekistan Instagram",
    notice:
      "A verified store list is not available yet. Map results come from third parties and may change; confirm availability with the retailer.",
    product: "Product",
    title: "Where to find Gorilla",
    yandex: "Search Yandex Maps",
  },
  ru: {
    city: "Город",
    contact: "Контакты",
    context: "Поиск на карте Ташкента",
    eyebrow: "Gorilla в Ташкенте",
    google: "Искать в Google Картах",
    instagram: "Официальный Instagram Узбекистана",
    notice:
      "Подтверждённого списка точек продаж пока нет. Карты показывают данные третьих сторон, которые могут меняться; уточняйте наличие в магазине.",
    product: "Продукт",
    title: "Где купить Gorilla",
    yandex: "Искать в Яндекс Картах",
  },
  uz: {
    city: "Shahar",
    contact: "Bog‘lanish",
    context: "Toshkent xaritasida qidirish",
    eyebrow: "Gorilla Toshkentda",
    google: "Google Xaritalarda qidirish",
    instagram: "O‘zbekiston rasmiy Instagram sahifasi",
    notice:
      "Tasdiqlangan savdo nuqtalari ro‘yxati hozircha mavjud emas. Xarita natijalari uchinchi tomonlardan olinadi va o‘zgarishi mumkin; mavjudlikni savdo nuqtasidan aniqlashtiring.",
    product: "Mahsulot",
    title: "Gorilla qayerdan sotib olinadi",
    yandex: "Yandex Xaritalarda qidirish",
  },
} as const;

/** Returns the approved locator interface copy for one supported locale. */
export function getLocatorCopy(locale: SupportedLocale) {
  return LOCATOR_COPY[locale];
}
