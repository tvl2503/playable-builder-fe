"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";

import { Button, Dialog, Input, Select, Switch } from "@/components/common";
import {
  ArrowLeftIcon,
  LayersIcon,
  ReloadIcon,
  ShareIcon,
} from "@/components/icons";
import { PageLoading, Spinner } from "@/components/Spinner";
import { PlaygroundConfigForm } from "@/components/PlaygroundConfigForm";
import DeviceFrame from "@/components/Preview/DeviceFrame";
import EventLogOverlay from "@/components/Preview/EventLogOverlay";
import { routes } from "@/lib/routes";
import { useT } from "@/lib/i18n/useT";
import { useLocaleStore } from "@/lib/i18n/store";

import { useVariantEditorPage } from "./useVariantEditorPage";

export default function VariantEditorPage() {
  const {
    session,
    buildId,
    build,
    variant,
    config,
    setConfig,
    previewUrl,
    loadError,
    canEdit,
    canShare,
    saving,
    saveError,
    saved,
    handleSave,

    shareLink,
    sharing,
    shareError,
    handleCreateShareLink,
    handleRevokeShareLink,

    deviceId,
    setDeviceId,
    selectedDevice,
    previewDevices,
  } = useVariantEditorPage();

  const t = useT("variantEditor");
  const tc = useT("common");
  const locale = useLocaleStore((s) => s.locale);
  const dateLocale = locale === "vi" ? "vi-VN" : "en-US";

  const previewContainerRef = useRef<HTMLDivElement>(null);

  const [deviceScale, setDeviceScale] = useState(1);
  const [rotated, setRotated] = useState(false);
  const [reloadNonce, setReloadNonce] = useState(0);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  /**
   * Xoay màn = đổi thật kích thước canvas (hoán vị width/height), không phải chỉ transform: rotate()
   * phần khung hiển thị — vì content bên trong (game Cocos) cần đọc đúng kích thước mới lúc khởi động
   * để tự dàn lại layout theo hướng ngang, không phải thấy y hệt bản dọc nhưng bị vặn nghiêng đi.
   * iframe key bên dưới include `rotated` để ép remount (load lại) mỗi khi đổi hướng.
   */
  const previewDevice = rotated
    ? { ...selectedDevice, width: selectedDevice.height, height: selectedDevice.width }
    : selectedDevice;

  // ------------------------------------------------------------
  // Anim xoay (FLIP kỹ thuật cũ điển): rotateWrapperRef đã LUÔN render đúng kích thước mới (previewDevice)
  // ngay khi rotated đổi — không đợi animation nào. Effect này chỉ lo phần NHÌN như đang xoay: snap tức
  // thời (không transition) về góc xoay khiến box-mới-kích-thước trông y hệt box-cũ-kích-thước, rồi bật
  // lại transition và trả góc xoay về 0 — tạo cảm giác xoay mượt trong lúc bản chất kích thước đã đổi
  // xong từ đầu (để content bên trong load đúng kích thước canvas ngay, không đợi hết animation).
  // ------------------------------------------------------------

  const rotateWrapperRef = useRef<HTMLDivElement>(null);
  const prevRotatedRef = useRef(rotated);

  useLayoutEffect(() => {
    const wasRotated = prevRotatedRef.current;
    prevRotatedRef.current = rotated;

    const el = rotateWrapperRef.current;
    if (!el || wasRotated === rotated) return;

    const preSpinDeg = rotated ? 90 : -90;
    el.style.transition = "none";
    el.style.transform = `rotate(${preSpinDeg}deg)`;
    void el.offsetHeight; // ép reflow để trình duyệt chốt state trên trước khi bật lại transition
    el.style.transition = "transform 350ms ease";
    el.style.transform = "rotate(0deg)";
  }, [rotated]);

  const shareUrl = shareLink && typeof window !== "undefined" ? `${window.location.origin}${routes.share(shareLink.token)}` : null;

  const handleOpenShareDialog = () => {
    setShareDialogOpen(true);
    if (!shareLink) handleCreateShareLink();
  };

  const handleCopyShareUrl = async () => {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleRevokeAndClose = async () => {
    await handleRevokeShareLink();
    setShareDialogOpen(false);
  };

  // ------------------------------------------------------------
  // Auto scale device để luôn vừa vùng preview
  // ------------------------------------------------------------

  useEffect(() => {
    const element = previewContainerRef.current;

    if (!element) return;

    const updateScale = () => {
      const rect = element.getBoundingClientRect();

      // Khoảng trống xung quanh device
      const padding = 48;

      const availableWidth = rect.width - padding;
      const availableHeight = rect.height - padding;

      const scaleX = availableWidth / previewDevice.width;
      const scaleY = availableHeight / previewDevice.height;

      // Không scale lớn hơn 1 để preview không bị phóng to quá mức.
      const scale = Math.min(scaleX, scaleY, 1);

      setDeviceScale(Math.max(scale, 0.1));
    };

    updateScale();

    const observer = new ResizeObserver(updateScale);
    observer.observe(element);

    return () => observer.disconnect();
  }, [
    previewDevice.width,
    previewDevice.height,
    // previewContainerRef chỉ thật sự mount vào DOM khi previewUrl có giá trị ({previewUrl && (...)}) —
    // ref đổi từ null sang element KHÔNG tự kích hoạt effect chạy lại, nên phải thêm previewUrl vào đây,
    // nếu không lần đầu load trang effect bail ở `!element` và deviceScale kẹt ở 100% cho tới khi đổi device.
    previewUrl,
  ]);

  if (!session) {
    return <PageLoading />;
  }

  return (
    <main className="flex h-full min-h-0 flex-col gap-4 bg-zinc-50 px-6 py-5 dark:bg-black">

      {/* ------------------------------------------------------ */}
      {/* Header */}
      {/* ------------------------------------------------------ */}

      <div className="flex shrink-0 items-center justify-between">
        <div>
          <Link
            href={routes.build(buildId)}
            className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          >
            <ArrowLeftIcon className="h-3.5 w-3.5" />
            {build?.name ?? t("backToConcept")}
          </Link>

          <div className="mt-0.5 flex items-center gap-2">
            <LayersIcon className="h-5 w-5 text-primary" />

            <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              {variant?.name ?? t("variantFallback")}
            </h1>
          </div>
        </div>

        {(canEdit || canShare) && (
          <div className="flex items-center gap-3">
            {saved && (
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                {t("saved")}
              </span>
            )}

            {saveError && (
              <span className="text-xs text-red-600 dark:text-red-400">
                {saveError}
              </span>
            )}

            {canShare && (
              <Button type="button" variant="secondary" onClick={handleOpenShareDialog}>
                <ShareIcon className="h-4 w-4" />
                {t("share")}
              </Button>
            )}

            {canEdit && (
              <Button
                type="button"
                onClick={handleSave}
                disabled={!previewUrl}
                loading={saving}
              >
                {saving ? t("saving") : t("saveVariant")}
              </Button>
            )}
          </div>
        )}
      </div>


      {loadError && (
        <div className="shrink-0 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          {loadError}
        </div>
      )}

      {!previewUrl && !loadError && (
        <div className="flex min-h-0 flex-1 items-center justify-center">
          <Spinner className="h-8 w-8" />
        </div>
      )}

      {previewUrl && (
        <div className="flex min-h-0 flex-1 gap-5">

          <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">


            <div className="flex h-12 shrink-0 items-center gap-2 border-b border-zinc-200 bg-white px-3 dark:border-zinc-800 dark:bg-zinc-900">


              <Select compact value={deviceId} onChange={(e) => setDeviceId(e.target.value)}>
                {previewDevices.map((device) => (
                  <option key={device.id} value={device.id}>
                    {device.name}
                  </option>
                ))}
              </Select>

              {/* Resolution */}

              <span className="text-[11px] text-zinc-400">
                {rotated ? selectedDevice.height : selectedDevice.width} ×{" "}
                {rotated ? selectedDevice.width : selectedDevice.height}
              </span>

              <label className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                <span className={!rotated ? "text-zinc-700 dark:text-zinc-200" : undefined}>{t("portrait")}</span>
                <Switch checked={rotated} onChange={setRotated} />
                <span className={rotated ? "text-zinc-700 dark:text-zinc-200" : undefined}>{t("landscape")}</span>
              </label>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setReloadNonce((prev) => prev + 1)}
                title={t("reloadPreview")}
                className="text-zinc-400! hover:bg-zinc-100! hover:text-zinc-700! dark:hover:bg-zinc-800! dark:hover:text-zinc-200!"
              >
                <ReloadIcon className="h-4 w-4" />
              </Button>

              <div className="flex-1" />

              {/* Zoom */}

              <span className="text-[11px] tabular-nums text-zinc-400">
                {Math.round(deviceScale * 100)}%
              </span>

            </div>


            <div
              ref={previewContainerRef}
              className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden"
            >
              <EventLogOverlay key={`${previewUrl}-${selectedDevice.id}-${rotated}-${reloadNonce}`} />

              {/*
                previewDevice đã hoán vị width/height khi rotated — canvas/iframe được cấp đúng kích
                thước màn ngang thật ngay lập tức (không đợi animation). 2 lớp transform tách riêng:
                lớp ngoài scale-to-fit (%zoom, React re-render mượt theo deviceScale bình thường), lớp
                trong rotate do rotateWrapperRef's useLayoutEffect điều khiển (xem effect phía trên) —
                tách riêng để đổi % zoom không vô tình kích hoạt lại animation xoay và ngược lại.
              */}

              <div
                style={{
                  transform: `scale(${deviceScale})`,
                  transformOrigin: "center center",
                  transition: "transform 300ms ease",
                }}
              >
                <div
                  ref={rotateWrapperRef}
                  style={{
                    width: previewDevice.width,
                    height: previewDevice.height,
                    transform: "rotate(0deg)",
                    transformOrigin: "center center",
                  }}
                >
                  <DeviceFrame device={previewDevice}>
                    <iframe
                      // rotated trong key -> ép remount lúc đổi hướng, để content bên trong (Cocos) load
                      // lại từ đầu và tự đọc đúng kích thước canvas mới, không phải thấy y hệt bản cũ.
                      // reloadNonce -> ép remount khi bấm nút reload thủ công, dù url/device/hướng không đổi.
                      key={`${previewUrl}-${selectedDevice.id}-${rotated}-${reloadNonce}`}
                      src={previewUrl}
                      title={t("previewIframeTitle")}
                      sandbox="allow-scripts allow-same-origin"
                      style={{
                        display: "block",
                        width: previewDevice.width,
                        height: previewDevice.height,
                        border: "none",
                      }}
                    />
                  </DeviceFrame>
                </div>
              </div>
            </div>
          </div>

          <div className="flex w-100 shrink-0 flex-col gap-3 overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm shadow-zinc-900/5 dark:border-zinc-800 dark:bg-zinc-900">

            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              {t("editPanelHeading")}
            </h2>

            {!canEdit && (
              <p className="rounded-lg bg-amber-50 px-2.5 py-1.5 text-[11px] text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                {t("readOnlyNotice")}
              </p>
            )}

            <PlaygroundConfigForm
              fieldsRegistry={
                build?.fieldsRegistry ?? null
              }
              config={config}
              onChange={setConfig}
              readOnly={!canEdit}
              token={session.accessToken}
              gameId={build?.gameId ?? ""}
            />
          </div>
        </div>
      )}

      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen} title={t("shareDialogTitle")}>
        {sharing && !shareLink && (
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <Spinner className="h-4 w-4" />
            {t("creatingLink")}
          </div>
        )}

        {shareError && <p className="text-sm text-red-600 dark:text-red-400">{shareError}</p>}

        {shareUrl && (
          <div className="flex flex-col gap-3">
            <p className="text-xs text-zinc-500">
              {t("shareDescription", {
                name: variant?.name ?? "",
                expiry: shareLink?.expiresAt
                  ? t("expiresOn", { date: new Date(shareLink.expiresAt).toLocaleString(dateLocale) })
                  : t("neverExpires"),
              })}
            </p>
            <div className="flex items-center gap-2">
              <Input readOnly value={shareUrl} onFocus={(e) => e.target.select()} className="flex-1 font-mono text-xs" />
              <Button type="button" variant="outline" size="sm" onClick={handleCopyShareUrl}>
                {linkCopied ? tc("copied") : tc("copy")}
              </Button>
            </div>
            <Button type="button" variant="danger" size="sm" onClick={handleRevokeAndClose} loading={sharing} className="self-start">
              {t("revokeLink")}
            </Button>
          </div>
        )}
      </Dialog>
    </main>
  );
}