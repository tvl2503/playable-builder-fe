"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import { AudioPlayButton } from "@/components/AudioPlayButton";
import { Dialog, Input } from "@/components/common";
import { EmptyState } from "@/components/EmptyState";
import { Spinner } from "@/components/Spinner";
import { ImageIcon, MusicIcon, UploadCloudIcon } from "@/components/icons";
import { MediaUploadDialog } from "@/components/MediaUploadDialog";
import { api, type MediaKind } from "@/lib/api";
import { swrKeys } from "@/lib/api/swr-keys";
import { extensionForMimeType } from "@/lib/media/imageEdit";
import { useT } from "@/lib/i18n/useT";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  token: string;
  /** Game đích khi upload asset mới ngay trong picker (thuộc build đang sửa) — không dùng để lọc danh sách, picker luôn duyệt chéo game. */
  gameId: string;
  kind: MediaKind;
  onSelect: (mediaId: string) => void;
}

/**
 * Dialog chọn 1 asset có sẵn trong kho Media (hoặc upload mới ngay tại chỗ) để gán cho field
 * @playgroundAsset — khác trang /media (quản lý đầy đủ) ở chỗ chọn xong là đóng lại ngay, không có
 * thao tác xoá/quản lý ở đây.
 */
export function MediaPicker({ open, onOpenChange, token, gameId, kind, onSelect }: Props) {
  const t = useT("media");
  const [search, setSearch] = useState("");
  const [editQueue, setEditQueue] = useState<File[]>([]);

  const filter = useMemo(() => ({ kind, search: search.trim() || undefined }), [kind, search]);
  const filterKey = JSON.stringify(filter);
  const { data: assets, mutate } = useSWR(open ? swrKeys.media(filterKey) : null, () => api.listMedia(token, filter));

  const selectFiles = (files: FileList | File[]) => {
    const prefix = kind === "IMAGE" ? "image/" : "audio/";
    const valid = Array.from(files).filter((f) => f.type.startsWith(prefix));
    setEditQueue((prev) => [...prev, ...valid]);
  };

  const confirmUpload = async (blob: Blob, mimeType: string, name: string) => {
    const ext = extensionForMimeType(mimeType);
    const file = new File([blob], `${name || "media"}${ext}`, { type: mimeType });
    const created = await api.uploadMedia(token, gameId, file, name);
    await mutate((prev) => (prev ? [created, ...prev] : [created]), { revalidate: false });
    setEditQueue((prev) => prev.slice(1));
    onSelect(created.id);
    onOpenChange(false);
  };

  const editingFile = editQueue[0] ?? null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange} title={kind === "IMAGE" ? t("pickerTitleImage") : t("pickerTitleAudio")} size="lg">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("searchPlaceholder")} className="flex-1" />
            <label className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-dashed border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-600">
              <UploadCloudIcon className="h-4 w-4" />
              {t("uploadNew")}
              <Input
                type="file"
                accept={kind === "IMAGE" ? "image/*" : "audio/*"}
                onChange={(e) => {
                  if (e.target.files?.length) selectFiles(e.target.files);
                  e.target.value = "";
                }}
                className="hidden"
              />
            </label>
          </div>

          {!assets && (
            <div className="flex justify-center py-10">
              <Spinner className="h-6 w-6" />
            </div>
          )}

          {assets && assets.length === 0 && (
            <EmptyState icon={kind === "IMAGE" ? <ImageIcon className="h-9 w-9" /> : <MusicIcon className="h-9 w-9" />} title={t("emptyMediaTitle")} />
          )}

          {assets && assets.length > 0 && (
            <div className="grid max-h-[420px] grid-cols-[repeat(auto-fill,minmax(110px,1fr))] gap-2.5 overflow-y-auto pr-1">
              {assets.map((asset) => (
                <div
                  key={asset.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    onSelect(asset.id);
                    onOpenChange(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      onSelect(asset.id);
                      onOpenChange(false);
                    }
                  }}
                  className="flex cursor-pointer flex-col items-center gap-1 rounded-lg border border-zinc-200 p-2 text-center transition-colors hover:border-primary/40 hover:bg-primary-soft dark:border-zinc-700"
                >
                  <div className="flex aspect-square w-full items-center justify-center overflow-hidden rounded bg-zinc-100 dark:bg-zinc-900">
                    {asset.kind === "IMAGE" ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={asset.url} alt="" className="h-full w-full object-contain" />
                    ) : (
                      <div
                        className="flex h-full w-full flex-col items-center justify-center gap-1 text-zinc-400"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MusicIcon className="h-6 w-6" />
                        <AudioPlayButton src={asset.url} />
                      </div>
                    )}
                  </div>
                  <span className="w-full truncate text-[11px] text-zinc-600 dark:text-zinc-400">{asset.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </Dialog>

      {editingFile && (
        <MediaUploadDialog
          key={`${editingFile.name}-${editingFile.lastModified}-${editingFile.size}`}
          file={editingFile}
          onCancel={() => setEditQueue((prev) => prev.slice(1))}
          onConfirm={confirmUpload}
        />
      )}
    </>
  );
}
