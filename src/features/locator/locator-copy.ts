import type { SupportedLocale } from "@/config/site";

export const LOCATOR_INSTAGRAM_URL =
  "https://www.instagram.com/gorillaenergy.uz";
export const LOCATOR_YANDEX_URL =
  "https://yandex.uz/maps/10335/tashkent/search/Gorilla%20Energy/";

const LOCATOR_COPY = {
  en: {
    city: "City",
    contact: "Contact",
    context: "Search context only — not a store location",
    eyebrow: "Tashkent / Search handoff",
    google: "Search Google Maps",
    instagram: "Official Uzbekistan Instagram",
    notice:
      "A verified store list is not available yet. Map results come from third parties and may change; confirm availability with the retailer.",
    product: "Product",
    source: "Source checked",
    title: "Choose a transparent search route",
    yandex: "Search Yandex Maps",
  },
  ru: {
    city: "Город",
    contact: "Контакты",
    context: "Только область поиска — не адрес магазина",
    eyebrow: "Ташкент / Переход к поиску",
    google: "Искать в Google Картах",
    instagram: "Официальный Instagram Узбекистана",
    notice:
      "Подтверждённого списка точек продаж пока нет. Карты показывают данные третьих сторон, которые могут меняться; уточняйте наличие в магазине.",
    product: "Продукт",
    source: "Источник проверен",
    title: "Выберите прозрачный способ поиска",
    yandex: "Искать в Яндекс Картах",
  },
  uz: {
    city: "Shahar",
    contact: "Bog‘lanish",
    context: "Faqat qidiruv hududi — do‘kon manzili emas",
    eyebrow: "Toshkent / Qidiruvga o‘tish",
    google: "Google Xaritalarda qidirish",
    instagram: "O‘zbekiston rasmiy Instagram sahifasi",
    notice:
      "Tasdiqlangan savdo nuqtalari ro‘yxati hozircha mavjud emas. Xarita natijalari uchinchi tomonlardan olinadi va o‘zgarishi mumkin; mavjudlikni savdo nuqtasidan aniqlashtiring.",
    product: "Mahsulot",
    source: "Manba tekshirildi",
    title: "Ochiq qidiruv yo‘lini tanlang",
    yandex: "Yandex Xaritalarda qidirish",
  },
} as const;

/** Returns the approved locator interface copy for one supported locale. */
export function getLocatorCopy(locale: SupportedLocale) {
  return LOCATOR_COPY[locale];
}
