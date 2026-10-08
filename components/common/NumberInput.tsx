"use client";

import React from "react";
import { MinusIcon, PlusIcon } from "../icons";

interface NumberInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number | "any";
  disabled?: boolean;
  className?: string;
  /** Chặn gõ "." / "e" / số âm (nếu min >= 0) ngay từ bàn phím — input[type=number] gốc không tự chặn được việc gõ số thập phân dù step=1. */
  integer?: boolean;
}

/** Phím tạo ra số thập phân/khoa học — input[type=number] vẫn cho gõ dù step nguyên. */
const NON_INTEGER_KEYS = new Set([".", ",", "e", "E", "+"]);

/** Ô số kèm nút +/- thay cho spinner mặc định xấu của trình duyệt (input[type=number]). */
const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  ({ value, onChange, min, max, step = 1, disabled, className = "", integer }, ref) => {
    const numericStep = step === "any" ? 1 : step;
    const allowNegative = !integer || typeof min !== "number" || min < 0;

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!integer) return;
      if (NON_INTEGER_KEYS.has(e.key) || (e.key === "-" && !allowNegative)) {
        e.preventDefault();
      }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
      if (!integer) return;
      const text = e.clipboardData.getData("text");
      if (!new RegExp(`^${allowNegative ? "-?" : ""}\\d*$`).test(text)) {
        e.preventDefault();
      }
    };

    const clamp = (n: number) => {
      let v = n;
      if (typeof min === "number") v = Math.max(min, v);
      if (typeof max === "number") v = Math.min(max, v);
      return v;
    };

    // toFixed tránh lệch số thập phân do cộng dồn float (vd 0.1 + 0.2) khi step là số lẻ.
    const decrement = () => onChange(clamp(Number((value - numericStep).toFixed(6))));
    const increment = () => onChange(clamp(Number((value + numericStep).toFixed(6))));

    const atMin = typeof min === "number" && value <= min;
    const atMax = typeof max === "number" && value >= max;

    return (
      <div
        className={`inline-flex items-stretch overflow-hidden rounded-lg border border-zinc-300 bg-white transition-shadow focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 dark:border-zinc-700 dark:bg-zinc-900 ${
          disabled ? "opacity-50" : ""
        } ${className}`}
      >
        <button
          type="button"
          disabled={disabled || atMin}
          onClick={decrement}
          className="flex cursor-pointer w-6 shrink-0 items-center justify-center text-zinc-500 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          <MinusIcon className="h-3 w-3" />
        </button>
        <input
          ref={ref}
          type="number"
          value={Number.isNaN(value) ? "" : value}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onChange={(e) => {
            const v = e.target.valueAsNumber;
            if (!Number.isNaN(v)) onChange(clamp(v));
          }}
          className="w-full min-w-0 flex-1 border-x border-zinc-200 bg-transparent px-1 py-1.5 text-center text-sm tabular-nums text-zinc-900 focus:outline-none [appearance:textfield] dark:border-zinc-800 dark:text-zinc-50 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        <button
          type="button"
          disabled={disabled || atMax}
          onClick={increment}
          className="flex w-6  cursor-pointer shrink-0 items-center justify-center text-zinc-500 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          <PlusIcon className="h-3 w-3" />
        </button>
      </div>
    );
  },
);

NumberInput.displayName = "NumberInput";

export default NumberInput;
