export type ImageFormatMode = "keep" | "lossless" | "lossy";

/** "original" = không giới hạn; số = cạnh dài nhất tối đa (px) — chỉ thu nhỏ, không phóng to ảnh gốc nhỏ hơn mức này. */
export type MaxResolution = "original" | 2048 | 1024 | 512;

/** Chất lượng cố định cho "lossy" — không expose slider riêng, giữ đúng 3 lựa chọn đã yêu cầu. */
const LOSSY_QUALITY = 0.8;

export function loadImage(file: File): Promise<{ img: HTMLImageElement; url: string }> {
  const url = URL.createObjectURL(file);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ img, url });
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Không đọc được ảnh"));
    };
    img.src = url;
  });
}

/** Canvas chỉ encode được png/jpeg/webp — định dạng khác (gif, svg...) fallback về png khi phải re-encode thật sự. */
function resolveOutputMimeType(mode: ImageFormatMode, originalType: string): string {
  if (mode === "lossless") return "image/png";
  if (mode === "lossy") return "image/jpeg";
  return originalType === "image/jpeg" || originalType === "image/webp" ? originalType : "image/png";
}

export function extensionForMimeType(mimeType: string): string {
  if (mimeType === "image/jpeg") return ".jpg";
  if (mimeType === "image/webp") return ".webp";
  if (mimeType === "image/png") return ".png";
  if (mimeType === "audio/webm" || mimeType.startsWith("audio/webm;")) return ".webm";
  return "";
}

/**
 * Không cần resize (ảnh đã nhỏ hơn maxResolution) + mode "keep" -> trả thẳng file gốc (byte-perfect,
 * không mất chất lượng qua 1 lần re-encode canvas) — chỉ thật sự resize/reencode khi có thay đổi.
 */
export async function processImage(file: File, maxResolution: MaxResolution, mode: ImageFormatMode): Promise<{ blob: Blob; mimeType: string }> {
  const { img, url } = await loadImage(file);
  try {
    const longerEdge = Math.max(img.naturalWidth, img.naturalHeight);
    const needsResize = maxResolution !== "original" && longerEdge > maxResolution;
    if (!needsResize && mode === "keep") return { blob: file, mimeType: file.type };

    const scale = needsResize ? maxResolution / longerEdge : 1;
    const width = Math.max(1, Math.round(img.naturalWidth * scale));
    const height = Math.max(1, Math.round(img.naturalHeight * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D không khả dụng");
    ctx.drawImage(img, 0, 0, width, height);

    const mimeType = resolveOutputMimeType(mode, file.type);
    const blob = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Không encode được ảnh"))), mimeType, mode === "lossy" ? LOSSY_QUALITY : undefined),
    );
    return { blob, mimeType };
  } finally {
    URL.revokeObjectURL(url);
  }
}
