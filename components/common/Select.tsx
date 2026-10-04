import React from "react";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  /** true: compact, mũi tên tự vẽ — dùng cho toolbar chật chỗ (vd chọn device ở live preview). Mặc định false: control thường, mũi tên trình duyệt gốc. Đặt tên khác `size` vì `<select>` đã có attribute `size` gốc (số dòng hiện) kiểu number, trùng tên sẽ đụng type. */
  compact?: boolean;
}

const BASE_CLASS =
  "rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50";
const COMPACT_CLASS =
  "h-8 min-w-[170px] appearance-none rounded-lg border border-zinc-200 bg-white px-3 pr-8 text-xs font-medium text-zinc-700 outline-none transition hover:border-zinc-300 focus:border-zinc-400 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:border-zinc-600";

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({ compact = false, className = "", children, ...props }, ref) => {
  if (compact) {
    return (
      <div className="relative inline-block">
        <select ref={ref} className={`${COMPACT_CLASS} ${className}`} {...props}>
          {children}
        </select>
        <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-zinc-400">▼</span>
      </div>
    );
  }

  return (
    <select ref={ref} className={`${BASE_CLASS} ${className}`} {...props}>
      {children}
    </select>
  );
});

Select.displayName = "Select";

export default Select;
