import type { SupportedLocale } from "@/config/site";

import type { LocalizedValue } from "./localization";

type NavigationKey =
  "products" | "compare" | "find" | "culture" | "faq" | "contact";

export type SiteCopy = Readonly<{
  age: string;
  addToCompare: string;
  allProducts: string;
  chooseSignal: string;
  closeMenu: string;
  compareIntro: string;
  conceptNote: string;
  contactIntro: string;
  cultureIntro: string;
  findIntro: string;
  fiveStates: string;
  footerLine: string;
  homeIntro: string;
  legal: string;
  market: string;
  materialIntro: string;
  menu: string;
  materialStudy: string;
  navigation: Readonly<Record<NavigationKey, string>>;
  next: string;
  openDetails: string;
  productInfo: string;
  productInfoUnavailable: string;
  productSystem: string;
  productTruth: string;
  previous: string;
  rangeIntro: string;
  rangeLabel: string;
  language: string;
  responsibleContinue: string;
  responsibleDetails: string;
  responsibleLeave: string;
  responsibleTitle: string;
  selected: string;
  skip: string;
  sourceRecord: string;
  verifiedPending: string;
  warning: string;
}>;

const values = {
  addToCompare: {
    en: "Add to comparison",
    ru: "Добавить к сравнению",
    uz: "Taqqoslashga qo‘shish",
  },
  age: {
    en: "18+ · Responsible information",
    ru: "18+ · Ответственная информация",
    uz: "18+ · Mas’uliyatli ma’lumot",
  },
  allProducts: {
    en: "All products",
    ru: "Все продукты",
    uz: "Barcha mahsulotlar",
  },
  chooseSignal: {
    en: "Choose your signal",
    ru: "Выберите свой сигнал",
    uz: "O‘z signalingizni tanlang",
  },
  closeMenu: {
    en: "Close menu",
    ru: "Закрыть меню",
    uz: "Menyuni yopish",
  },
  compareIntro: {
    en: "Put two cans side by side. Flavor direction, color, and character come into focus.",
    ru: "Поставьте две банки рядом. Вкус, цвет и характер сразу окажутся в фокусе.",
    uz: "Ikki bankani yonma-yon qo‘ying. Ta’m yo‘nalishi, rang va xarakter bir qarashda ko‘rinadi.",
  },
  conceptNote: {
    en: "Independent design concept created in Tashkent. It does not imply an official commission or operation by Gorilla.",
    ru: "Независимая дизайн-концепция, созданная в Ташкенте. Она не означает, что сайт заказан или управляется Gorilla.",
    uz: "Toshkentda yaratilgan mustaqil dizayn konsepti. U sayt Gorilla tomonidan buyurtma qilingan yoki boshqarilishini anglatmaydi.",
  },
  contactIntro: {
    en: "Choose the right official destination. This concept does not collect personal information.",
    ru: "Выберите подходящий официальный канал. Эта концепция не собирает персональные данные.",
    uz: "Tegishli rasmiy yo‘nalishni tanlang. Ushbu konsept shaxsiy ma’lumot yig‘maydi.",
  },
  cultureIntro: {
    en: "A Tashkent-made study of type, material, contrast, and five packaging signals.",
    ru: "Созданное в Ташкенте исследование типографики, материала, контраста и пяти сигналов упаковки.",
    uz: "Toshkentda yaratilgan tipografika, material, kontrast va beshta qadoq signali tadqiqoti.",
  },
  findIntro: {
    en: "Verified store addresses are not available yet. Use a clearly labelled third-party search and confirm availability with the retailer.",
    ru: "Подтверждённых адресов магазинов пока нет. Используйте явно обозначенный поиск третьей стороны и уточняйте наличие в магазине.",
    uz: "Tasdiqlangan do‘kon manzillari hozircha mavjud emas. Belgilangan uchinchi tomon qidiruvidan foydalaning va mavjudlikni savdo nuqtasidan aniqlashtiring.",
  },
  fiveStates: {
    en: "Five states. One instinct.",
    ru: "Пять состояний. Один инстинкт.",
    uz: "Besh holat. Bir instinkt.",
  },
  footerLine: {
    en: "Five signals become one line.",
    ru: "Пять сигналов сходятся в одну линию.",
    uz: "Beshta signal bitta chiziqqa aylanadi.",
  },
  homeIntro: {
    en: "Five flavors. Which one matches your rhythm today?",
    ru: "Пять вкусов. Какой совпадает с вашим ритмом сегодня?",
    uz: "Besh xil ta’m. Qaysi biri bugungi ritmingizga mos?",
  },
  legal: {
    en: "Legal",
    ru: "Правовая информация",
    uz: "Huquqiy ma’lumot",
  },
  language: {
    en: "Language",
    ru: "Язык",
    uz: "Til",
  },
  menu: { en: "Menu", ru: "Меню", uz: "Menyu" },
  market: {
    en: "Market",
    ru: "Рынок",
    uz: "Bozor",
  },
  materialStudy: {
    en: "Material study",
    ru: "Исследование материала",
    uz: "Material tadqiqoti",
  },
  materialIntro: {
    en: "One frame. Five characters. Aluminium, water, light, and the city after dark.",
    ru: "Один кадр. Пять характеров. Алюминий, вода, свет и город после заката.",
    uz: "Bir kadr. Besh xarakter. Alyuminiy, suv, yorug‘lik va tungi shahar.",
  },
  next: { en: "Next signal", ru: "Следующий сигнал", uz: "Keyingi signal" },
  openDetails: {
    en: "Open product",
    ru: "Открыть продукт",
    uz: "Mahsulotni ochish",
  },
  productInfo: {
    en: "Product information",
    ru: "Информация о продукте",
    uz: "Mahsulot ma’lumoti",
  },
  productInfoUnavailable: {
    en: "Numeric nutrition details are intentionally omitted until they can be verified against current packaging.",
    ru: "Числовые данные о пищевой ценности намеренно не публикуются до сверки с актуальной упаковкой.",
    uz: "Raqamli ozuqaviy ma’lumotlar joriy qadoq bilan tekshirilmaguncha ataylab ko‘rsatilmaydi.",
  },
  productSystem: {
    en: "Product system",
    ru: "Система продуктов",
    uz: "Mahsulot tizimi",
  },
  productTruth: {
    en: "Product truth",
    ru: "Достоверность продукта",
    uz: "Mahsulot haqiqati",
  },
  previous: {
    en: "Previous signal",
    ru: "Предыдущий сигнал",
    uz: "Oldingi signal",
  },
  rangeIntro: {
    en: "From Original to Lychee Pear—each has its own character and color.",
    ru: "От Original до Lychee Pear — у каждого свой характер и свой цвет.",
    uz: "Originaldan Lychee Pear’gacha — har biri boshqa xarakter, har biri o‘z rangida.",
  },
  rangeLabel: {
    en: "Range",
    ru: "Линейка",
    uz: "Qator",
  },
  responsibleContinue: {
    en: "I am 18 or older",
    ru: "Мне уже исполнилось 18",
    uz: "18 yoshga to‘lganman",
  },
  responsibleDetails: {
    en: "Read product information",
    ru: "Информация о продукте",
    uz: "Mahsulot ma’lumotini o‘qish",
  },
  responsibleLeave: {
    en: "Leave site",
    ru: "Покинуть сайт",
    uz: "Saytdan chiqish",
  },
  responsibleTitle: {
    en: "Energy, with context",
    ru: "Энергия — ответственно",
    uz: "Energiya — mas’uliyat bilan",
  },
  selected: {
    en: "Selected",
    ru: "Выбрано",
    uz: "Tanlandi",
  },
  skip: {
    en: "Skip to content",
    ru: "Перейти к содержимому",
    uz: "Asosiy mazmunga o‘tish",
  },
  sourceRecord: {
    en: "Source record",
    ru: "Запись источника",
    uz: "Manba yozuvi",
  },
  verifiedPending: {
    en: "Not yet verified",
    ru: "Пока не подтверждено",
    uz: "Hali tasdiqlanmagan",
  },
  warning: {
    en: "Responsible-use warning",
    ru: "Предупреждение об ответственном употреблении",
    uz: "Mas’uliyatli iste’mol ogohlantirishi",
  },
} satisfies Readonly<Record<string, LocalizedValue>>;

const navigation = {
  compare: { en: "Compare", ru: "Сравнить", uz: "Taqqoslash" },
  contact: { en: "Contact", ru: "Контакты", uz: "Bog‘lanish" },
  culture: { en: "Culture", ru: "Культура", uz: "Madaniyat" },
  faq: { en: "FAQ", ru: "Вопросы", uz: "Savollar" },
  find: { en: "Find Gorilla", ru: "Где искать", uz: "Qayerdan izlash" },
  products: { en: "Products", ru: "Продукты", uz: "Mahsulotlar" },
} satisfies Readonly<Record<NavigationKey, LocalizedValue>>;

export function getSiteCopy(locale: SupportedLocale): SiteCopy {
  return {
    age: values.age[locale],
    addToCompare: values.addToCompare[locale],
    allProducts: values.allProducts[locale],
    chooseSignal: values.chooseSignal[locale],
    closeMenu: values.closeMenu[locale],
    compareIntro: values.compareIntro[locale],
    conceptNote: values.conceptNote[locale],
    contactIntro: values.contactIntro[locale],
    cultureIntro: values.cultureIntro[locale],
    findIntro: values.findIntro[locale],
    fiveStates: values.fiveStates[locale],
    footerLine: values.footerLine[locale],
    homeIntro: values.homeIntro[locale],
    legal: values.legal[locale],
    market: values.market[locale],
    materialIntro: values.materialIntro[locale],
    menu: values.menu[locale],
    materialStudy: values.materialStudy[locale],
    navigation: {
      compare: navigation.compare[locale],
      contact: navigation.contact[locale],
      culture: navigation.culture[locale],
      faq: navigation.faq[locale],
      find: navigation.find[locale],
      products: navigation.products[locale],
    },
    next: values.next[locale],
    openDetails: values.openDetails[locale],
    productInfo: values.productInfo[locale],
    productInfoUnavailable: values.productInfoUnavailable[locale],
    productSystem: values.productSystem[locale],
    productTruth: values.productTruth[locale],
    previous: values.previous[locale],
    rangeIntro: values.rangeIntro[locale],
    rangeLabel: values.rangeLabel[locale],
    language: values.language[locale],
    responsibleContinue: values.responsibleContinue[locale],
    responsibleDetails: values.responsibleDetails[locale],
    responsibleLeave: values.responsibleLeave[locale],
    responsibleTitle: values.responsibleTitle[locale],
    selected: values.selected[locale],
    skip: values.skip[locale],
    sourceRecord: values.sourceRecord[locale],
    verifiedPending: values.verifiedPending[locale],
    warning: values.warning[locale],
  };
}
