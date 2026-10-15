/** MB khi >= 1MB (ad network hay quy định giới hạn theo MB), còn lại KB. */
export function formatSize(bytes: number): string {
  return bytes >= 1024 * 1024 ? (bytes / 1024 / 1024).toFixed(2) + " MB" : (bytes / 1024).toFixed(0) + " KB";
}

/** Trên 4MB cảnh báo vàng, trên 5MB đỏ (giới hạn phổ biến của ad network), còn lại xanh. */
export function sizeColorClass(bytes: number): string {
  if (bytes > 5 * 1024 * 1024) return "font-semibold text-red-600 dark:text-red-400";
  if (bytes > 4 * 1024 * 1024) return "font-semibold text-amber-600 dark:text-amber-400";
  return "font-semibold text-emerald-600 dark:text-emerald-400";
}

export function formatBytes(bytes: number): string {
  return (bytes / 1024).toFixed(0) + " KB";
}
