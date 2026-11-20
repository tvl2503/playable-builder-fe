"use client";

import React from "react";

interface ProgressBarProps {
  /** 0–100. `null` = chưa biết tiến độ (vd server đang xử lý) — hiện thanh chạy qua lại thay vì %. */
  value: number | null;
  className?: string;
}

const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(({ value, className = "" }, ref) => {
  const clamped = value === null ? null : Math.max(0, Math.min(100, value));
  return (
    <div
      ref={ref}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={clamped ?? undefined}
      className={`relative h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800 ${className}`}
    >
      {clamped === null ? (
        <div className="absolute inset-y-0 w-1/3 animate-[progress-indeterminate_1.2s_ease-in-out_infinite] rounded-full bg-primary" />
      ) : (
        <div className="h-full rounded-full bg-primary transition-[width] duration-200" style={{ width: `${clamped}%` }} />
      )}
    </div>
  );
});

ProgressBar.displayName = "ProgressBar";

export default ProgressBar;
