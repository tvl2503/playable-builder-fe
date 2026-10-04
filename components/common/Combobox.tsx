"use client";

import React, { useMemo, useState } from "react";
import { Popover } from "radix-ui";

export interface ComboboxOption {
  value: string;
  label: string;
  sublabel?: string;
  iconUrl?: string | null;
}

interface ComboboxProps {
  options: ComboboxOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  emptyText?: string;
  className?: string;
}

/** Select có thể gõ để lọc + đề xuất, hiện icon từng option (vd icon game) — bọc Radix Popover vì `<select>` gốc không làm được. */
const Combobox = React.forwardRef<HTMLInputElement, ComboboxProps>(
  ({ options, value, onChange, placeholder = "Tìm kiếm...", emptyText = "Không tìm thấy", className = "" }, ref) => {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [activeIndex, setActiveIndex] = useState(0);

    const selected = options.find((o) => o.value === value) ?? null;

    const filtered = useMemo(() => {
      const q = query.trim().toLowerCase();
      if (!q) return options;
      return options.filter((o) => o.label.toLowerCase().includes(q) || o.sublabel?.toLowerCase().includes(q));
    }, [options, query]);

    const selectOption = (opt: ComboboxOption) => {
      onChange(opt.value);
      setQuery("");
      setOpen(false);
    };

    const handleOpenChange = (next: boolean) => {
      setOpen(next);
      if (!next) setQuery("");
      else setActiveIndex(0);
    };

    const showSelectedIcon = !!selected?.iconUrl && !open;

    return (
      <Popover.Root open={open} onOpenChange={handleOpenChange}>
        <Popover.Anchor asChild>
          <div className="relative flex items-center">
            {showSelectedIcon && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={selected!.iconUrl!} alt="" className="pointer-events-none absolute left-2.5 h-5 w-5 shrink-0 rounded object-cover" />
            )}
            <input
              ref={ref}
              value={open ? query : (selected?.label ?? "")}
              onChange={(e) => {
                setQuery(e.target.value);
                setActiveIndex(0);
                if (!open) setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setOpen(true);
                  setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setActiveIndex((i) => Math.max(i - 1, 0));
                } else if (e.key === "Enter") {
                  e.preventDefault();
                  const opt = filtered[activeIndex];
                  if (opt) selectOption(opt);
                } else if (e.key === "Escape") {
                  setOpen(false);
                }
              }}
              placeholder={placeholder}
              autoComplete="off"
              className={`w-full rounded-lg border border-zinc-300 bg-white py-2 text-sm text-zinc-900 placeholder:text-zinc-400 transition-shadow focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder:text-zinc-600 ${showSelectedIcon ? "pl-9 pr-3" : "px-3"} ${className}`}
            />
          </div>
        </Popover.Anchor>
        <Popover.Portal>
          <Popover.Content
            align="start"
            sideOffset={4}
            onOpenAutoFocus={(e) => e.preventDefault()}
            className="z-50 max-h-64 w-[var(--radix-popover-trigger-width)] overflow-y-auto rounded-lg border border-zinc-200 bg-white p-1 shadow-lg shadow-zinc-900/10 dark:border-zinc-700 dark:bg-zinc-900"
          >
            {filtered.length === 0 ? (
              <div className="px-3 py-2 text-sm text-zinc-400">{emptyText}</div>
            ) : (
              filtered.map((opt, i) => (
                <button
                  key={opt.value}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => selectOption(opt)}
                  onMouseEnter={() => setActiveIndex(i)}
                  className={`flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-sm ${
                    i === activeIndex ? "bg-primary-soft text-primary-hover" : "text-zinc-700 dark:text-zinc-200"
                  }`}
                >
                  {opt.iconUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={opt.iconUrl} alt="" className="h-6 w-6 shrink-0 rounded object-cover" />
                  ) : (
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-zinc-100 text-xs font-medium text-zinc-500 dark:bg-zinc-800">
                      {opt.label.charAt(0).toUpperCase()}
                    </span>
                  )}
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate">{opt.label}</span>
                    {opt.sublabel && <span className="truncate text-xs text-zinc-400">{opt.sublabel}</span>}
                  </span>
                </button>
              ))
            )}
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    );
  },
);

Combobox.displayName = "Combobox";

export default Combobox;
