"use client";

import { useState } from "react";
import * as RadixDialog from "@radix-ui/react-dialog";
import Button from "./Button";
import { useT } from "@/lib/i18n/useT";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** true: nút xác nhận màu đỏ (variant="danger") — dùng cho hành động xoá. */
  danger?: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void> | void;
}

/**
 * Modal xác nhận (thay cho window.confirm) — Radix Dialog lo focus-trap/Escape/click-outside. Lỗi từ
 * onConfirm hiện ngay trong dialog (thay window.alert), dialog chỉ tự đóng khi onConfirm thành công —
 * cùng quy ước với PromptDialog.
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  danger = false,
  onOpenChange,
  onConfirm,
}: ConfirmDialogProps) {
  const t = useT("common");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await onConfirm();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <RadixDialog.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) setError(null);
        onOpenChange(next);
      }}
    >
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed inset-0 z-50 bg-zinc-950/50 backdrop-blur-sm" />
        <RadixDialog.Content
          // Portal render ra ngoài <body> nhưng React vẫn bubble sự kiện theo CÂY REACT (nơi component
          // này được đặt trong JSX), không theo cây DOM thật — dialog đặt trong 1 hàng bảng có onClick
          // (vd TableRow điều hướng khi click) thì bấm nút trong dialog sẽ vô tình bubble lên tới đó.
          // Chặn ở gốc Content để mọi nơi dùng ConfirmDialog khỏi phải tự nhớ stopPropagation.
          onClick={(e) => e.stopPropagation()}
          className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl shadow-zinc-900/10 dark:border-zinc-800 dark:bg-zinc-900">
          <RadixDialog.Title className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{title}</RadixDialog.Title>
          {description && <RadixDialog.Description className="mt-1.5 text-xs text-zinc-500">{description}</RadixDialog.Description>}
          {error && <p className="mt-3 text-xs text-red-600 dark:text-red-400">{error}</p>}
          <div className="mt-4 flex justify-end gap-2">
            <RadixDialog.Close asChild>
              <Button type="button" variant="secondary" size="sm" disabled={submitting}>
                {cancelLabel ?? t("cancel")}
              </Button>
            </RadixDialog.Close>
            <Button type="button" variant={danger ? "danger" : "primary"} size="sm" loading={submitting} onClick={handleConfirm}>
              {confirmLabel ?? t("confirm")}
            </Button>
          </div>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}
