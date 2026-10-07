"use client";

import { Button, Card, Checkbox, Combobox, Input, Select } from "@/components/common";
import { DriveIcon, ExternalLinkIcon, LayersIcon, ShieldIcon, TrashIcon, UnityIcon, UploadCloudIcon } from "@/components/icons";
import { PageLoading } from "@/components/Spinner";
import { formatBytes } from "@/lib/format";
import { LOCALIZE_OPTIONS } from "@/constants/luna";
import { useT } from "@/lib/i18n/useT";
import { useUnityPlayworksPage } from "./useUnityPlayworksPage";

export default function UnityPlayworksPage() {
  const t = useT("unityPlayworks");

  const FEATURES = [
    { Icon: LayersIcon, title: t("featureMultiNetworkTitle"), desc: t("featureMultiNetworkDesc") },
    { Icon: DriveIcon, title: t("featureAutoFolderTitle"), desc: t("featureAutoFolderDesc") },
    { Icon: ShieldIcon, title: t("featureOwnAccountTitle"), desc: t("featureOwnAccountDesc") },
  ];

  const {
    session,
    games,
    selectedGame,
    gameId,
    setGameId,
    idea,
    setIdea,
    pa,
    setPa,
    localize,
    setLocalize,
    isGetPaLuna,
    setIsGetPaLuna,
    file,
    setFile,
    clearFile,
    isDragging,
    dragHandlers,
    isUploading,
    progress,
    error,
    successMessage,
    handleSubmit,
  } = useUnityPlayworksPage();

  if (!session) return <PageLoading />;

  return (
    <main className="flex w-full flex-1 justify-center px-6 py-10 sm:px-8">
      <div className="flex w-full max-w-4xl flex-col gap-8">
        {/* Hero */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-orange-600 shadow-lg shadow-orange-900/25">
            <UnityIcon className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{t("heading")}</h1>
            <p className="mx-auto mt-1.5 max-w-md text-sm text-zinc-500">{t("subheading")}</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          {/* Side: features + selected game preview */}
          <div className="flex flex-col gap-4">
            <Card padding="md" className="flex flex-col gap-4 border-primary/10 bg-gradient-to-b from-primary-soft to-transparent">
              {FEATURES.map((f) => (
                <div key={f.title} className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white shadow-sm dark:bg-zinc-800">
                    <f.Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">{f.title}</p>
                    <p className="text-xs leading-relaxed text-zinc-500">{f.desc}</p>
                  </div>
                </div>
              ))}
            </Card>

            {selectedGame && (
              <Card padding="md" className="flex flex-col gap-3">
                <div className="flex items-center gap-2.5">
                  {selectedGame.iconUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={selectedGame.iconUrl} alt="" className="h-9 w-9 shrink-0 rounded-lg object-cover" />
                  ) : (
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-sm font-medium text-zinc-500 dark:bg-zinc-800">
                      {selectedGame.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-zinc-800 dark:text-zinc-100">{selectedGame.name}</p>
                    <p className="truncate text-xs text-zinc-500">{selectedGame.packageName}</p>
                  </div>
                </div>
                {selectedGame.driveUrl ? (
                  <a
                    href={selectedGame.driveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary-hover"
                  >
                    <DriveIcon className="h-3.5 w-3.5" />
                    {t("openDriveFolder")}
                    <ExternalLinkIcon className="h-3 w-3" />
                  </a>
                ) : (
                  <p className="text-xs font-medium text-amber-600 dark:text-amber-400">{t("noDriveLink")}</p>
                )}
              </Card>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <Card padding="lg" className="flex w-full flex-col gap-5">
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium text-zinc-700 dark:text-zinc-300">{t("selectGameLabel")}</span>
                <Combobox
                  placeholder={t("selectGamePlaceholder")}
                  emptyText={t("selectGameEmpty")}
                  value={gameId}
                  onChange={setGameId}
                  options={games.map((g) => ({
                    value: g.id,
                    label: g.shortName ? `${g.shortName} — ${g.name}` : g.name,
                    sublabel: g.packageName,
                    iconUrl: g.iconUrl,
                  }))}
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-1.5 text-sm">
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">{t("ideaLabel")}</span>
                  <Input required value={idea} onChange={(e) => setIdea(e.target.value)} placeholder={t("ideaPlaceholder")} />
                </label>

                <label className="flex flex-col gap-1.5 text-sm">
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">{t("paLabel")}</span>
                  <Input value={pa} onChange={(e) => setPa(e.target.value)} placeholder={t("paPlaceholder")} disabled={isGetPaLuna} />
                </label>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox checked={isGetPaLuna} onChange={(e) => setIsGetPaLuna(e.target.checked)} />
                  <span className="text-zinc-600 dark:text-zinc-400">{t("getPaFromFileName")}</span>
                </label>

                <label className="flex items-center gap-2 text-sm">
                  <span className="shrink-0 font-medium text-zinc-700 dark:text-zinc-300">{t("localizeLabel")}</span>
                  <Select value={localize} onChange={(e) => setLocalize(e.target.value)} className="min-w-[160px]">
                    {LOCALIZE_OPTIONS.map((l) => (
                      <option key={l.value} value={l.value}>
                        {l.label}
                      </option>
                    ))}
                  </Select>
                </label>
              </div>

              <div className="h-px bg-zinc-100 dark:bg-zinc-800" />

              <label className="flex flex-col gap-2 text-sm">
                <span className="font-medium text-zinc-700 dark:text-zinc-300">{t("fileLabel")}</span>

                {file ? (
                  <div className="flex items-center gap-3 rounded-xl border border-primary/30 bg-primary-soft px-4 py-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm dark:bg-zinc-800">
                      <UploadCloudIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-zinc-800 dark:text-zinc-100">{file.name}</p>
                      <p className="text-xs text-zinc-500">{formatBytes(file.size)}</p>
                    </div>
                    <Button type="button" variant="ghost" size="icon" onClick={clearFile} title={t("removeFile")} className="shrink-0 text-zinc-400! hover:text-red-500!">
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <label
                    {...dragHandlers}
                    className={`flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors ${
                      isDragging
                        ? "border-primary bg-primary-soft"
                        : "border-zinc-300 hover:border-zinc-400 dark:border-zinc-700 dark:hover:border-zinc-600"
                    }`}
                  >
                    <UploadCloudIcon className="h-8 w-8 text-zinc-400" />
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">
                      {t("dropHint")} <span className="font-medium text-primary">{t("dropHintChooseFile")}</span>
                    </span>
                    <span className="text-xs text-zinc-400">{t("dropHintTypes")}</span>
                    <Input
                      type="file"
                      accept=".html,.zip"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) setFile(f);
                      }}
                      className="hidden"
                    />
                  </label>
                )}
              </label>

              {progress && (
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <span>
                      {t("uploading")} <span className="font-medium text-primary">{progress.networkName}</span>
                    </span>
                    <span className="tabular-nums">
                      {progress.current} / {progress.total}
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-orange-500 transition-[width] duration-300"
                      style={{ width: `${(progress.current / progress.total) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {error && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400">{error}</p>
              )}
              {successMessage && !isUploading && (
                <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                  {successMessage}
                </p>
              )}

              <Button type="submit" size="lg" loading={isUploading} disabled={!file}>
                <UploadCloudIcon className="h-4 w-4" />
                {isUploading ? t("uploadingButton") : t("uploadToDrive")}
              </Button>
            </Card>
          </form>
        </div>
      </div>
    </main>
  );
}
