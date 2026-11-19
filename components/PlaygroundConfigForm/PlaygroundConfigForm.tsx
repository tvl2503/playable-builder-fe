"use client";

import { useState, type ReactNode } from "react";
import useSWR from "swr";
import { Collapsible } from "radix-ui";
import {
  api,
  playgroundFieldLabel,
  type MediaKind,
  type PlaygroundConfig,
  type PlaygroundFieldsRegistry,
  type PlaygroundFieldType,
  type PlaygroundMatch,
  type PlaygroundScalarValue,
  type PlaygroundValue,
  type PlaygroundVecValue,
} from "@/lib/api";
import { AudioPlayButton } from "@/components/AudioPlayButton";
import { Button, Card, ColorInput, Input, NumberInput, Select, Slider, Switch } from "@/components/common";
import { MediaPicker } from "@/components/MediaPicker";
import { ChevronRightIcon, ImageIcon, MusicIcon, PlusIcon, TrashIcon } from "@/components/icons";
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
function inferFieldType(value: unknown): Exclude<PlaygroundFieldType, "enum"> {
  if (typeof value === "boolean") return "boolean";
  if (typeof value === "number") return Number.isInteger(value) ? "integer" : "float";
  if (Array.isArray(value)) return "array";
  return "string";
}

/** Kiểu phần tử của field "array" trên build cũ không có fieldType — đoán từ phần tử đầu của default (rỗng thì "number"). */
function inferElementType(value: unknown): NonNullable<PlaygroundFieldTypeInfoLike["elementType"]> {
  const first = Array.isArray(value) ? value.find((v) => typeof v === "number" && !Number.isInteger(v)) ?? value[0] : undefined;
  if (first === undefined) return "number";
  const type = inferFieldType(first);
  if (type === "array") return "number";
  if (first && typeof first === "object" && "x" in first && "y" in first) {
    return "z" in first ? ("w" in first ? "vec4" : "vec3") : "vec2";
  }
  return type;
}

type PlaygroundFieldTypeInfoLike = NonNullable<PlaygroundMatch["fieldType"]>;

/** Hover nhãn: hiện kèm tên biến gốc khi nhãn đang là displayName, để dev vẫn tra ngược được ra code. */
function fieldTooltip(match: PlaygroundMatch): string {
  const label = playgroundFieldLabel(match);
  return label === match.propName ? label : `${label} (${match.propName})`;
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
                  label={playgroundFieldLabel(match)}
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

            const typeInfo: PlaygroundFieldTypeInfoLike = match.fieldType ?? {
              type: inferFieldType(match.defaultLiteral?.value),
              ...(Array.isArray(match.defaultLiteral?.value) && { elementType: inferElementType(match.defaultLiteral?.value) }),
            };

            if (typeInfo.type === "array") {
              return (
                <ArrayFieldInput
                  key={match.propName}
                  label={playgroundFieldLabel(match)}
                  typeInfo={typeInfo}
                  current={current}
                  readOnly={readOnly}
                  onChange={(value) => setValue(group, match.propName, value)}
                />
              );
            }

            if (typeInfo.type === "vec2" || typeInfo.type === "vec3" || typeInfo.type === "vec4") {
              return (
                <VecFieldInput
                  key={match.propName}
                  label={playgroundFieldLabel(match)}
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
                <span
                  className="min-w-0 flex-1 truncate text-zinc-600 dark:text-zinc-400"
                  title={fieldTooltip(match)}
                >
                  {playgroundFieldLabel(match)}
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
  return (
    <div className="flex flex-col gap-1.5 rounded-lg px-1.5 py-1.5">
      <span className="truncate text-xs text-zinc-600 dark:text-zinc-400" title={label}>
        {label}
      </span>
      <VecAxesInput size={size} current={current} readOnly={readOnly} onChange={onChange} />
    </div>
  );
}

/** Các ô trục x/y/z/w của 1 vec — dùng chung cho field vec đơn lẻ và từng phần tử vec trong field mảng. */
function VecAxesInput({
  size,
  current,
  readOnly,
  onChange,
}: {
  size: 2 | 3 | 4;
  current: unknown;
  readOnly?: boolean;
  onChange: (value: PlaygroundVecValue) => void;
}) {
  const vec = toVecValue(current, size);
  const axes = VEC_AXES.slice(0, size);

  return (
    // grid-cols-2 cho cả vec2/vec3/vec4 — vec3 (3 trục, lẻ) tự xuống hàng dưới ở trục cuối (Z) thay vì tràn ngang.
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
  );
}

const VEC_ELEMENT_SIZE: Record<string, 2 | 3 | 4> = { vec2: 2, vec3: 3, vec4: 4 };

/** Phần tử mới thêm vào mảng — giá trị "trung tính" theo kiểu phần tử (số thì kẹp vào min/max nếu có). */
function newArrayItem(typeInfo: PlaygroundFieldTypeInfoLike): PlaygroundScalarValue {
  const type = typeInfo.elementType ?? "number";
  if (type === "boolean") return false;
  if (type === "string") return "";
  const vecSize = VEC_ELEMENT_SIZE[type];
  if (vecSize) return toVecValue({}, vecSize);
  const { min, max } = typeInfo;
  let value = 0;
  if (typeof min === "number") value = Math.max(value, min);
  if (typeof max === "number") value = Math.min(value, max);
  return value;
}

/** Field "array" — label + số phần tử + nút Thêm ở đầu khối, mỗi phần tử 1 hàng (input đúng elementType) kèm nút xoá. */
function ArrayFieldInput({
  label,
  typeInfo,
  current,
  readOnly,
  onChange,
}: {
  label: string;
  typeInfo: PlaygroundFieldTypeInfoLike;
  current: unknown;
  readOnly?: boolean;
  onChange: (value: PlaygroundValue) => void;
}) {
  const t = useT("playgroundConfigForm");
  const items: PlaygroundScalarValue[] = Array.isArray(current) ? current : [];
  const elementType = typeInfo.elementType ?? "number";
  const vecSize = VEC_ELEMENT_SIZE[elementType];
  const elementInfo: PlaygroundFieldTypeInfoLike = { type: elementType, slider: typeInfo.slider, min: typeInfo.min, max: typeInfo.max, step: typeInfo.step };

  const setItem = (index: number, value: PlaygroundScalarValue) => onChange(items.map((item, i) => (i === index ? value : item)));

  return (
    <div className="flex flex-col gap-1.5 rounded-lg px-1.5 py-1.5">
      <div className="flex items-center gap-2">
        <span className="min-w-0 flex-1 truncate text-xs text-zinc-600 dark:text-zinc-400" title={label}>
          {label} <span className="text-zinc-400">· {t("arrayCount", { count: items.length })}</span>
        </span>
        {!readOnly && (
          <Button type="button" variant="outline" size="sm" onClick={() => onChange([...items, newArrayItem(typeInfo)])}>
            <PlusIcon className="h-3.5 w-3.5" />
            {t("addItem")}
          </Button>
        )}
      </div>
      {items.length === 0 && <span className="text-[11px] text-zinc-400">{t("emptyArray")}</span>}
      {items.map((item, index) => (
        <div key={index} className="flex items-start gap-2 rounded-lg border border-zinc-100 px-2 py-1.5 dark:border-zinc-800">
          <span className="w-5 shrink-0 pt-1.5 text-[10px] tabular-nums text-zinc-400">{index}</span>
          <div className="min-w-0 flex-1">
            {vecSize ? (
              <VecAxesInput size={vecSize} current={item} readOnly={readOnly} onChange={(value) => setItem(index, value)} />
            ) : (
              <FieldInput typeInfo={elementInfo} current={item} readOnly={readOnly} onChange={(value) => setItem(index, value)} />
            )}
          </div>
          {!readOnly && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-zinc-400!"
              title={t("removeItem")}
              onClick={() => onChange(items.filter((_, i) => i !== index))}
            >
              <TrashIcon className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}

/**
 * Field TS enum → dropdown hiện tên member (Skin1, Skin2...), lưu đúng `value` gốc (số với enum số, chuỗi với
 * string enum) — vì vậy `<option value>` dùng chỉ số trong danh sách thay vì value, để không bị ép thành chuỗi.
 * Giá trị hiện tại không khớp member nào (vd enum đổi sau khi Reupload) vẫn hiện thành 1 lựa chọn riêng, không âm thầm đổi.
 */
function EnumFieldInput({
  options,
  current,
  readOnly,
  onChange,
}: {
  options: { name: string; value: number | string }[];
  current: unknown;
  readOnly?: boolean;
  onChange: (value: string | number) => void;
}) {
  const index = options.findIndex((o) => o.value === current);
  return (
    <Select
      disabled={readOnly}
      value={index >= 0 ? String(index) : ""}
      onChange={(e) => {
        const option = options[Number(e.target.value)];
        if (option) onChange(option.value);
      }}
      className="w-36"
    >
      {index < 0 && <option value="">{current === undefined || current === null ? "—" : String(current)}</option>}
      {options.map((o, i) => (
        <option key={o.name} value={String(i)}>
          {o.name}
        </option>
      ))}
    </Select>
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

  if (type === "enum") {
    return <EnumFieldInput options={typeInfo.enumOptions ?? []} current={current} readOnly={readOnly} onChange={onChange} />;
  }

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
