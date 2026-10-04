import { create } from "zustand";

export type Theme = "light" | "dark";

/** Phải khớp key mà inline script ở app/layout.tsx đọc lúc chống flash. */
const STORAGE_KEY = "playable_theme";

function systemTheme(): Theme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function readStoredTheme(): Theme | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === "dark" || stored === "light" ? stored : null;
  } catch {
    return null;
  }
}

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // private mode / storage bị chặn -> chỉ áp dụng cho phiên hiện tại, không lưu lại
  }
}

interface ThemeState {
  theme: Theme;
  /**
   * Đồng bộ lại state React với attribute inline script đã set trước paint, và áp lại nó sau khi
   * React Strict Mode (dev) reset <html> lúc remount — xem node_modules/next/dist/docs's
   * preventing-flash-before-hydration.md. Gọi 1 lần lúc mount (components/Providers.tsx).
   */
  initialize: () => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: "light",
  initialize: () => {
    const theme = readStoredTheme() ?? systemTheme();
    applyTheme(theme);
    set({ theme });
  },
  toggleTheme: () => {
    const next: Theme = get().theme === "dark" ? "light" : "dark";
    applyTheme(next);
    set({ theme: next });
  },
}));
