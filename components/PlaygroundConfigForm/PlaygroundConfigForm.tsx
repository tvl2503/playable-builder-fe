"use client";

import { useState, type ReactNode } from "react";
import useSWR from "swr";
import { Collapsible } from "radix-ui";
import {
  api,
  type MediaKind,
  type PlaygroundConfig,
  type PlaygroundFieldsRegistry,
  type PlaygroundFieldType,
  type PlaygroundMatch,
  type PlaygroundVecValue,
} from "@/lib/api";
import { AudioPlayButton } from "@/components/AudioPlayButton";
import { Button, Card, ColorInput, Input, NumberInput, Slider, Switch } from "@/components/common";
import { MediaPicker } from "@/components/MediaPicker";
import { ChevronRightIcon, ImageIcon, MusicIcon } from "@/components/icons";
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
  /** Xem usePlaygroundConfigForm.ts's doc comment — giá trị thực tế lúc game khởi động, đọc lại từ preview iframe. */
  resolvedDefaults?: PlaygroundConfig;
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

export function PlaygroundConfigForm({ fieldsRegistry, config, onChange, readOnly, token, gameId, resolvedDefaults }: Props) {
  const t = useT("playgroundConfigForm");
  const { groups, setValue, clearValue, getValue } = usePlaygroundConfigForm({ fieldsRegistry, config, onChange, resolvedDefaults });

  if (groups.size === 0) {
    return <p className="text-xs leading-relaxed text-zinc-500">{t("noFields")}</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {[...groups].map(([group, matches]) => (
        <ConfigGroupCard key={group} group={group}>
          {matches.map((match) => {
            const current = getValue(group, match);

            if (match.kind === "asset") {
              return (
                <AssetFieldInput
                  key={match.propName}
                  label={match.propName}
                  token={token}
                  gameId={gameId}
                  assetKind={match.assetKind}
                  mediaId={typeof current === "string" ? current : undefined}
                  readOnly={readOnly}
                  onChange={(mediaId) => setValue(group, match.propName, mediaId)}
                  onClear={() => clearValue(group, match.propName)}
                />
              );
            }

            const typeInfo = match.fieldType ?? { type: inferFieldType(match.defaultLiteral?.value) };

            if (typeInfo.type === "vec2" || typeInfo.type === "vec3" || typeInfo.type === "vec4") {
              return (
                <VecFieldInput
                  key={match.propName}
                  label={match.propName}
                  size={typeInfo.type === "vec2" ? 2 : typeInfo.type === "vec3" ? 3 : 4}
                  current={current}
                  readOnly={readOnly}
                  onChange={(value) => setValue(group, match.propName, value)}
                />
              );
            }

            return (
              <label
                key={match.propName}
                className="flex items-center gap-2 rounded-lg px-1.5 py-1 text-xs hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
              >
                <span className="min-w-0 flex-1 truncate text-zinc-600 dark:text-zinc-400" title={match.propName}>
                  {match.propName}
                </span>
                <div className="shrink-0">
                  <FieldInput
                    typeInfo={typeInfo}
                    current={current}
                    readOnly={readOnly}
                    onChange={(value) => setValue(group, match.propName, value)}
                  />
                </div>
              </label>
            );
          })}
        </ConfigGroupCard>
      ))}
    </div>
  );
}

/** 1 nhóm (section) playgroundConfig — đóng/mở riêng từng cái, mặc định mở sẵn. */
function ConfigGroupCard({ group, children }: { group: string; children: ReactNode }) {
  const [open, setOpen] = useState(true);

  return (
    <Card padding="sm">
      <Collapsible.Root open={open} onOpenChange={setOpen}>
        <Collapsible.Trigger asChild>
          <button
            type="button"
            className="flex w-full cursor-pointer items-center gap-2 rounded-lg py-2.5 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
          >
            <span className="h-3.5 w-1 shrink-0 rounded-full bg-primary" />
            <h3 className="min-w-0 flex-1 truncate text-[11px] font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-200">
              {group}
            </h3>
            <ChevronRightIcon
              className={`h-3.5 w-3.5 shrink-0 text-zinc-400 transition-transform ${open ? "rotate-90" : ""}`}
            />
          </button>
        </Collapsible.Trigger>
        <Collapsible.Content className="flex flex-col gap-1 border-t border-zinc-100 mt-2 pt-1.5 dark:border-zinc-800">
          {children}
        </Collapsible.Content>
      </Collapsible.Root>
    </Card>
  );
}

function AssetFieldInput({
  label,
  token,
  gameId,
  assetKind,
  mediaId,
  readOnly,
  onChange,
  onClear,
}: {
  label: string;
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
    return (
      <div className="flex items-center gap-2 rounded-lg px-1.5 py-1 text-xs">
        <span className="min-w-0 flex-1 truncate text-zinc-600 dark:text-zinc-400" title={label}>
          {label}
        </span>
        <span className="shrink-0 text-[11px] text-zinc-400">{t("unsupportedAssetKind", { kind: assetKind ?? "?" })}</span>
      </div>
    );
  }

  const picker = <MediaPicker open={pickerOpen} onOpenChange={setPickerOpen} token={token} gameId={gameId} kind={mediaKind} onSelect={onChange} />;

  const actions = (
    <>
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
    </>
  );

  // Audio không cần thumbnail to — vẫn là 1 hàng gọn như field thường, control chỉ là nút play.
  if (mediaKind === "AUDIO") {
    return (
      <div className="flex items-center gap-2 rounded-lg px-1.5 py-1 text-xs">
        <span className="min-w-0 flex-1 truncate text-zinc-600 dark:text-zinc-400" title={label}>
          {label}
        </span>
        <div className="flex shrink-0 items-center gap-1.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900">
            {mediaId && asset ? <AudioPlayButton src={asset.url} /> : <MusicIcon className="h-4 w-4 text-zinc-300 dark:text-zinc-700" />}
          </div>
          {actions}
        </div>
        {picker}
      </div>
    );
  }

  // Ảnh: tách thành khối riêng (label trên cùng, thumbnail to + nút action bên dưới) thay vì nhét vừa
  // 1 hàng như field thường — thumbnail bé xíu trước đây không đủ để nhìn rõ ảnh đang chọn.
  return (
    <div className="flex flex-col gap-1.5 rounded-lg px-1.5 py-1.5">
      <span className="truncate text-xs text-zinc-600 dark:text-zinc-400" title={label}>
        {label}
      </span>
      <div className="flex items-center gap-3">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900">
          {mediaId ? (
            asset ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={asset.url} alt="" className="h-full w-full object-contain" />
            ) : (
              <ImageIcon className="h-6 w-6 animate-pulse text-zinc-300 dark:text-zinc-700" />
            )
          ) : (
            <ImageIcon className="h-6 w-6 text-zinc-300 dark:text-zinc-700" />
          )}
        </div>
        <div className="flex flex-col items-start gap-1.5">{actions}</div>
      </div>
      {picker}
    </div>
  );
}

const VEC_AXES = ["x", "y", "z", "w"] as const;

/** `current` (override hoặc defaultLiteral.value) đã đúng hình {x,y[,z][,w]} theo size — chỉ cần ép kiểu/number hoá phòng khi thiếu key. */
function toVecValue(value: unknown, size: 2 | 3 | 4): PlaygroundVecValue {
  const v = (value && typeof value === "object" ? value : {}) as Record<string, unknown>;
  const result: PlaygroundVecValue = { x: Number(v.x) || 0, y: Number(v.y) || 0 };
  if (size >= 3) result.z = Number(v.z) || 0;
  if (size >= 4) result.w = Number(v.w) || 0;
  return result;
}

/** Field "vec2"/"vec3"/"vec4" — tách khối riêng (label trên, các trục x/y/z/w cạnh nhau) thay vì nhét vừa 1 hàng như field thường. */
function VecFieldInput({
  label,
  size,
  current,
  readOnly,
  onChange,
}: {
  label: string;
  size: 2 | 3 | 4;
  current: unknown;
  readOnly?: boolean;
  onChange: (value: PlaygroundVecValue) => void;
}) {
  const vec = toVecValue(current, size);
  const axes = VEC_AXES.slice(0, size);

  return (
    <div className="flex flex-col gap-1.5 rounded-lg px-1.5 py-1.5">
      <span className="truncate text-xs text-zinc-600 dark:text-zinc-400" title={label}>
        {label}
      </span>
      {/* grid-cols-2 cho cả vec2/vec3/vec4 — vec3 (3 trục, lẻ) tự xuống hàng dưới ở trục cuối (Z) thay vì tràn ngang. */}
      <div className="grid grid-cols-2 gap-1.5">
        {axes.map((axis) => (
          <label key={axis} className="flex items-center gap-1">
            <span className="w-2.5 shrink-0 text-[10px] font-medium uppercase text-zinc-400">{axis}</span>
            <NumberInput
              className="w-30"
              disabled={readOnly}
              step={0.1}
              value={vec[axis] ?? 0}
              onChange={(value) => onChange({ ...vec, [axis]: value })}
            />
          </label>
        ))}
      </div>
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
    return <Switch disabled={readOnly} checked={Boolean(current)} onChange={onChange} />;
  }

  if (type === "color") {
    const hex = colorValueToHex(current);
    return <ColorInput className="w-36" disabled={readOnly} value={hex} onChange={(e) => onChange(e.target.value)} />;
  }

  if (type === "integer" || type === "float" || type === "number") {
    const numericStep = step ?? (type === "integer" ? 1 : type === "float" ? 0.01 : "any");
    const numericValue = Number(current);
    // "integer" không cho gõ số thập phân — làm tròn ngay khi commit giá trị (gõ tay lẫn +/-/kéo slider).
    const handleChange = type === "integer" ? (value: number) => onChange(Math.round(value)) : onChange;

    if (slider && typeof min === "number" && typeof max === "number") {
      return (
        <div className="flex items-center gap-2">
          <Slider
            disabled={readOnly}
            min={min}
            max={max}
            step={numericStep}
            value={numericValue}
            onChange={(e) => handleChange(e.target.valueAsNumber)}
            className="w-48"
          />
          <span className="w-10 text-right tabular-nums text-zinc-500">{numericValue}</span>
        </div>
      );
    }

    return (
      <NumberInput
        disabled={readOnly}
        integer={type === "integer"}
        min={min}
        max={max}
        step={numericStep}
        value={numericValue}
        onChange={handleChange}
        className="w-28"
      />
    );
  }

  // "string"
  return <Input type="text" disabled={readOnly} value={String(current ?? "")} onChange={(e) => onChange(e.target.value)} className="w-32" />;
}
