"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, Card, Checkbox, Input, Select } from "@/components/common";
import { ArrowLeftIcon, UploadCloudIcon } from "@/components/icons";
import { PageLoading } from "@/components/Spinner";
import { formatBytes } from "@/lib/format";
import { routes } from "@/lib/routes";
import { useT } from "@/lib/i18n/useT";
import { useNewConceptPage, type PngMode } from "./useNewConceptPage";

export default function NewConceptPage() {
  const t = useT("newConcept");
  const PNG_MODES: { value: PngMode; label: string }[] = [
    { value: "off", label: t("pngModeOff") },
    { value: "palette", label: t("pngModePalette") },
    { value: "lossy", label: t("pngModeLossy") },
    { value: "webp", label: t("pngModeWebp") },
  ];
  const {
    session,
    gameId,
    name,
    setName,
    file,
    setFile,
    uploading,
    error,
    handleSubmit,
    pngMode,
    setPngMode,
    pngImages,
    isScanningZip,
    togglePngCompress,
    toggleAllPngCompress,
  } = useNewConceptPage();

  const [isDraggingFile, setIsDraggingFile] = useState(false);

  if (!session) return <PageLoading />;

  const compressCount = pngImages.filter((img) => img.compress).length;

  return (
    <main className="flex w-full flex-1 flex-col gap-6 px-8 py-10">
      <div>
        <Link
          href={routes.creative(gameId)}
          className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
        >
          <ArrowLeftIcon className="h-3.5 w-3.5" />
          {t("back")}
        </Link>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">{t("title")}</h1>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <Card padding="lg" className="flex w-full flex-col gap-4 lg:max-w-lg">
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-zinc-700 dark:text-zinc-300">{t("conceptNameLabel")}</span>
            <Input required value={name} onChange={(e) => setName(e.target.value)} placeholder={t("conceptNamePlaceholder")} />
          </label>

          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium text-zinc-700 dark:text-zinc-300">
              {t("zipFieldLabel")} <code className="rounded bg-zinc-100 px-1 py-0.5 text-xs dark:bg-zinc-800">web-mobile</code>
            </span>
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
                const dropped = e.dataTransfer.files?.[0];
                if (dropped) setFile(dropped);
              }}
              className={`flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors ${
                isDraggingFile
                  ? "border-primary bg-primary-soft"
                  : file
                    ? "border-primary/40 bg-primary-soft"
                    : "border-zinc-300 hover:border-zinc-400 dark:border-zinc-700 dark:hover:border-zinc-600"
              }`}
            >
              <UploadCloudIcon className={`h-8 w-8 ${file ? "text-primary" : "text-zinc-400"}`} />
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                {file ? file.name : <>{t("dropOr")} <span className="font-medium text-primary">{t("chooseFile")}</span></>}
              </span>
              <Input type="file" accept=".zip" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="hidden" />
            </label>
          </label>

          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-zinc-700 dark:text-zinc-300">{t("pngCompressLabel")}</span>
            <Select value={pngMode} onChange={(e) => setPngMode(e.target.value as PngMode)}>
              {PNG_MODES.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </Select>
          </label>

          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

          <Button type="submit" loading={uploading} disabled={!file} className="mt-2 self-start">
            {uploading ? t("uploading") : t("createConcept")}
          </Button>
        </Card>

        {(isScanningZip || pngImages.length > 0) && pngMode !== "off" && (
          <Card padding="lg" className="flex w-full flex-col gap-3 lg:flex-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {isScanningZip
                  ? t("scanningZip")
                  : t("pngImagesCount", { compressed: compressCount, total: pngImages.length })}
              </span>
              {pngImages.length > 0 && (
                <div className="flex items-center gap-2 text-xs">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => toggleAllPngCompress(true)}
                    className="h-auto! rounded-none! p-0! text-xs! text-primary! hover:bg-transparent! hover:underline"
                  >
                    {t("selectAll")}
                  </Button>
                  <span className="text-zinc-300 dark:text-zinc-700">/</span>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => toggleAllPngCompress(false)}
                    className="h-auto! rounded-none! p-0! text-xs! text-primary! hover:bg-transparent! hover:underline"
                  >
                    {t("deselectAll")}
                  </Button>
                </div>
              )}
            </div>

            {pngImages.length > 0 && (
              <div className="grid max-h-[560px] grid-cols-[repeat(auto-fill,minmax(110px,1fr))] gap-2.5 overflow-y-auto pr-1">
                {pngImages.map((img) => (
                  <label
                    key={img.path}
                    className={`flex cursor-pointer flex-col items-center gap-1 rounded-lg border p-2 text-center transition-colors ${
                      img.compress
                        ? "border-primary/40 bg-primary-soft"
                        : "border-zinc-200 hover:border-zinc-300 dark:border-zinc-700 dark:hover:border-zinc-600"
                    }`}
                  >
                    <div className="flex w-full items-center justify-between">
                      <Checkbox checked={img.compress} onChange={() => togglePngCompress(img.path)} className="h-3.5! w-3.5!" />
                      <span className="text-[10px] text-zinc-400">{formatBytes(img.size)}</span>
                    </div>
                    <div className="flex aspect-square w-full items-center justify-center overflow-hidden rounded bg-[repeating-conic-gradient(#8883_0%_25%,transparent_0%_50%)] bg-[length:10px_10px]">
                      {img.dataUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={img.dataUrl} alt="" loading="lazy" className="h-full w-full object-contain" />
                      )}
                    </div>
                    <span className="w-full truncate text-[11px] text-zinc-600 dark:text-zinc-400">{img.path.split("/").pop()}</span>
                  </label>
                ))}
              </div>
            )}
          </Card>
        )}
      </form>
    </main>
  );
}
