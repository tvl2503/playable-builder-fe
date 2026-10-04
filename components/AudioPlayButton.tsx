"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/common";
import { PauseIcon, PlayIcon } from "@/components/icons";

interface Props {
  src: string;
  className?: string;
}

/** Nút nghe thử dùng chung — lưới media (asset đã upload) lẫn popup chỉnh sửa (file gốc chưa upload) đều cần đúng 1 việc: play/pause 1 src cho trước. */
export function AudioPlayButton({ src, className = "" }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) audio.pause();
    else audio.play();
  };

  return (
    <Button
      type="button"
      variant="secondary"
      size="icon"
      onClick={toggle}
      title={playing ? "Dừng" : "Nghe thử"}
      className={`rounded-full! ${className}`}
    >
      {playing ? <PauseIcon className="h-4 w-4" /> : <PlayIcon className="h-4 w-4 translate-x-0.5" />}
      <audio ref={audioRef} src={src} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)} />
    </Button>
  );
}
