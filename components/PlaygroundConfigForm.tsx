"use client";

import { useState } from "react";
import useSWR from "swr";
import { api, type MediaKind, type PlaygroundConfig, type PlaygroundFieldsRegistry, type PlaygroundFieldType, type PlaygroundMatch } from "@/lib/api";
import { AudioPlayButton } from "@/components/AudioPlayButton";
import { Button, Checkbox, ColorInput, Input, Slider } from "@/components/common";
import { MediaPicker } from "@/components/MediaPicker";
import { ImageIcon, MusicIcon } from "@/components/icons";
import { swrKeys } from "@/lib/api/swr-keys";
import { useT } from "@/lib/i18n/useT";
import { usePlaygroundConfigForm } from "./usePlaygroundConfigForm";

interface Props {
  fieldsRegistry: PlaygroundFieldsRegistry | null;
  config: PlaygroundConfig;
  onChange: (config: PlaygroundConfig) => void;
  readOnly?: boolean;
  /** Cần cho field @playgroundAsset: mở MediaPicker (gọi API kho Media) + biết upload asset mới vào game nào. */
  token: string;
  gameId: string;
}

/** Build cũ scan trước khi có fieldType (fieldsRegistry cũ lưu trong DB không có field này) — đoán lại y hệt logic phía backend, xem resolvePlaygroundFieldType() ở playgroundFields.ts. */
function inferFieldType(value: unknown): PlaygroundFieldType {
  if (typeof value === "boolean") return "boolean";
  if (typeof value === "number") return Number.isInteger(value) ? "integer" : "float";
  return "string";
}

/**
 * `current` là hex string "#rrggbb" khi đã có override (do chính input color này ghi), nhưng khi CHƯA có
 * override thì `getValue()` fallback về `defaultLiteral.value` — với field "color" đó là `{r,g,b,a}` (0-255,
 * xem getColorLiteralLocation() ở playgroundFields.ts, default Cocos `new Color(r,g,b,a)`), không phải hex —
 * phải tự quy đổi ở đây để ô color hiển thị đúng màu gốc ngay từ đầu, không phải luôn `#000000`.
 */
function colorValueToHex(value: unknown): string {
  if (typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value)) return value;
  if (value && typeof value === "object" && "r" in value && "g" in value && "b" in value) {
    const { r, g, b } = value as { r: number; g: number; b: number };
    const toHex = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }
  return "#000000";
}

/** Khớp ASSET_RUNTIME_KINDS ở playable-builder/src/pipeline/playgroundFields.ts — 2 loại duy nhất __pgApplyAsset hỗ trợ. */
function assetKindToMediaKind(assetKind: string | null): MediaKind | null {
  if (assetKind === "spriteFrame") return "IMAGE";
  if (assetKind === "audioClip") return "AUDIO";
  return null;
}

export function PlaygroundConfigForm({ fieldsRegistry, config, onChange, readOnly, token, gameId }: Props) {
  const t = useT("playgroundConfigForm");
  const { groups, setValue, clearValue, getValue } = usePlaygroundConfigForm({ fieldsRegistry, config, onChange });

  if (groups.size === 0) {
    return <p className="text-xs leading-relaxed text-zinc-500">{t("noFields")}</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {[...groups].map(([group, matches]) => (
        <div key={group} className="flex flex-col gap-2 rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800/50">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400">{group}</div>
          {matches.map((match) => {
            const current = getValue(group, match);

            if (match.kind === "asset") {
              return (
                <div key={match.propName} className="flex items-center justify-between gap-2 text-xs">
                  <span className="text-zinc-600 dark:text-zinc-400">{match.propName}</span>
                  <AssetFieldInput
                    token={token}
                    gameId={gameId}
                    assetKind={match.assetKind}
                    mediaId={typeof current === "string" ? current : undefined}
                    readOnly={readOnly}
                    onChange={(mediaId) => setValue(group, match.propName, mediaId)}
                    onClear={() => clearValue(group, match.propName)}
                  />
                </div>
              );
            }

            const typeInfo = match.fieldType ?? { type: inferFieldType(match.defaultLiteral?.value) };
            return (
              <label key={match.propName} className="flex items-center justify-between gap-2 text-xs">
                <span className="text-zinc-600 dark:text-zinc-400">{match.propName}</span>
                <FieldInput
                  typeInfo={typeInfo}
                  current={current}
                  readOnly={readOnly}
                  onChange={(value) => setValue(group, match.propName, value)}
                />
              </label>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function AssetFieldInput({
  token,
  gameId,
  assetKind,
  mediaId,
  readOnly,
  onChange,
  onClear,
}: {
  token: string;
  gameId: string;
  assetKind: string | null;
  mediaId: string | undefined;
  readOnly?: boolean;
  onChange: (mediaId: string) => void;
  onClear: () => void;
}) {
  const t = useT("playgroundConfigForm");
  const [pickerOpen, setPickerOpen] = useState(false);
  const mediaKind = assetKindToMediaKind(assetKind);
  const { data: asset } = useSWR(mediaId ? swrKeys.mediaItem(mediaId) : null, () => api.getMedia(token, mediaId!));

  if (!mediaKind) {
    return <span className="text-[11px] text-zinc-400">{t("unsupportedAssetKind", { kind: assetKind ?? "?" })}</span>;
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded border border-zinc-200 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900">
        {!mediaId ? (
          mediaKind === "IMAGE" ? (
            <ImageIcon className="h-4 w-4 text-zinc-300 dark:text-zinc-700" />
          ) : (
            <MusicIcon className="h-4 w-4 text-zinc-300 dark:text-zinc-700" />
          )
        ) : asset ? (
          mediaKind === "IMAGE" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={asset.url} alt="" className="h-full w-full object-contain" />
          ) : (
            <AudioPlayButton src={asset.url} />
          )
        ) : (
          <ImageIcon className="h-4 w-4 animate-pulse text-zinc-300 dark:text-zinc-700" />
        )}
      </div>

      {!readOnly && (
        <Button type="button" variant="outline" size="sm" onClick={() => setPickerOpen(true)}>
          {mediaId ? t("change") : t("choose")}
        </Button>
      )}
      {!readOnly && mediaId && (
        <Button type="button" variant="ghost" size="sm" className="text-zinc-400!" onClick={onClear}>
          {t("clear")}
        </Button>
      )}

      <MediaPicker open={pickerOpen} onOpenChange={setPickerOpen} token={token} gameId={gameId} kind={mediaKind} onSelect={onChange} />
    </div>
  );
}

function FieldInput({
  typeInfo,
  current,
  readOnly,
  onChange,
}: {
  typeInfo: NonNullable<PlaygroundMatch["fieldType"]>;
  current: unknown;
  readOnly?: boolean;
  onChange: (value: string | number | boolean) => void;
}) {
  const { type, slider, min, max, step } = typeInfo;

  if (type === "boolean") {
    return <Checkbox disabled={readOnly} checked={Boolean(current)} onChange={(e) => onChange(e.target.checked)} />;
  }

  if (type === "color") {
    const hex = colorValueToHex(current);
    return <ColorInput className="w-36" disabled={readOnly} value={hex} onChange={(e) => onChange(e.target.value)} />;
  }

  if (type === "integer" || type === "float" || type === "number") {
    const numericStep = step ?? (type === "integer" ? 1 : type === "float" ? 0.01 : "any");
    const numericValue = Number(current);

    if (slider && typeof min === "number" && typeof max === "number") {
      return (
        <div className="flex items-center gap-2">
          <Slider
            disabled={readOnly}
            min={min}
            max={max}
            step={numericStep}
            value={numericValue}
            onChange={(e) => onChange(e.target.valueAsNumber)}
            className="w-48"
          />
          <span className="w-10 text-right tabular-nums text-zinc-500">{numericValue}</span>
        </div>
      );
    }

    return (
      <Input
        type="number"
        disabled={readOnly}
        min={min}
        max={max}
        step={numericStep}
        value={numericValue}
        onChange={(e) => {
          const v = e.target.valueAsNumber;
          if (!Number.isNaN(v)) onChange(v);
        }}
        className="w-24"
      />
    );
  }

  // "string"
  return <Input type="text" disabled={readOnly} value={String(current ?? "")} onChange={(e) => onChange(e.target.value)} className="w-32" />;
}
