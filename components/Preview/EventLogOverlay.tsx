"use client";

import { useEffect, useState } from "react";
import { useT } from "@/lib/i18n/useT";

type SuperHtmlEventName = "download" | "game_end";

const DOT_CLASS: Record<SuperHtmlEventName, string> = {
  download: "bg-emerald-500",
  game_end: "bg-amber-400",
};

const EVENT_NAMES: SuperHtmlEventName[] = ["download", "game_end"];

interface LoggedEvent {
  name: SuperHtmlEventName;
  count: number;
}

/**
 * Hiện log các event `super_html.download()`/`super_html.game_end()` được gọi bên trong iframe preview —
 * nhận qua postMessage (xem static/templates/channel/common/script.js bên playable-builder, chỉ channel
 * "common" dùng cho preview/share mới gửi, bản export không có). Chỉ nhận message có đúng
 * `source: "super-html-preview"`, bỏ qua mọi message khác (devtools, extension...).
 * Đặt `key` giống iframe preview ở page.tsx để remount (reset log) mỗi khi preview reload.
 */
export default function EventLogOverlay() {
  const t = useT("eventLog");
  const [events, setEvents] = useState<LoggedEvent[]>([]);

  const LABEL: Record<SuperHtmlEventName, string> = {
    download: t("clickOnCta"),
    game_end: t("endOfGame"),
  };

  useEffect(() => {
    function handleMessage(e: MessageEvent) {
      const data = e.data as { source?: string; event?: string } | null;
      if (!data || data.source !== "super-html-preview") return;

      const name = data.event as SuperHtmlEventName;
      if (!EVENT_NAMES.includes(name)) return;

      setEvents((prev) => {
        const idx = prev.findIndex((evt) => evt.name === name);
        if (idx === -1) return [...prev, { name, count: 1 }];
        const next = [...prev];
        next[idx] = { name, count: next[idx].count + 1 };
        return next;
      });
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  if (events.length === 0) return null;

  return (
    <div className="pointer-events-none absolute left-3 top-3 z-10 flex flex-col gap-2 rounded-xl border border-zinc-200 bg-white/95 px-4 py-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/95">
      {events.map((evt) => (
        <div key={evt.name} className="flex items-center gap-2.5 text-sm text-zinc-700 dark:text-zinc-200">
          <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${DOT_CLASS[evt.name]}`} />
          {LABEL[evt.name]}
          {evt.count > 1 && ` (${evt.count})`}
        </div>
      ))}
    </div>
  );
}
