"use client";

import { useState } from "react";
import { CheckIcon, CopyIcon } from "../icons";

interface CodeBlockProps {
  code: string;
  filename?: string;
  className?: string;
}

/** Khối code đơn giản (không syntax highlight) kèm nút copy — dùng cho các trang hướng dẫn/doc. */
export default function CodeBlock({ code, filename, className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 ${className ?? ""}`}>
      {filename && (
        <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-2">
          <span className="font-mono text-xs text-zinc-400">{filename}</span>
        </div>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={handleCopy}
          title="Copy"
          className="absolute right-2 top-2 flex items-center gap-1 rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-400 transition-colors hover:text-zinc-100"
        >
          {copied ? <CheckIcon className="h-3.5 w-3.5 text-emerald-400" /> : <CopyIcon className="h-3.5 w-3.5" />}
        </button>
        <pre className="overflow-x-auto p-4 pr-12 text-xs leading-relaxed">
          <code className="font-mono text-zinc-100">{code}</code>
        </pre>
      </div>
    </div>
  );
}
