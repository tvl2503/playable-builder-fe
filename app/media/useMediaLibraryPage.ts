"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import { useRequireAuth } from "@/lib/auth/use-require-auth";
import { api, ApiMediaAsset, MediaKind } from "@/lib/api";
import { can, canOnResource } from "@/lib/auth/permissions";
import { swrKeys } from "@/lib/api/swr-keys";
import { extensionForMimeType } from "@/lib/media/imageEdit";
import { useT } from "@/lib/i18n/useT";

export type MediaKindFilter = "all" | MediaKind;

export function useMediaLibraryPage() {
  const session = useRequireAuth();
  const t = useT("media");

  const { data: games } = useSWR(session ? swrKeys.games() : null, () => api.listGames(session!.accessToken));

  // null = chưa người dùng chọn gì (tự mặc định game đầu tiên); "" = NGƯỜI DÙNG chủ động chọn "Tất
  // cả game" — phải phân biệt 2 case này, không thì sau khi auto-pick lần đầu, bấm lại "Tất cả game"
  // sẽ không set lại về "" được (dropdown giá trị "" trùng với sentinel "chưa chọn").
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [kindFilter, setKindFilter] = useState<MediaKindFilter>("all");
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  // File đang chờ chỉnh sửa (crop/trim/...) trước khi thật sự upload — xem MediaUploadDialog. Xử lý
  // từng file 1 (chọn nhiều file cùng lúc thì xếp hàng), không upload thẳng ngay lúc chọn file nữa.
  const [editQueue, setEditQueue] = useState<File[]>([]);

  // Chưa chọn game nào -> mặc định game đầu tiên để sẵn chỗ upload, không bắt user phải tự chọn trước
  // (tính trực tiếp lúc render thay vì set lại state trong effect — tránh render thừa 1 lần).
  const effectiveGameId = selectedGameId ?? games?.[0]?.id ?? "";

  const filter = useMemo(
    () => ({
      gameId: effectiveGameId || undefined,
      kind: kindFilter === "all" ? undefined : kindFilter,
      search: search.trim() || undefined,
    }),
    [effectiveGameId, kindFilter, search],
  );
  const filterKey = JSON.stringify(filter);

  const {
    data: assets,
    error: listError,
    mutate: mutateAssets,
  } = useSWR(session ? swrKeys.media(filterKey) : null, () => api.listMedia(session!.accessToken, filter));

  const canUpload = can(session?.permissions ?? null, "media:upload");
  const canDelete = (asset: ApiMediaAsset) =>
    canOnResource(session?.permissions ?? null, "media", "delete", asset.createdById, session?.user.id);

  /** Chỉ nhận ảnh/audio — input đã có accept nhưng kéo-thả có thể bỏ qua gợi ý đó. */
  const selectFiles = (files: FileList | File[]) => {
    const valid = Array.from(files).filter((f) => f.type.startsWith("image/") || f.type.startsWith("audio/"));
    if (valid.length === 0) {
      setError(t("invalidFileType"));
      return;
    }
    setError(null);
    setEditQueue((prev) => [...prev, ...valid]);
  };

  const cancelCurrentEdit = () => setEditQueue((prev) => prev.slice(1));

  const confirmCurrentUpload = async (blob: Blob, mimeType: string, name: string) => {
    if (!session || !effectiveGameId) return;
    const ext = extensionForMimeType(mimeType);
    const finalFile = new File([blob], `${name || "media"}${ext}`, { type: mimeType });
    const created = await api.uploadMedia(session.accessToken, effectiveGameId, finalFile, name);
    await mutateAssets((prev) => (prev ? [created, ...prev] : [created]), { revalidate: false });
    setEditQueue((prev) => prev.slice(1));
  };

  const deleteAsset = async (id: string) => {
    if (!session) return;
    await api.deleteMedia(session.accessToken, id);
    mutateAssets((prev) => prev?.filter((a) => a.id !== id), { revalidate: false });
  };

  const firstError = listError ? (listError instanceof Error ? listError.message : String(listError)) : error;

  return {
    session,
    games: games ?? [],
    selectedGameId: effectiveGameId,
    setSelectedGameId,
    assets: assets ?? null,
    error: firstError,
    kindFilter,
    setKindFilter,
    search,
    setSearch,
    canUpload,
    canDelete,
    selectFiles,
    editingFile: editQueue[0] ?? null,
    cancelCurrentEdit,
    confirmCurrentUpload,
    deleteAsset,
  };
}
