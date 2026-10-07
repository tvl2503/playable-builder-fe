"use client";

import { useEffect, useState } from "react";
import { AudioPlayButton } from "@/components/AudioPlayButton";
import { Button, Dialog, Input, Slider } from "@/components/common";
import { formatBytes } from "@/lib/format";
import { type AudioQuality, decodeAudio, processAudio } from "@/lib/media/audioEdit";
import { type ImageFormatMode, type MaxResolution, processImage } from "@/lib/media/imageEdit";
import { useT } from "@/lib/i18n/useT";

interface Props {
  file: File;
  onCancel: () => void;
  onConfirm: (blob: Blob, mimeType: string, name: string) => Promise<void>;
}

function nameWithoutExtension(fileName: string): string {
  const idx = fileName.lastIndexOf(".");
  return idx > 0 ? fileName.slice(0, idx) : fileName;
}

function formatSeconds(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function PillGroup<T extends string | number>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <Button
          key={o.value}
          type="button"
          variant={value === o.value ? "primary" : "outline"}
          size="sm"
          onClick={() => onChange(o.value)}
          className="rounded-full!"
        >
          {o.label}
        </Button>
      ))}
    </div>
  );
}

/**
 * Popup chỉnh sửa trước khi upload vào kho Media — ảnh: giới hạn độ phân giải tối đa + đổi định dạng;
 * audio: trim + tốc độ + chất lượng. Mọi xử lý chạy client-side (Canvas API / Web Audio API), "Tính
 * dung lượng" ra size THẬT vì đã encode thử xong, không phải ước lượng. Nút nghe thử luôn phát file
 * GỐC (chưa qua xử lý) — không cần nghe lại bản đã build vì build chỉ đổi tốc độ/chất lượng/trim,
 * không đổi nội dung tới mức cần nghe lại để biết có đúng không.
 */
export function MediaUploadDialog({ file, onCancel, onConfirm }: Props) {
  const t = useT("media");
  const isImage = file.type.startsWith("image/");

  const IMAGE_FORMATS: { value: ImageFormatMode; label: string }[] = [
    { value: "keep", label: t("formatKeep") },
    { value: "lossless", label: t("formatLossless") },
    { value: "lossy", label: t("formatLossy") },
  ];

  const MAX_RESOLUTIONS: { value: MaxResolution; label: string }[] = [
    { value: "original", label: t("resolutionOriginal") },
    { value: 2048, label: "2048px" },
    { value: 1024, label: "1024px" },
    { value: 512, label: "512px" },
  ];

  const AUDIO_QUALITIES: { value: AudioQuality; label: string }[] = [
    { value: "low", label: t("qualityLow") },
    { value: "standard", label: t("qualityStandard") },
    { value: "high", label: t("qualityHigh") },
  ];
  const [name, setName] = useState(nameWithoutExtension(file.name));
  const [error, setError] = useState<string | null>(null);
  const [estimatedSize, setEstimatedSize] = useState<number | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [maxResolution, setMaxResolution] = useState<MaxResolution>("original");
  const [formatMode, setFormatMode] = useState<ImageFormatMode>("keep");

  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [quality, setQuality] = useState<AudioQuality>("standard");

  // Phải tạo/revoke blob URL trong CÙNG 1 effect (không tách useMemo+effect riêng) — dev Strict Mode
  // chạy effect 2 lần lúc mount (setup -> cleanup giả lập -> setup thật), nếu useMemo chỉ tính 1 lần
  // thì lần cleanup giả lập đó sẽ revoke mất đúng cái URL mà lần setup thật đang dùng lại, audio/img
  // sẽ báo lỗi "no supported sources" dù src trông vẫn hợp lệ. Effect tự tạo mới mỗi lần chạy nên tự
  // lành sau cleanup giả lập đó.
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  useEffect(() => {
    const url = URL.createObjectURL(file);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- tạo resource (object URL) gắn vòng đời effect này, không phải mirror prop/state
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    if (isImage) return;
    decodeAudio(file)
      .then((buffer) => {
        setAudioBuffer(buffer);
        setTrimStart(0);
        setTrimEnd(buffer.duration);
      })
      .catch((err) => setError(err instanceof Error ? err.message : String(err)));
  }, [file, isImage]);

  const resetEstimate = () => setEstimatedSize(null);

  const build = async (): Promise<{ blob: Blob; mimeType: string } | null> => {
    setError(null);
    try {
      if (isImage) return await processImage(file, maxResolution, formatMode);
      if (!audioBuffer) return null;
      if (trimEnd <= trimStart) throw new Error(t("invalidTrimRange"));
      return await processAudio(audioBuffer, trimStart, trimEnd, speed, quality);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      return null;
    }
  };

  const handleCalculate = async () => {
    setCalculating(true);
    const result = await build();
    if (result) setEstimatedSize(result.blob.size);
    setCalculating(false);
  };

  const handleUpload = async () => {
    setUploading(true);
    const result = await build();
    if (!result) {
      setUploading(false);
      return;
    }
    try {
      await onConfirm(result.blob, result.mimeType, name.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setUploading(false);
    }
  };

  const busy = calculating || uploading;

  return (
    <Dialog open onOpenChange={(open) => !open && !busy && onCancel()} title={t("editBeforeUploadTitle", { name: file.name })} size="lg">
      <div className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-zinc-700 dark:text-zinc-300">{t("nameLabel")}</span>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </label>

        {isImage ? (
          <>
            <div className="flex items-center gap-3">
              {previewUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previewUrl} alt="" className="h-20 w-20 rounded-lg border border-zinc-200 object-contain dark:border-zinc-800" />
              )}
              <span className="text-xs text-zinc-400">{file.name}</span>
            </div>
            <div className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-zinc-700 dark:text-zinc-300">{t("maxResolutionLabel")}</span>
              <PillGroup
                options={MAX_RESOLUTIONS}
                value={maxResolution}
                onChange={(v) => {
                  setMaxResolution(v);
                  resetEstimate();
                }}
              />
            </div>
            <div className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-zinc-700 dark:text-zinc-300">{t("formatLabel")}</span>
              <PillGroup
                options={IMAGE_FORMATS}
                value={formatMode}
                onChange={(v) => {
                  setFormatMode(v);
                  resetEstimate();
                }}
              />
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2">
              {previewUrl && <AudioPlayButton src={previewUrl} />}
              <span className="text-xs text-zinc-400">{t("listenOriginal", { name: file.name })}</span>
            </div>
            {audioBuffer ? (
              <>
                <label className="flex flex-col gap-1.5 text-sm">
                  <span className="flex items-center justify-between font-medium text-zinc-700 dark:text-zinc-300">
                    <span>{t("trimStart")}</span>
                    <span className="font-mono text-xs text-zinc-400">{formatSeconds(trimStart)}</span>
                  </span>
                  <Slider
                    min={0}
                    max={audioBuffer.duration}
                    step={0.01}
                    value={trimStart}
                    onChange={(e) => {
                      setTrimStart(Math.min(Number(e.target.value), trimEnd - 0.05));
                      resetEstimate();
                    }}
                  />
                </label>
                <label className="flex flex-col gap-1.5 text-sm">
                  <span className="flex items-center justify-between font-medium text-zinc-700 dark:text-zinc-300">
                    <span>{t("trimEnd")}</span>
                    <span className="font-mono text-xs text-zinc-400">{formatSeconds(trimEnd)}</span>
                  </span>
                  <Slider
                    min={0}
                    max={audioBuffer.duration}
                    step={0.01}
                    value={trimEnd}
                    onChange={(e) => {
                      setTrimEnd(Math.max(Number(e.target.value), trimStart + 0.05));
                      resetEstimate();
                    }}
                  />
                </label>
                <label className="flex flex-col gap-1.5 text-sm">
                  <span className="flex items-center justify-between font-medium text-zinc-700 dark:text-zinc-300">
                    <span>{t("speedLabel")}</span>
                    <span className="font-mono text-xs text-zinc-400">{speed.toFixed(2)}x</span>
                  </span>
                  <Slider
                    min={0.5}
                    max={2}
                    step={0.05}
                    value={speed}
                    onChange={(e) => {
                      setSpeed(Number(e.target.value));
                      resetEstimate();
                    }}
                  />
                </label>
                <div className="flex flex-col gap-1.5 text-sm">
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">{t("qualityLabel")}</span>
                  <PillGroup
                    options={AUDIO_QUALITIES}
                    value={quality}
                    onChange={(v) => {
                      setQuality(v);
                      resetEstimate();
                    }}
                  />
                </div>
              </>
            ) : (
              <p className="text-xs text-zinc-400">{t("decodingAudio")}</p>
            )}
          </>
        )}

        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        {estimatedSize != null && <p className="text-xs text-zinc-500">{t("estimatedSize", { size: formatBytes(estimatedSize) })}</p>}

        <div className="flex items-center justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={busy}>
            {t("skip")}
          </Button>
          <Button type="button" variant="secondary" onClick={handleCalculate} loading={calculating} disabled={uploading}>
            {t("calculateSize")}
          </Button>
          <Button type="button" onClick={handleUpload} loading={uploading} disabled={calculating}>
            {t("upload")}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
