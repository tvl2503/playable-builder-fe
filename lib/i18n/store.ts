import { create } from "zustand";
import type { Locale } from "./types";

/** Phải khớp key mà inline script ở app/layout.tsx đọc lúc chống flash (xem lib/theme/store.ts cho pattern tương tự). */
const STORAGE_KEY = "playable_locale";

function readStoredLocale(): Locale | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === "en" || stored === "vi" ? stored : null;
  } catch {
    return null;
  }
}

interface LocaleState {
  locale: Locale;
  /** Đồng bộ lại state React với localStorage lúc mount (xem components/Providers.tsx). */
  initialize: () => void;
  setLocale: (locale: Locale) => void;
}

export const useLocaleStore = create<LocaleState>((set) => ({
  // Mặc định tiếng Anh — chỉ đổi khi user tự bấm chọn trước đó (lưu lại trong localStorage).
  locale: "en",
  initialize: () => {
    const locale = readStoredLocale();
    if (locale) set({ locale });
  },
  setLocale: (locale) => {
    try {
      localStorage.setItem(STORAGE_KEY, locale);
    } catch {
      // private mode / storage bị chặn -> chỉ áp dụng cho phiên hiện tại, không lưu lại
    }
    set({ locale });
  },
}));
