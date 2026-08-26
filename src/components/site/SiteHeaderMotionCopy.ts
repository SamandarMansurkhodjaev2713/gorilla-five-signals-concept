import type { SupportedLocale } from "@/config/site";
import type { UserMotionPreference } from "@/motion/capability-policy";

export const MOTION_PREFERENCES = [
  "system",
  "full",
  "lite",
  "reduced",
] as const satisfies readonly UserMotionPreference[];

interface MotionChromeCopy {
  readonly description: string;
  readonly entryDescription: string;
  readonly menuDescription: string;
  readonly preferenceLabels: Readonly<Record<UserMotionPreference, string>>;
  readonly resume: string;
  readonly status: string;
  readonly title: string;
  readonly toggle: string;
}

const MOTION_COPY = {
  en: {
    description:
      "System follows your device. Full keeps the directed experience; Lite reduces movement; Reduced removes spatial motion.",
    entryDescription:
      "Choose the intensity before entering. System respects your device settings.",
    menuDescription: "Set the intensity for this experience.",
    preferenceLabels: {
      full: "Full",
      lite: "Lite",
      reduced: "Reduced",
      system: "System",
    },
    resume: "Resume motion",
    status: "Motion",
    title: "Experience mode",
    toggle: "Pause motion",
  },
  ru: {
    description:
      "Системный режим учитывает настройки устройства. Полный сохраняет режиссуру, лёгкий уменьшает движение, а статичный убирает пространственную анимацию.",
    entryDescription:
      "Выберите интенсивность до входа. Системный режим учитывает настройки устройства.",
    menuDescription: "Настройте интенсивность этого опыта.",
    preferenceLabels: {
      full: "Полный",
      lite: "Лёгкий",
      reduced: "Статично",
      system: "Система",
    },
    resume: "Возобновить анимацию",
    status: "Motion",
    title: "Режим движения",
    toggle: "Остановить анимацию",
  },
  uz: {
    description:
      "Tizim qurilma sozlamalariga amal qiladi. To‘liq rejim sahnalashtirishni saqlaydi, Yengil harakatni kamaytiradi, Harakatsiz esa fazoviy animatsiyani o‘chiradi.",
    entryDescription:
      "Kirishdan oldin intensivlikni tanlang. Tizim qurilma sozlamalariga amal qiladi.",
    menuDescription: "Ushbu tajriba intensivligini tanlang.",
    preferenceLabels: {
      full: "To‘liq",
      lite: "Yengil",
      reduced: "Harakatsiz",
      system: "Tizim",
    },
    resume: "Harakatni davom ettirish",
    status: "Motion",
    title: "Harakat rejimi",
    toggle: "Harakatni to‘xtatish",
  },
} as const satisfies Record<SupportedLocale, MotionChromeCopy>;

export function getMotionChromeCopy(locale: SupportedLocale): MotionChromeCopy {
  return MOTION_COPY[locale];
}
