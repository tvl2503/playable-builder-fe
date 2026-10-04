"use client";

import { useState } from "react";
import type { ApiMediaAsset } from "@/lib/api";
import { AudioPlayButton } from "@/components/AudioPlayButton";
import { Button, Card, ConfirmDialog, Input, Select } from "@/components/common";
import { EmptyState } from "@/components/EmptyState";
import { PageLoading, Spinner } from "@/components/Spinner";
import { ImageIcon, MusicIcon, TrashIcon, UploadCloudIcon } from "@/components/icons";
import { MediaUploadDialog } from "@/components/MediaUploadDialog";
import { formatBytes } from "@/lib/format";
import { useMediaLibraryPage, type MediaKindFilter } from "./useMediaLibraryPage";

const KIND_FILTERS: { value: MediaKindFilter; label: string }[] = [
  { value: "all", label: "Tất cả" },
  { value: "IMAGE", label: "Ảnh" },
  { value: "AUDIO", label: "Audio" },
];

function MediaCard({ asset, canDelete, onDelete }: { asset: ApiMediaAsset; canDelete: boolean; onDelete: (id: string) => Promise<void> }) {
  const [deleting, setDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete(asset.id);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="group flex flex-col gap-1.5 rounded-xl border border-zinc-200 p-2 dark:border-zinc-800">
      <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-lg bg-[repeating-conic-gradient(#8883_0%_25%,transparent_0%_50%)] bg-size-[10px_10px]">
        {asset.kind === "IMAGE" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={asset.url} alt={asset.name} loading="lazy" className="h-full w-full object-contain" />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-zinc-100 text-zinc-400 dark:bg-zinc-900">
            <MusicIcon className="h-8 w-8" />
            <AudioPlayButton src={asset.url} />
          </div>
        )}
        {canDelete && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setConfirmOpen(true)}
            disabled={deleting}
            className="absolute right-1 top-1 bg-white/90! text-zinc-500! opacity-0 hover:bg-red-50! hover:text-red-600! group-hover:opacity-100 dark:bg-zinc-800/90! dark:text-zinc-300!"
            title="Xoá media"
          >
            {deleting ? <Spinner className="h-3.5 w-3.5" /> : <TrashIcon className="h-3.5 w-3.5" />}
          </Button>
        )}
      </div>
      <span className="w-full truncate text-xs font-medium text-zinc-700 dark:text-zinc-300" title={asset.name}>
        {asset.name}
      </span>
      <span className="text-[11px] text-zinc-400">{formatBytes(asset.sizeBytes)}</span>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Xoá media"
        description={`Xoá media "${asset.name}"?`}
        confirmLabel="Xoá media"
        danger
        onConfirm={handleDelete}
      />
    </div>
  );
}

export default function MediaLibraryPage() {
  const {
    session,
    games,
    selectedGameId,
    setSelectedGameId,
    assets,
    error,
    kindFilter,
    setKindFilter,
    search,
    setSearch,
    canUpload,
    canDelete,
    selectFiles,
    editingFile,
    cancelCurrentEdit,
    confirmCurrentUpload,
    deleteAsset,
  } = useMediaLibraryPage();
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  if (!session) return <PageLoading />;

  return (
    <main className="flex w-full flex-1 flex-col gap-6 px-8 py-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Thư viện Media</h1>
        <p className="mt-1 text-sm text-zinc-500">Kho ảnh/audio dùng chung.</p>
      </div>

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Select value={selectedGameId} onChange={(e) => setSelectedGameId(e.target.value)}>
              <option value="">Tất cả game</option>
              {games.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </Select>
            <span className="mx-1 text-zinc-300 dark:text-zinc-700">|</span>
            {KIND_FILTERS.map((k) => (
              <Button
                key={k.value}
                type="button"
                variant={kindFilter === k.value ? "primary" : "outline"}
                size="sm"
                onClick={() => setKindFilter(k.value)}
                className="rounded-full!"
              >
                {k.label}
              </Button>
            ))}
          </div>
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm theo tên..." className="w-full sm:w-56" />
        </div>

        {canUpload && (
          <Card padding="lg">
            <label
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingFile(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setIsDraggingFile(false);
              }}
              onDrop={(e) => {
                e.preventDefault();
                setIsDraggingFile(false);
                if (e.dataTransfer.files?.length) selectFiles(e.dataTransfer.files);
              }}
              className={`flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors ${
                isDraggingFile
                  ? "border-primary bg-primary-soft"
                  : "border-zinc-300 hover:border-zinc-400 dark:border-zinc-700 dark:hover:border-zinc-600"
              }`}
            >
              <UploadCloudIcon className="h-8 w-8 text-zinc-400" />
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                {selectedGameId ? (
                  <>
                    Kéo thả hoặc <span className="font-medium text-primary">chọn ảnh/audio</span> — upload vào{" "}
                    <span className="font-medium">{games.find((g) => g.id === selectedGameId)?.name}</span>
                  </>
                ) : (
                  "Chọn 1 game cụ thể ở trên để upload"
                )}
              </span>
              <Input
                type="file"
                accept="image/*,audio/*"
                multiple
                disabled={!selectedGameId}
                onChange={(e) => {
                  if (e.target.files?.length) selectFiles(e.target.files);
                  e.target.value = "";
                }}
                className="hidden"
              />
            </label>
          </Card>
        )}

        {!assets && !error && (
          <div className="flex justify-center py-10">
            <Spinner className="h-6 w-6" />
          </div>
        )}

        {assets && assets.length === 0 && (
          <EmptyState icon={<ImageIcon className="h-9 w-9" />} title="Chưa có media nào" description="Upload ảnh hoặc audio để bắt đầu kho dùng chung." />
        )}

        {assets && assets.length > 0 && (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(130px,1fr))] gap-3">
            {assets.map((asset) => (
              <MediaCard key={asset.id} asset={asset} canDelete={canDelete(asset)} onDelete={deleteAsset} />
            ))}
          </div>
        )}
      </div>

      {editingFile && (
        <MediaUploadDialog
          key={`${editingFile.name}-${editingFile.lastModified}-${editingFile.size}`}
          file={editingFile}
          onCancel={cancelCurrentEdit}
          onConfirm={confirmCurrentUpload}
        />
      )}
    </main>
  );
}
