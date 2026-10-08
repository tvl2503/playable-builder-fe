"use client";

import { useMemo } from "react";
import type { PlaygroundConfig, PlaygroundFieldsRegistry, PlaygroundMatch, PlaygroundVecValue } from "@/lib/api";

function groupKey(match: PlaygroundMatch): string {
  // Phải khớp playgroundGroupKey() ở playable-builder/src/pipeline/playgroundFields.ts
  return match.options.section || match.className;
}

interface Options {
  fieldsRegistry: PlaygroundFieldsRegistry | null;
  config: PlaygroundConfig;
  onChange: (config: PlaygroundConfig) => void;
}

/** Controlled: page cha giữ state `config` (để vừa render form vừa dựng live preview), form chỉ đọc/ghi qua onChange. */
export function usePlaygroundConfigForm({ fieldsRegistry, config, onChange }: Options) {
  const groups = useMemo(() => {
    const map = new Map<string, PlaygroundMatch[]>();
    for (const match of fieldsRegistry?.matches ?? []) {
      const key = groupKey(match);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(match);
    }
    return map;
  }, [fieldsRegistry]);

  const setValue = (group: string, prop: string, value: string | number | boolean | PlaygroundVecValue) => {
    onChange({ ...config, [group]: { ...config[group], [prop]: value } });
  };

  /** Xoá override (dùng cho field asset: bỏ chọn media, quay về asset gốc của engine). */
  const clearValue = (group: string, prop: string) => {
    const rest = { ...config[group] };
    delete rest[prop];
    onChange({ ...config, [group]: rest });
  };

  const getValue = (group: string, match: PlaygroundMatch) => config[group]?.[match.propName] ?? match.defaultLiteral?.value;

  return { groups, setValue, clearValue, getValue };
}
