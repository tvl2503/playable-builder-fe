"use client";

import Link from "next/link";
import { Card } from "@/components/common";
import { EmptyState } from "@/components/EmptyState";
import { GameIcon } from "@/components/GameIcon";
import { PageLoading, Spinner } from "@/components/Spinner";
import { ChevronRightIcon, GamesIcon, ImageIcon, LayersIcon, PlusIcon, ShieldIcon } from "@/components/icons";
import { routes } from "@/lib/routes";
import { useT } from "@/lib/i18n/useT";
import { useLocaleStore } from "@/lib/i18n/store";
import { useHomePage } from "./useHomePage";

export default function Home() {
  const { session, games, gamesLoading } = useHomePage();
  const t = useT("home");
  const locale = useLocaleStore((s) => s.locale);

  const QUICK_LINKS = [
    { href: routes.creatives, icon: GamesIcon, label: t("creativesLabel"), description: t("creativesDesc") },
    { href: routes.media, icon: ImageIcon, label: t("mediaLabel"), description: t("mediaDesc") },
    { href: routes.allGames, icon: LayersIcon, label: t("allGamesLabel"), description: t("allGamesDesc") },
  ];

  const greeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 11) return t("greetingMorning");
    if (hour < 14) return t("greetingNoon");
    if (hour < 18) return t("greetingAfternoon");
    return t("greetingEvening");
  };

  if (!session) return <PageLoading />;

  const isAdmin = session.user.role === "ADMIN";
  const firstName = session.user.name.trim().split(/\s+/).pop() ?? session.user.name;
  const todayLabel = new Date().toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <main className="flex w-full flex-1 flex-col gap-8 px-8 py-10">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-400 via-orange-500 to-amber-500 p-8 text-white shadow-lg shadow-orange-900/20">
        <div className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-16 right-24 h-40 w-40 rounded-full bg-white/10" />
        <p className="text-sm font-medium capitalize text-white/80">{todayLabel}</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">
          {greeting()}, {firstName}
        </h1>
        <p className="mt-2 max-w-xl text-sm text-white/90">{t("intro")}</p>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {QUICK_LINKS.map((item) => (
          <Link key={item.href} href={item.href}>
            <Card variant="outlined" padding="md" className="group flex h-full cursor-pointer items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
                <item.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">{item.label}</h3>
                  <ChevronRightIcon className="h-4 w-4 shrink-0 text-zinc-300 transition-transform group-hover:translate-x-0.5 group-hover:text-primary dark:text-zinc-700" />
                </div>
                <p className="mt-1 text-xs text-zinc-500">{item.description}</p>
              </div>
            </Card>
          </Link>
        ))}
        {isAdmin && (
          <Link href={routes.admin}>
            <Card variant="outlined" padding="md" className="group flex h-full cursor-pointer items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
                <ShieldIcon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">{t("adminLabel")}</h3>
                  <ChevronRightIcon className="h-4 w-4 shrink-0 text-zinc-300 transition-transform group-hover:translate-x-0.5 group-hover:text-primary dark:text-zinc-700" />
                </div>
                <p className="mt-1 text-xs text-zinc-500">{t("adminDesc")}</p>
              </div>
            </Card>
          </Link>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{t("yourGames")}</h2>
          <Link href={routes.creativeNew} className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
            <PlusIcon className="h-3.5 w-3.5" />
            {t("addGame")}
          </Link>
        </div>

        {gamesLoading && (
          <div className="flex justify-center py-10">
            <Spinner className="h-6 w-6" />
          </div>
        )}

        {!gamesLoading && games.length === 0 && (
          <EmptyState
            icon={<GamesIcon className="h-9 w-9" />}
            title={t("noGamesTitle")}
            description={t("noGamesDescription")}
            action={
              <Link href={routes.creativeNew} className="text-sm font-medium text-primary hover:underline">
                + {t("addGame")}
              </Link>
            }
          />
        )}

        {!gamesLoading && games.length > 0 && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {games.map((game) => (
              <Link key={game.id} href={routes.creative(game.id)}>
                <Card variant="outlined" padding="sm" className="flex cursor-pointer items-center gap-3">
                  <GameIcon game={game} className="h-10 w-10 rounded-lg text-sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">{game.name}</p>
                    <p className="truncate text-[11px] text-zinc-400">{game.slug}</p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
