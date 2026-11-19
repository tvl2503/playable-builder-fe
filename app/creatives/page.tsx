"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Button, SortableGrid, SortableGridHandle, useSortableItemDragging } from "@/components/common";
import { ChevronRightIcon, GamesIcon, GripIcon, PlusIcon, StarIcon } from "@/components/icons";
import { EmptyState } from "@/components/EmptyState";
import { PageLoading, Spinner } from "@/components/Spinner";
import { GameIcon } from "@/components/GameIcon";
import { routes } from "@/lib/routes";
import { useT } from "@/lib/i18n/useT";
import type { ApiGame } from "@/lib/api";
import { useGamesPage } from "./useGamesPage";

export default function GamesPage() {
  const { session, games, favoriteGames, otherGames, error, canCreate, toggleFavorite, reorderFavorites } =
    useGamesPage();
  const t = useT("gamesList");

  if (!session) return <PageLoading />;

  return (
    <main className="flex w-full flex-1 flex-col gap-6 px-4 py-6 sm:px-8 sm:py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">{t("title")}</h1>
          <p className="mt-1 text-sm text-zinc-500">{t("subtitle")}</p>
        </div>
        {canCreate && (
          <Link
            href={routes.creativeNew}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm shadow-orange-900/10 transition-colors hover:bg-primary-hover"
          >
            <PlusIcon className="h-4 w-4" />
            {t("createGame")}
          </Link>
        )}
      </div>

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

        {!games && !error && (
          <div className="flex justify-center py-10">
            <Spinner className="h-6 w-6" />
          </div>
        )}

        {games && games.length === 0 && (
          <EmptyState
            icon={<GamesIcon className="h-10 w-10" />}
            title={t("noGamesTitle")}
            description={t("noGamesDescription")}
            action={
              canCreate ? (
                <Link href={routes.creativeNew} className="text-sm font-medium text-primary hover:underline">
                  {t("createGameShort")}
                </Link>
              ) : undefined
            }
          />
        )}

        {games && games.length > 0 && (
          <>
            {favoriteGames.length > 0 && (
              <GameSection title={t("favorites")} count={favoriteGames.length} grid={false}>
                <SortableGrid
                  items={favoriteGames}
                  getId={(g) => g.id}
                  onReorder={reorderFavorites}
                  className={GRID_CLASS}
                  renderItem={(game) => (
                    <GameCard game={game} onToggleFavorite={() => toggleFavorite(game.id)} sortable />
                  )}
                />
              </GameSection>
            )}
            {otherGames.length > 0 && (
              <GameSection title={favoriteGames.length > 0 ? t("allGames") : null} count={otherGames.length}>
                {otherGames.map((game) => (
                  <GameCard key={game.id} game={game} onToggleFavorite={() => toggleFavorite(game.id)} />
                ))}
              </GameSection>
            )}
          </>
        )}
      </div>
    </main>
  );
}

const GRID_CLASS = "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3";

/**
 * 1 nhóm game có tiêu đề (vd "Yêu thích") — `title` null thì chỉ hiện lưới, không tiêu đề (khi user chưa có game
 * yêu thích nào). `grid={false}` khi children tự dựng lưới (vd SortableGrid).
 */
function GameSection({
  title,
  count,
  grid = true,
  children,
}: {
  title: string | null;
  count: number;
  grid?: boolean;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      {title && (
        <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          {title} <span className="font-normal text-zinc-400">({count})</span>
        </h2>
      )}
      {grid ? <div className={GRID_CLASS}>{children}</div> : children}
    </section>
  );
}

/**
 * Card 1 game. Nút sao nằm NGOÀI `<Link>` (đặt absolute đè lên góc card) — không lồng `<button>` trong `<a>`,
 * click sao không bị điều hướng vào trang game.
 */
function GameCard({
  game,
  onToggleFavorite,
  sortable = false,
}: {
  game: ApiGame;
  onToggleFavorite: () => void;
  /** true = card nằm trong SortableGrid (nhóm "Yêu thích") — chừa chỗ cho tay nắm kéo cạnh nút sao. */
  sortable?: boolean;
}) {
  const t = useT("gamesList");
  const isDragging = useSortableItemDragging();
  return (
    <div className={`group relative h-full ${isDragging ? "[&>a]:shadow-lg" : ""}`}>
      <Link
        href={routes.creative(game.id)}
        className="flex h-full flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm shadow-zinc-900/5 transition-all group-hover:-translate-y-0.5 group-hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
      >
        <div className={`flex items-start justify-between ${sortable ? "pr-17" : "pr-9"}`}>
          <GameIcon game={game} />
          <ChevronRightIcon className="h-4 w-4 text-zinc-300 transition-transform group-hover:translate-x-0.5 group-hover:text-zinc-400" />
        </div>
        <div>
          <h2 className="truncate font-medium text-zinc-900 dark:text-zinc-50">{game.name}</h2>
          <p className="truncate text-xs text-zinc-500">{game.slug}</p>
        </div>
        {(game.androidUrl || game.iosUrl) && (
          <div className="flex gap-2">
            {game.androidUrl && (
              <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                Android
              </span>
            )}
            {game.iosUrl && (
              <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                iOS
              </span>
            )}
          </div>
        )}
      </Link>
      <SortableGridHandle
        title={t("dragToReorder")}
        className="absolute right-11 top-3 text-zinc-300! hover:bg-zinc-100! hover:text-zinc-600! dark:text-zinc-600! dark:hover:bg-zinc-800!"
      >
        <GripIcon className="h-5 w-5" />
      </SortableGridHandle>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onToggleFavorite}
        aria-pressed={!!game.isFavorite}
        title={game.isFavorite ? t("removeFavorite") : t("addFavorite")}
        className={`absolute right-3 top-3 transition-transform group-hover:-translate-y-0.5 ${
          game.isFavorite
            ? "text-amber-400! hover:bg-amber-50! hover:text-amber-500! dark:hover:bg-amber-950/40!"
            : "text-zinc-300! hover:bg-zinc-100! hover:text-amber-400! dark:text-zinc-600! dark:hover:bg-zinc-800!"
        }`}
      >
        <StarIcon className="h-5 w-5" filled={!!game.isFavorite} />
      </Button>
    </div>
  );
}
