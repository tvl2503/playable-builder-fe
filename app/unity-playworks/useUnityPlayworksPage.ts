"use client";

import { useState } from "react";
import useSWR from "swr";
import JSZip from "jszip";
import { useRequireAuth } from "@/lib/auth/use-require-auth";
import { loginWithGoogleDrive } from "@/lib/auth/firebase";
import { api } from "@/lib/api";
import { swrKeys } from "@/lib/api/swr-keys";
import { LUNA_NETWORKS } from "@/constants/luna";
import { buildDriveFolderStructure, extractFolderId, uploadFileToDrive } from "@/lib/drive/driveUpload";
import { convertZipBlob, generateNameFile, getPALuna, groupFiles, handleChangeFile, LUNA_ZIP_NETWORKS } from "@/lib/luna/luna";

export interface UploadProgress {
  current: number;
  total: number;
  networkName: string;
}

export function useUnityPlayworksPage() {
  const session = useRequireAuth();

  const [gameId, setGameId] = useState("");
  const [idea, setIdea] = useState("");
  const [pa, setPa] = useState("");
  const [localize, setLocalize] = useState("");
  const [isGetPaLuna, setIsGetPaLuna] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { data: games = [] } = useSWR(session ? swrKeys.gameCatalog() : null, () => api.listGameCatalog(session!.accessToken));

  const nameUser = session?.user.email.split("@")[0] ?? "";
  const selectedGame = games.find((g) => g.id === gameId) ?? null;

  const setFileFromInput = (f: File) => {
    setFile(f);
    if (f.name.includes(".zip")) setIdea(f.name.split("-")[0]);
  };

  const validateAndSetFile = (f: File): boolean => {
    const ext = f.name.slice(f.name.lastIndexOf(".")).toLowerCase();
    if (![".html", ".zip"].includes(ext)) {
      setError("Chỉ chấp nhận file .html hoặc .zip");
      return false;
    }
    setError(null);
    setSuccessMessage(null);
    setFileFromInput(f);
    return true;
  };

  const clearFile = () => setFile(null);

  const dragHandlers = {
    onDragOver: (e: React.DragEvent<HTMLLabelElement>) => {
      e.preventDefault();
      setIsDragging(true);
    },
    onDragLeave: (e: React.DragEvent<HTMLLabelElement>) => {
      e.preventDefault();
      setIsDragging(false);
    },
    onDrop: (e: React.DragEvent<HTMLLabelElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const dropped = e.dataTransfer.files?.[0];
      if (dropped) validateAndSetFile(dropped);
    },
  };

  const uploadAllNetworks = async (token: string, htmlContent: string, paFolderId: string, paValue: string, nameGame: string) => {
    const total = LUNA_NETWORKS.length;
    for (let current = 0; current < total; current++) {
      const network = LUNA_NETWORKS[current];
      setProgress({ current, total, networkName: network });

      const modified = handleChangeFile(network, htmlContent);
      const htmlBlob = new Blob([modified], { type: "text/html" });
      const nameFile = generateNameFile({ network, idea, PA: paValue, localize, nameGame, nameUser });

      if (LUNA_ZIP_NETWORKS.includes(network)) {
        const zipBlob = await convertZipBlob(htmlBlob, network);
        await uploadFileToDrive(token, `${nameFile}.zip`, zipBlob, paFolderId);
      } else {
        await uploadFileToDrive(token, `${nameFile}.html`, htmlBlob, paFolderId);
      }

      setProgress({ current: current + 1, total, networkName: network });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Vui lòng chọn file");
      return;
    }
    if (!idea.trim()) {
      setError("Vui lòng nhập idea");
      return;
    }

    const game = games.find((g) => g.id === gameId);
    if (!game) {
      setError("Vui lòng chọn game");
      return;
    }
    if (!game.driveUrl) {
      setError("Game này chưa có link Drive. Vui lòng cập nhật trong trang All Games.");
      return;
    }
    const gameFolderId = extractFolderId(game.driveUrl);
    if (!gameFolderId) {
      setError("Link Drive của game không hợp lệ.");
      return;
    }

    setIsUploading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const token = await loginWithGoogleDrive();
      if (!token) {
        setError("Không lấy được quyền truy cập Drive. Vui lòng thử lại.");
        return;
      }

      const nameGame = game.shortName ?? game.name;
      const buildPaFolder = (paValue: string) => buildDriveFolderStructure(token, gameFolderId, idea, paValue);

      if (file.name.endsWith(".zip")) {
        const zip = new JSZip();
        const zipFiles = await zip.loadAsync(file);
        const grouped = await groupFiles(zipFiles);

        for (const key of Object.keys(grouped)) {
          const entry = grouped[key];
          if (!entry?.unity) continue;
          const paValue = isGetPaLuna ? getPALuna(key) : pa;
          const paFolderId = await buildPaFolder(paValue);
          const htmlContent = await (await entry.unity.async("blob")).text();
          await uploadAllNetworks(token, htmlContent, paFolderId, paValue, nameGame);
        }
      } else {
        const paValue = isGetPaLuna ? getPALuna(file.name) : pa;
        const paFolderId = await buildPaFolder(paValue);
        const htmlContent = await file.text();
        await uploadAllNetworks(token, htmlContent, paFolderId, paValue, nameGame);
      }
      setSuccessMessage(`Đã upload xong lên Drive của ${nameGame}.`);
      setFile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra khi upload");
    } finally {
      setIsUploading(false);
      setProgress(null);
    }
  };

  return {
    session,
    games,
    selectedGame,
    gameId,
    setGameId,
    idea,
    setIdea,
    pa,
    setPa,
    localize,
    setLocalize,
    isGetPaLuna,
    setIsGetPaLuna,
    file,
    setFile: validateAndSetFile,
    clearFile,
    isDragging,
    dragHandlers,
    isUploading,
    progress,
    error,
    successMessage,
    handleSubmit,
  };
}
