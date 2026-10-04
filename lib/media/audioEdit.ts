export type AudioQuality = "low" | "standard" | "high";

/** Bitrate preset cho MediaRecorder — không có encoder mp3/wav nén sẵn trong trình duyệt nên luôn ra audio/webm;codecs=opus. */
const QUALITY_BITRATE: Record<AudioQuality, number> = {
  low: 48_000,
  standard: 96_000,
  high: 160_000,
};

export async function decodeAudio(file: File): Promise<AudioBuffer> {
  const arrayBuffer = await file.arrayBuffer();
  const ctx = new AudioContext();
  try {
    return await ctx.decodeAudioData(arrayBuffer);
  } finally {
    ctx.close();
  }
}

/**
 * speed=1 giữ nguyên; >1 nhanh hơn, <1 chậm hơn — đổi tốc độ kiểu "tua băng cassette" (cao độ đổi
 * theo, không time-stretch giữ pitch, xem PLAYGROUND_ASSET_PLAN.md). Luôn re-encode (không có đường
 * "giữ nguyên định dạng gốc" như ảnh) vì browser không đọc lại được mp3/aac gốc để ghép nguyên bytes.
 */
export async function processAudio(
  buffer: AudioBuffer,
  trimStartSec: number,
  trimEndSec: number,
  speed: number,
  quality: AudioQuality,
): Promise<{ blob: Blob; mimeType: string }> {
  const duration = Math.max(0.01, trimEndSec - trimStartSec);
  const outputLength = Math.max(1, Math.ceil((duration / speed) * buffer.sampleRate));
  const offlineCtx = new OfflineAudioContext(buffer.numberOfChannels, outputLength, buffer.sampleRate);
  const source = offlineCtx.createBufferSource();
  source.buffer = buffer;
  source.playbackRate.value = speed;
  source.connect(offlineCtx.destination);
  source.start(0, trimStartSec, duration);
  const rendered = await offlineCtx.startRendering();
  return encodeViaMediaRecorder(rendered, QUALITY_BITRATE[quality]);
}

/**
 * Không có API encode đồng bộ trong browser — phải phát lại buffer qua 1 AudioContext thật rồi ghi
 * lại bằng MediaRecorder (real-time), nên hàm này chạy mất đúng bằng độ dài đoạn audio đã xử lý.
 */
function encodeViaMediaRecorder(buffer: AudioBuffer, audioBitsPerSecond: number): Promise<{ blob: Blob; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const ctx = new AudioContext();
    const dest = ctx.createMediaStreamDestination();
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(dest);

    const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus") ? "audio/webm;codecs=opus" : "audio/webm";
    const recorder = new MediaRecorder(dest.stream, { mimeType, audioBitsPerSecond });
    const chunks: BlobPart[] = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };
    recorder.onerror = (e) => reject((e as unknown as { error?: Error }).error ?? new Error("Encode audio thất bại"));
    recorder.onstop = () => {
      ctx.close();
      resolve({ blob: new Blob(chunks, { type: mimeType }), mimeType });
    };

    source.onended = () => recorder.stop();
    recorder.start();
    source.start();
  });
}
