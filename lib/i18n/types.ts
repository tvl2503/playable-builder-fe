export type Locale = "en" | "vi";

export const LOCALES: Locale[] = ["en", "vi"];

export type Dict = Record<string, string>;

/**
 * Ép `vi` phải có ĐÚNG bộ key với `en` (thiếu/thừa key là lỗi compile-time) — tránh tình trạng 1 ngôn
 * ngữ thiếu bản dịch mà không ai biết tới khi chạy thật (runtime mới lộ ra chỗ `undefined`).
 */
export function defineDict<E extends Dict>(en: E, vi: { [K in keyof E]: string }) {
  return { en, vi } as const;
}
