/**
 * Port từ playable-tool cũ (D:\playable-tool\src\components\utils\drive\driveUpload.ts) — gọi thẳng
 * Google Drive REST API từ browser bằng access token OAuth của chính user (xem
 * lib/auth/firebase.ts's loginWithGoogleDrive). Không qua backend: mỗi user upload bằng account Google
 * của họ, không cần lưu refresh token hay client secret ở server.
 */
const DRIVE_API = "https://www.googleapis.com/drive/v3/files";
const DRIVE_UPLOAD_API = "https://www.googleapis.com/upload/drive/v3/files";

export function extractFolderId(driveUrl: string): string | null {
  const match = driveUrl.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

function driveHeaders(token: string) {
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}

async function findFolder(token: string, name: string, parentId: string): Promise<string | null> {
  const q = `name='${name}' and '${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`;
  const res = await fetch(`${DRIVE_API}?q=${encodeURIComponent(q)}&fields=files(id)`, { headers: driveHeaders(token) });
  const data = await res.json();
  return data.files?.[0]?.id ?? null;
}

async function createFolder(token: string, name: string, parentId: string): Promise<string> {
  const res = await fetch(DRIVE_API, {
    method: "POST",
    headers: driveHeaders(token),
    body: JSON.stringify({ name, mimeType: "application/vnd.google-apps.folder", parents: [parentId] }),
  });
  const data = await res.json();
  return data.id;
}

async function findOrCreateFolder(token: string, name: string, parentId: string): Promise<string> {
  const existing = await findFolder(token, name, parentId);
  if (existing) return existing;
  return createFolder(token, name, parentId);
}

export async function uploadFileToDrive(token: string, name: string, blob: Blob, parentId: string): Promise<string> {
  const metadata = JSON.stringify({ name, parents: [parentId] });
  const form = new FormData();
  form.append("metadata", new Blob([metadata], { type: "application/json" }));
  form.append("file", blob);

  const res = await fetch(`${DRIVE_UPLOAD_API}?uploadType=multipart`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  const data = await res.json();
  return data.id;
}

/** Tạo 3 cấp folder: year -> "Tháng {m}" -> "ddmm - {idea}" -> pa. Trả về ID folder PA (nơi upload file vào). */
export async function buildDriveFolderStructure(token: string, gameFolderId: string, idea: string, pa: string): Promise<string> {
  const now = new Date();
  const d = now.getDate();
  const m = now.getMonth() + 1;
  const year = now.getFullYear().toString();
  const ddmm = `${d < 10 ? "0" + d : d}${m < 10 ? "0" + m : m}`;

  const yearFolderId = await findOrCreateFolder(token, year, gameFolderId);
  const monthFolderId = await findOrCreateFolder(token, `Tháng ${m}`, yearFolderId);
  const taskFolderId = await findOrCreateFolder(token, `${ddmm} - ${idea}`, monthFolderId);
  return findOrCreateFolder(token, pa, taskFolderId);
}
