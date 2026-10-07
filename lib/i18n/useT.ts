"use client";

import { useLocaleStore } from "./store";
import { translations, type Namespace } from "./dictionaries";

/**
 * `const t = useT("common"); t("save")` — tự theo đúng locale hiện tại (đổi locale -> mọi component
 * dùng useT tự re-render vì đọc state từ zustand). `params` thay `{{key}}` trong chuỗi bằng giá trị
 * tương ứng, vd `t("deleteConfirm", { name: build.name })` với dict `'Delete "{{name}}"?'`.
 *
 * Lưu ý: index theo `dict.en`/`dict.vi` (property access literal), KHÔNG `dict[locale]` (index bằng biến
 * `Locale`) — TS không chứng minh được việc index 1 union type (theo N generic) bằng 1 key KHÔNG liên
 * quan tới N là an toàn (TS2536), dù ở runtime luôn đúng vì en/vi cùng shape (defineDict ép buộc).
 */
export function useT<N extends Namespace>(namespace: N) {
  const locale = useLocaleStore((s) => s.locale);
  const dict = translations[namespace];

  type Key = keyof (typeof dict)["en"];

  // Cast sang Record<string,string> chỉ ở đây để tra cứu động — an toàn vì defineDict() đã ép en/vi
  // cùng bộ key lúc khai báo dict (compile-time), TS chỉ không tự chứng minh lại được điều đó khi N là
  // generic (xem comment ở trên). Chữ ký của `t` trả về (key: Key) vẫn giữ nguyên type-safe cho caller.
  const en = dict.en as Record<string, string>;
  const vi = dict.vi as Record<string, string>;

  return function t(key: Key, params?: Record<string, string | number>): string {
    const table = locale === "en" ? en : vi;
    let str: string = table[key as string] ?? en[key as string];
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        str = str.split(`{{${k}}}`).join(String(v));
      }
    }
    return str;
  };
}
