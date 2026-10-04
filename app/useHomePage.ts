"use client";

import useSWR from "swr";
import { useRequireAuth } from "@/lib/auth/use-require-auth";
import { api } from "@/lib/api";
import { swrKeys } from "@/lib/api/swr-keys";

export function useHomePage() {
  const session = useRequireAuth();
  const { data: games } = useSWR(session ? swrKeys.games() : null, () => api.listGames(session!.accessToken));

  const sortedGames = [...(games ?? [])].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return {
    session,
    games: sortedGames,
    gamesLoading: !games,
  };
}
