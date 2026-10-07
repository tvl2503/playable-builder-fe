"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";
import {
  api,
  fetchArtifactBlob,
  type ApiSharedPreviewLink,
  type PlaygroundConfig,
} from "@/lib/api";
import { useRequireAuth } from "@/lib/auth/use-require-auth";
import {
  injectPlaygroundConfig,
  type PlaygroundConfigOverride,
} from "@/lib/cocos/playgroundConfig";
import { can, canOnResource } from "@/lib/auth/permissions";
import { swrKeys } from "@/lib/api/swr-keys";
import { routes } from "@/lib/routes";
import { useT } from "@/lib/i18n/useT";

/** Debounce trước khi reload preview — gõ số/text không bị giật lại mỗi phím. */
const PREVIEW_DEBOUNCE_MS = 500;

export type PreviewDevice = {
  id: string;
  name: string;
  width: number;
  height: number;
  radius: number;
  type: "phone" | "tablet";
};

export const PREVIEW_DEVICES: PreviewDevice[] = [
  {
    id: "iphone-x-xs",
    name: "iPhone X/XS",
    width: 375,
    height: 812,
    type: "phone",
    radius: 38,
  },
  {
    id: "iphone-6-7-8",
    name: "iPhone 6/7/8",
    width: 375,
    height: 667,
    type: "phone",
    radius: 20,
  },
  {
    id: "ipad",
    name: "iPad",
    width: 510,
    height: 682,
    type: "tablet",
    radius: 32,
  },
];

function configToOverrides(
  config: PlaygroundConfig,
): PlaygroundConfigOverride[] {
  const overrides: PlaygroundConfigOverride[] = [];

  for (const [groupKey, fields] of Object.entries(config)) {
    for (const [propName, value] of Object.entries(fields)) {
      overrides.push({
        groupKey,
        propName,
        value,
      });
    }
  }

  return overrides;
}

export function useVariantEditorPage() {
  const t = useT("variantEditor");
  const { id: buildId, variantId } = useParams<{
    id: string;
    variantId: string;
  }>();

  const session = useRequireAuth();
  const router = useRouter();

  // ------------------------------------------------------------
  // Device preview
  // ------------------------------------------------------------

  const [deviceId, setDeviceId] = useState(PREVIEW_DEVICES[0].id);

  const selectedDevice =
    PREVIEW_DEVICES.find((device) => device.id === deviceId) ??
    PREVIEW_DEVICES[0];

  // ------------------------------------------------------------
  // Build / Variant
  // ------------------------------------------------------------

  const { data: build, error: buildError } = useSWR(
    session ? swrKeys.build(buildId) : null,
    () => api.getBuild(session!.accessToken, buildId),
  );

  const { data: variant, mutate: mutateVariant } = useSWR(
    session ? swrKeys.variant(variantId) : null,
    () => api.getVariant(session!.accessToken, variantId),
  );

  const [baseHtml, setBaseHtml] = useState<string | null>(null);
  const [config, setConfig] = useState<PlaygroundConfig>({});
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [shareLink, setShareLink] = useState<ApiSharedPreviewLink | null>(null);
  const [sharing, setSharing] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);

  // mediaId -> presigned URL, cache trong suốt phiên sửa biến thể này — khỏi gọi lại GET /media/:id
  // mỗi lần debounce-preview bắn trong khi field asset đó chưa đổi.
  const mediaUrlCache = useRef<Map<string, string>>(new Map());

  // Seed config từ variant đúng 1 lần mỗi khi ĐỔI variant.
  useEffect(() => {
    if (variant) {
      setConfig(variant.config);
    }
  }, [variant?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Tải bản single-html gốc để demo preview.
  useEffect(() => {
    if (!session || !build) return;

    if (buildError) {
      setLoadError(
        buildError instanceof Error ? buildError.message : String(buildError),
      );
      return;
    }

    let cancelled = false;

    const single = build.artifacts.find((a) => a.channelName === "single");

    if (build.status !== "SUCCESS" || !single) {
      setLoadError(t("noPreviewAvailable"));
      return;
    }

    fetchArtifactBlob(session.accessToken, buildId, single.id)
      .then((blob) => blob.text())
      .then((text) => {
        if (!cancelled) {
          setBaseHtml(text);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setLoadError(e instanceof Error ? e.message : String(e));
        }
      });

    return () => {
      cancelled = true;
    };
    // `t` cố tình không đưa vào deps — đổi identity mỗi render (useT không memo theo locale), đưa vào
    // sẽ làm effect fetch lại single-html mỗi lần re-render thay vì chỉ khi session/build/buildId đổi.
  }, [session, build, buildError, buildId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Mỗi lần config đổi -> vá lại preview. Field @playgroundAsset lưu MediaAsset.id trong config (không
  // phải URL) — phải resolve id -> presigned URL (GET /media/:id) trước khi inject, vì __pgApplyAsset
  // ở engine chỉ biết fetch() 1 URL/data: URI, không biết gì về id trong kho Media của tool này.
  useEffect(() => {
    if (!baseHtml) return;
    let cancelled = false;

    const timer = setTimeout(async () => {
      const assetKeys = new Set(
        (build?.fieldsRegistry?.matches ?? [])
          .filter((m) => m.kind === "asset")
          .map((m) => `${m.options.section || m.className}::${m.propName}`),
      );

      const resolved = await Promise.all(
        configToOverrides(config).map(async (override) => {
          const key = `${override.groupKey}::${override.propName}`;
          if (!assetKeys.has(key) || typeof override.value !== "string" || !session) return override;

          const mediaId = override.value;
          let url = mediaUrlCache.current.get(mediaId);
          if (!url) {
            try {
              const asset = await api.getMedia(session.accessToken, mediaId);
              url = asset.url;
              mediaUrlCache.current.set(mediaId, url);
            } catch {
              return null; // asset bị xoá/lỗi tải -> bỏ override, giữ nguyên asset gốc của engine
            }
          }
          return { ...override, value: url };
        }),
      );

      if (cancelled) return;
      const overrides = resolved.filter((o): o is PlaygroundConfigOverride => o !== null);
      const html = injectPlaygroundConfig(baseHtml, overrides);

      const blob = new Blob([html], {
        type: "text/html",
      });

      setPreviewUrl((old) => {
        if (old) {
          URL.revokeObjectURL(old);
        }

        return URL.createObjectURL(blob);
      });
    }, PREVIEW_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [baseHtml, config, build?.fieldsRegistry, session]);

  const canEdit =
    !!variant &&
    canOnResource(
      session?.permissions ?? null,
      "variant",
      "edit",
      variant.createdById,
      session?.user.id,
    );
  const canShare = can(session?.permissions ?? null, "share");

  const handleCreateShareLink = async () => {
    if (!session) return;
    setSharing(true);
    setShareError(null);
    try {
      const link = await api.createVariantShareLink(
        session.accessToken,
        variantId,
      );
      setShareLink(link);
    } catch (e) {
      setShareError(e instanceof Error ? e.message : String(e));
    } finally {
      setSharing(false);
    }
  };

  const handleRevokeShareLink = async () => {
    if (!session) return;
    setSharing(true);
    setShareError(null);
    try {
      await api.revokeVariantShareLink(session.accessToken, variantId);
      setShareLink(null);
    } catch (e) {
      setShareError(e instanceof Error ? e.message : String(e));
    } finally {
      setSharing(false);
    }
  };

  const handleSave = async () => {
    if (!session) return;

    setSaving(true);
    setSaveError(null);
    setSaved(false);

    try {
      const updated = await api.updateVariantConfig(
        session.accessToken,
        variantId,
        config,
      );

      mutateVariant(updated, {
        revalidate: false,
      });

      setSaved(true);
      router.push(routes.build(buildId));
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  };

  return {
    session,
    buildId,
    build: build ?? null,
    variant: variant ?? null,

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

    // Device preview
    deviceId,
    setDeviceId,
    selectedDevice,
    previewDevices: PREVIEW_DEVICES,
  };
}
