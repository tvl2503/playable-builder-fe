"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import { useRequireAuth } from "@/lib/auth/use-require-auth";
import { api, type ApiGame } from "@/lib/api";
import { can } from "@/lib/auth/permissions";
import { swrKeys } from "@/lib/api/swr-keys";

export function useGamesPage() {
  const session = useRequireAuth();

  const {
    data: games,
    error: swrError,
    mutate: mutateGames,
  } = useSWR(session ? swrKeys.games() : null, () => api.listGames(session!.accessToken));

  const canCreate = can(session?.permissions ?? null, "game:manage");
  const error = swrError ? (swrError instanceof Error ? swrError.message : String(swrError)) : null;

  // Game user đã đánh dấu sao tách thành nhóm riêng trên cùng. Backend đã xếp sẵn: nhóm "Yêu thích" theo thứ tự user tự
  // kéo-thả (User.gameOrder), nhóm còn lại theo createdAt mới nhất.
  const favoriteGames = useMemo(() => games?.filter((g) => g.isFavorite) ?? [], [games]);
  const otherGames = useMemo(() => games?.filter((g) => !g.isFavorite) ?? [], [games]);

  const [favoriteError, setFavoriteError] = useState<string | null>(null);

  /** Bật/tắt sao — cập nhật UI ngay (optimistic), lỗi thì SWR tự rollback về dữ liệu cũ. */
  const toggleFavorite = async (gameId: string) => {
    if (!session || !games) return;
    const game = games.find((g) => g.id === gameId);
    if (!game) return;
    const next = !game.isFavorite;
    setFavoriteError(null);
    try {
      await mutateGames(
        async (prev) => {
          await api.setGameFavorite(session.accessToken, gameId, next);
          return applyToggle(prev ?? [], gameId, next);
        },
        {
          optimisticData: (prev) => applyToggle(prev ?? [], gameId, next),
          rollbackOnError: true,
          revalidate: false,
        },
      );
    } catch (e) {
      setFavoriteError(e instanceof Error ? e.message : String(e));
    }
  };

  /** Thả xong 1 card trong nhóm "Yêu thích" — cập nhật UI ngay, lưu thứ tự mới lên backend, lỗi thì rollback. */
  const reorderFavorites = async (ordered: ApiGame[]) => {
    if (!session) return;
    setFavoriteError(null);
    const ids = ordered.map((g) => g.id);
    const reorder = (prev: ApiGame[] = []) => [...ordered, ...prev.filter((g) => !g.isFavorite)];
    try {
      await mutateGames(
        async (prev) => {
          await api.setFavoriteGameOrder(session.accessToken, ids);
          return reorder(prev);
        },
        { optimisticData: reorder, rollbackOnError: true, revalidate: false },
      );
    } catch (e) {
      setFavoriteError(e instanceof Error ? e.message : String(e));
    }
  };

  return {
    session,
    games: games ?? null,
    favoriteGames,
    otherGames,
    error: error ?? favoriteError,
    canCreate,
    toggleFavorite,
    reorderFavorites,
  };
}

/**
 * Đánh dấu sao → đưa game lên ĐẦU danh sách (khớp backend: game vừa đánh dấu đứng đầu nhóm "Yêu thích").
 * Bỏ sao → đặt lại đúng chỗ theo createdAt trong nhóm còn lại.
 */
function applyToggle(games: ApiGame[], gameId: string, favorite: boolean): ApiGame[] {
  const game = games.find((g) => g.id === gameId);
  if (!game) return games;
  const updated = { ...game, isFavorite: favorite };
  const rest = games.filter((g) => g.id !== gameId);
  if (favorite) return [updated, ...rest];
  const favorites = rest.filter((g) => g.isFavorite);
  const others = [...rest.filter((g) => !g.isFavorite), updated].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return [...favorites, ...others];
}
