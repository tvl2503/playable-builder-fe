/**
 * Typed client cho playable-builder (NestJS backend). Mọi route trừ
 * /auth/firebase đều cần Bearer token — xem lib/auth/context.ts.
 *
 * CRUD (JSON) đi qua lib/api/axios.ts (axios + interceptor: tự đính token từ
 * cookie, tự logout khi 401). Các hàm tải blob (artifact/export/preview) vẫn
 * dùng fetch thẳng — axios với responseType:"blob" sẽ không đọc được message
 * lỗi JSON từ backend khi request thất bại, nên giữ nguyên fetch cho nhóm này.
 */
import { apiDelete, apiGet, apiPatch, apiPost, apiPut } from "./axios";
import type { PermissionKeyDef } from "../auth/permissions";

export { ApiError } from "./api-error";

export type Role = "ADMIN" | "DEVELOP" | "UA" | "VIEWER";

export interface ApiUser {
  id: string;
  firebaseUid: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  /** Phương thức đăng nhập Firebase, vd "google.com"; null với user cũ chưa đăng nhập lại. */
  provider: string | null;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

/** name/androidUrl/iosUrl/iconUrl luôn tra live từ GameCatalogEntry theo packageName (xem GamesService.withCatalogData) — không snapshot, đổi ở All Games là phản ánh ngay. */
export interface ApiGame {
  id: string;
  slug: string;
  packageName: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  androidUrl: string | null;
  iosUrl: string | null;
  iconUrl: string | null;
  /** Chỉ `listGames` trả field này — user hiện tại có đánh dấu sao (Favourite) game này không. */
  isFavorite?: boolean;
}

/** 1 row "tất cả game của công ty" (import từ file JSON export ngoài, xem playable-builder/src/scripts/seed-game-catalog.ts). */
export interface ApiGameCatalogEntry {
  id: string;
  externalId: string | null;
  name: string;
  shortName: string | null;
  packageName: string;
  iconUrl: string | null;
  androidUrl: string | null;
  iosUrl: string | null;
  driveUrl: string | null;
  githubPlayableUrl: string | null;
  githubProductUrl: string | null;
  priority: number | null;
  inhouse: boolean;
  sourceCreatedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGameCatalogEntryInput {
  name: string;
  packageName: string;
  shortName?: string;
  iconUrl?: string;
  androidUrl?: string;
  iosUrl?: string;
  driveUrl?: string;
  githubPlayableUrl?: string;
  githubProductUrl?: string;
  priority?: number;
  inhouse?: boolean;
}

export type ArtifactKind = "HTML" | "ZIP";

export interface ApiBuildArtifact {
  id: string;
  buildId: string;
  channelName: string;
  kind: ArtifactKind;
  storageKey: string;
  publishedKey: string | null;
  sizeBytes: number;
  checksum: string;
  createdAt: string;
}

/** Khớp PlaygroundFieldType/PlaygroundFieldTypeInfo ở playable-builder/src/pipeline/playgroundFields.ts. */
export type PlaygroundFieldType =
  | "boolean"
  | "integer"
  | "float"
  | "number"
  | "string"
  | "color"
  | "vec2"
  | "vec3"
  | "vec4"
  | "array"
  | "enum";

/** 1 member của TS enum — khớp PlaygroundEnumOption ở playgroundFields.ts. */
export interface PlaygroundEnumOption {
  name: string;
  value: number | string;
}

export interface PlaygroundFieldTypeInfo {
  type: PlaygroundFieldType;
  /** Chỉ có khi type = "array": kiểu của từng phần tử (min/max/step/slider bên dưới áp dụng cho phần tử đó). */
  elementType?: Exclude<PlaygroundFieldType, "array" | "enum">;
  /** Chỉ có khi type = "enum": các lựa chọn theo thứ tự khai báo — form hiện dropdown theo `name`, lưu `value`. */
  enumOptions?: PlaygroundEnumOption[];
  slider?: boolean;
  min?: number;
  max?: number;
  step?: number;
}

/** Giá trị override của field "vec2"/"vec3"/"vec4" — z/w chỉ có với vec3/vec4. */
export interface PlaygroundVecValue {
  x: number;
  y: number;
  z?: number;
  w?: number;
}

/** Khớp PlaygroundMatch ở playable-builder/src/pipeline/playgroundFields.ts. */
export interface PlaygroundMatch {
  kind: "field" | "asset";
  file: string;
  className: string;
  propName: string;
  options: { section?: string; [key: string]: unknown };
  defaultLiteral: { start: number; end: number; value: unknown } | null;
  assetKind: string | null;
  /** Chỉ có ở kind "field" (null ở "asset") — dùng để PlaygroundConfigForm dựng đúng input. */
  fieldType: PlaygroundFieldTypeInfo | null;
  /** `displayName` khai ở @playgroundField/@playgroundAsset hoặc @property — build scan trước khi có field này thì không có (undefined). */
  displayName?: string | null;
}

/**
 * Nhãn hiển thị của 1 field trong form: displayName (backend đã ưu tiên @playgroundField > @property) nếu có, không
 * thì tên biến. Build cũ chưa có `displayName` thì vẫn đọc được `options.displayName` của @playgroundField.
 */
export function playgroundFieldLabel(match: Pick<PlaygroundMatch, "propName" | "options" | "displayName">): string {
  const fromOptions = match.options.displayName;
  return (
    match.displayName ||
    (typeof fromOptions === "string" && fromOptions.trim() ? fromOptions.trim() : null) ||
    match.propName
  );
}

export interface PlaygroundFieldsRegistry {
  matches: PlaygroundMatch[];
  hooks: unknown[];
}

export type PlaygroundScalarValue =
  | string
  | number
  | boolean
  | PlaygroundVecValue;

/** Giá trị override của 1 field: đơn lẻ, hoặc mảng các phần tử đơn lẻ (field type "array"). */
export type PlaygroundValue = PlaygroundScalarValue | PlaygroundScalarValue[];

export type PlaygroundConfig = Record<string, Record<string, PlaygroundValue>>;

export type BuildStatus = "PENDING" | "PROCESSING" | "SUCCESS" | "FAILED";

export interface ApiBuild {
  id: string;
  name: string;
  gameId: string;
  engineVersion: "V24X" | "V34X";
  status: BuildStatus;
  sourceZipKey: string;
  fieldsRegistry: PlaygroundFieldsRegistry | null;
  playgroundConfig: PlaygroundConfig;
  errorMessage: string | null;
  createdById: string;
  /** Chỉ `GET /games/:gameId/builds` (danh sách concept) trả field này — các endpoint build khác không include. */
  createdBy?: { id: string; name: string; email: string };
  createdAt: string;
  updatedAt: string;
  artifacts: ApiBuildArtifact[];
}

/** Trả về từ POST /builds/:id/reupload/preview — fieldsRegistry của zip mới, chưa build/đè gì cả. */
export interface ApiReuploadPreview {
  pendingUploadId: string;
  fieldsRegistry: PlaygroundFieldsRegistry;
}

export type MediaKind = "IMAGE" | "AUDIO";

/** Khớp MediaAsset ở playable-builder/prisma/schema.prisma — `url` là presigned download URL (1h), chỉ dùng để browse/pick, không lưu lại lâu dài ở đâu khác. */
export interface ApiMediaAsset {
  id: string;
  name: string;
  kind: MediaKind;
  mimeType: string;
  sizeBytes: number;
  storageKey: string;
  gameId: string;
  createdById: string;
  createdAt: string;
  url: string;
}

export interface ApiVariant {
  id: string;
  buildId: string;
  name: string;
  config: PlaygroundConfig;
  /** Khớp PlaygroundConfigPreset.autoFilledKeys ở backend — "group::prop" của field chưa từng bị user tự sửa tay. */
  autoFilledKeys: string[];
  createdById: string;
  createdBy: { name: string; email: string };
  createdAt: string;
  updatedAt: string;
  /** Token của share link còn sống (chưa revoke) của biến thể này — null nếu chưa có/đã bị thu hồi. */
  shareToken: string | null;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

/** authHeader(token) truyền tường minh theo từng call — độc lập với cookie mà interceptor tự đọc, nhưng luôn cùng giá trị nên không xung đột. */
function authHeader(token: string) {
  return { headers: { Authorization: `Bearer ${token}` } };
}

export const api = {
  loginWithFirebase: (idToken: string) =>
    apiPost<{ accessToken: string; user: ApiUser }>("/auth/firebase", {
      idToken,
    }),
  me: (token: string) => apiGet<ApiUser>("/auth/me", authHeader(token)),

  listGames: (token: string) => apiGet<ApiGame[]>("/games", authHeader(token)),
  /** Đánh dấu / bỏ sao 1 game — lưu riêng theo user đang đăng nhập. */
  setGameFavorite: (token: string, id: string, favorite: boolean) =>
    favorite
      ? apiPut<void>(`/games/${id}/favorite`, undefined, authHeader(token))
      : apiDelete<void>(`/games/${id}/favorite`, authHeader(token)),
  /** Lưu thứ tự nhóm "Yêu thích" (kéo-thả ở /creatives) — riêng theo user đang đăng nhập. */
  setFavoriteGameOrder: (token: string, gameIds: string[]) =>
    apiPut<void>("/games/order", { gameIds }, authHeader(token)),
  getGame: (token: string, id: string) =>
    apiGet<ApiGame>(`/games/${id}`, authHeader(token)),

  listGameCatalog: (token: string) =>
    apiGet<ApiGameCatalogEntry[]>("/game-catalog", authHeader(token)),
  createGameFromCatalog: (token: string, catalogEntryId: string) =>
    apiPost<ApiGame>(
      "/games/from-catalog",
      { catalogEntryId },
      authHeader(token),
    ),
  /** Các hàm dưới đây chỉ Admin gọi được (RolesGuard phía backend) — trang "All Games". */
  createGameCatalogEntry: (token: string, data: CreateGameCatalogEntryInput) =>
    apiPost<ApiGameCatalogEntry>("/game-catalog", data, authHeader(token)),
  updateGameCatalogEntry: (
    token: string,
    id: string,
    data: Partial<CreateGameCatalogEntryInput>,
  ) =>
    apiPatch<ApiGameCatalogEntry>(
      `/game-catalog/${id}`,
      data,
      authHeader(token),
    ),
  deleteGameCatalogEntry: (token: string, id: string) =>
    apiDelete<void>(`/game-catalog/${id}`, authHeader(token)),
  /** Đọc icon URL + tên thẳng từ link Play Store (JSON, không tải bytes) — auto-fill form Thêm/Sửa ở All Games. */
  fetchGameCatalogIconMeta: (token: string, androidUrl: string) =>
    apiGet<{ iconUrl: string; name: string | null }>(
      `/game-catalog/icon-from-url?url=${encodeURIComponent(androidUrl)}`,
      authHeader(token),
    ),

  listBuilds: (token: string, gameId: string) =>
    apiGet<ApiBuild[]>(`/games/${gameId}/builds`, authHeader(token)),
  getBuild: (token: string, id: string) =>
    apiGet<ApiBuild>(`/builds/${id}`, authHeader(token)),
  deleteBuild: (token: string, id: string) =>
    apiDelete<void>(`/builds/${id}`, authHeader(token)),
  renameBuild: (token: string, id: string, name: string) =>
    apiPatch<ApiBuild>(`/builds/${id}`, { name }, authHeader(token)),
  moveBuild: (token: string, id: string, gameId: string) =>
    apiPatch<ApiBuild>(`/builds/${id}/move`, { gameId }, authHeader(token)),
  duplicateBuild: (token: string, id: string) =>
    apiPost<ApiBuild>(`/builds/${id}/duplicate`, {}, authHeader(token)),
  uploadBuild: (
    token: string,
    gameId: string,
    name: string,
    file: File,
    options?: {
      pngMode?: "off" | "palette" | "lossy" | "webp";
      noCompressPaths?: string[];
    },
  ) => {
    const form = new FormData();
    form.append("name", name);
    form.append("file", file);
    if (options?.pngMode) form.append("pngMode", options.pngMode);
    if (options?.noCompressPaths?.length)
      form.append("noCompressPaths", JSON.stringify(options.noCompressPaths));
    return apiPost<ApiBuild>(
      `/games/${gameId}/builds`,
      form,
      authHeader(token),
    );
  },
  /** Bước 1/2 "Upload lại" (đè lên concept có sẵn) — quét fieldsRegistry của zip mới, KHÔNG build/đè gì cả. */
  previewReupload: (
    token: string,
    buildId: string,
    file: File,
    options?: {
      pngMode?: "off" | "palette" | "lossy" | "webp";
      noCompressPaths?: string[];
    },
  ) => {
    const form = new FormData();
    form.append("file", file);
    if (options?.pngMode) form.append("pngMode", options.pngMode);
    if (options?.noCompressPaths?.length)
      form.append("noCompressPaths", JSON.stringify(options.noCompressPaths));
    return apiPost<ApiReuploadPreview>(
      `/builds/${buildId}/reupload/preview`,
      form,
      authHeader(token),
    );
  },
  /** Bước 2/2 — user đã xem diff config và xác nhận đè. */
  confirmReupload: (token: string, buildId: string, pendingUploadId: string) =>
    apiPost<ApiBuild>(
      `/builds/${buildId}/reupload/${pendingUploadId}/confirm`,
      {},
      authHeader(token),
    ),
  /** User huỷ sau khi xem diff (hoặc đóng popup) — dọn pending upload, build gốc không đổi gì. */
  cancelReupload: (token: string, buildId: string, pendingUploadId: string) =>
    apiDelete<void>(
      `/builds/${buildId}/reupload/${pendingUploadId}`,
      authHeader(token),
    ),

  listNetworks: (token: string) =>
    apiGet<string[]>("/meta/networks", authHeader(token)),

  listVariants: (token: string, buildId: string) =>
    apiGet<ApiVariant[]>(`/builds/${buildId}/variants`, authHeader(token)),
  createVariant: (token: string, buildId: string, name: string) =>
    apiPost<ApiVariant>(
      `/builds/${buildId}/variants`,
      { name },
      authHeader(token),
    ),
  getVariant: (token: string, id: string) =>
    apiGet<ApiVariant>(`/variants/${id}`, authHeader(token)),
  updateVariantConfig: (
    token: string,
    id: string,
    config: PlaygroundConfig,
    autoFilledKeys: string[],
  ) =>
    apiPatch<ApiVariant>(
      `/variants/${id}`,
      { config, autoFilledKeys },
      authHeader(token),
    ),
  renameVariant: (token: string, id: string, name: string) =>
    apiPatch<ApiVariant>(`/variants/${id}`, { name }, authHeader(token)),
  deleteVariant: (token: string, id: string) =>
    apiDelete<void>(`/variants/${id}`, authHeader(token)),
  /** Ước lượng nhanh dung lượng file export của 1 config (kể cả chưa lưu) — xem VariantsService.estimateSize ở backend. */
  /** `{ [variantId]: bytes }` — ước lượng cho mọi biến thể của concept trong 1 lần gọi. */
  estimateVariantSizes: (token: string, buildId: string) =>
    apiGet<Record<string, number>>(
      `/builds/${buildId}/variants/size-estimates`,
      authHeader(token),
    ),
  estimateExportSize: (
    token: string,
    buildId: string,
    config: PlaygroundConfig,
  ) =>
    apiPost<{ sizeBytes: number; baseBytes: number; extraBytes: number }>(
      `/builds/${buildId}/size-estimate`,
      { config },
      authHeader(token),
    ),
  /** Đổi tên + config cùng lúc trong 1 request (variant editor gọi lúc bấm Lưu). Key nào bỏ trống thì backend giữ nguyên. */
  updateVariant: (
    token: string,
    id: string,
    data: { name?: string; config?: PlaygroundConfig; autoFilledKeys?: string[] },
  ) => apiPatch<ApiVariant>(`/variants/${id}`, data, authHeader(token)),
  /** Body bỏ trống = copy y hệt bản nguồn, tên tự sinh "(copy)". Variant editor gửi kèm tên mới + config đang sửa. */
  duplicateVariant: (
    token: string,
    id: string,
    data: { name?: string; config?: PlaygroundConfig; autoFilledKeys?: string[] } = {},
  ) => apiPost<ApiVariant>(`/variants/${id}/duplicate`, data, authHeader(token)),

  /** gameId bỏ trống = duyệt media của mọi game (kho dùng chéo game) — xem MediaService.list() ở backend. */
  listMedia: (
    token: string,
    filter?: { gameId?: string; kind?: MediaKind; search?: string },
  ) => {
    const params = new URLSearchParams();
    if (filter?.gameId) params.set("gameId", filter.gameId);
    if (filter?.kind) params.set("kind", filter.kind);
    if (filter?.search) params.set("search", filter.search);
    const qs = params.toString();
    return apiGet<ApiMediaAsset[]>(
      `/media${qs ? `?${qs}` : ""}`,
      authHeader(token),
    );
  },
  uploadMedia: (token: string, gameId: string, file: File, name?: string) => {
    const form = new FormData();
    form.append("file", file);
    if (name) form.append("name", name);
    return apiPost<ApiMediaAsset>(
      `/games/${gameId}/media`,
      form,
      authHeader(token),
    );
  },
  /** Dùng để resolve 1 `mediaId` (lưu trong playgroundConfig của field asset) ra URL thật lúc preview — xem useVariantEditorPage.ts. */
  getMedia: (token: string, id: string) =>
    apiGet<ApiMediaAsset>(`/media/${id}`, authHeader(token)),
  deleteMedia: (token: string, id: string) =>
    apiDelete<void>(`/media/${id}`, authHeader(token)),

  getMyPermissions: (token: string) =>
    apiGet<{ isAdmin: boolean; keys: string[] }>(
      "/auth/me/permissions",
      authHeader(token),
    ),

  listUsers: (token: string) => apiGet<ApiUser[]>("/users", authHeader(token)),
  updateUserRole: (token: string, id: string, role: Role) =>
    apiPatch<ApiUser>(`/users/${id}/role`, { role }, authHeader(token)),

  getPermissionsMatrix: (token: string) =>
    apiGet<{
      defs: PermissionKeyDef[];
      editableRoles: Role[];
      matrix: Record<string, string[]>;
    }>("/admin/permissions", authHeader(token)),
  updatePermissionsMatrix: (token: string, matrix: Record<string, string[]>) =>
    apiPut<{ ok: boolean }>(
      "/admin/permissions",
      { matrix },
      authHeader(token),
    ),

  /** Tạo (hoặc tái dùng link còn sống) link xem công khai cho bản single-html gốc — xem nút "Share" ở builds/[id]. */
  createShareLink: (token: string, buildId: string) =>
    apiPost<ApiSharedPreviewLink>(
      `/builds/${buildId}/share`,
      {},
      authHeader(token),
    ),
  revokeShareLink: (token: string, buildId: string) =>
    apiDelete<void>(`/builds/${buildId}/share`, authHeader(token)),
  /** Như trên nhưng cho đúng 1 biến thể (đã vá playgroundConfig) — xem nút "Share" ở variant editor. */
  createVariantShareLink: (token: string, variantId: string) =>
    apiPost<ApiSharedPreviewLink>(
      `/variants/${variantId}/share`,
      {},
      authHeader(token),
    ),
  revokeVariantShareLink: (token: string, variantId: string) =>
    apiDelete<void>(`/variants/${variantId}/share`, authHeader(token)),
};

export interface ApiSharedPreviewLink {
  token: string;
  /** null = không hết hạn (mọi link tạo mới đều vậy). */
  expiresAt: string | null;
}

export interface ResolvedSharedPreview {
  buildName: string;
  url: string;
}

/**
 * Route public (không cần token) — gọi từ Server Component app/share/[token]/page.tsx. Luôn trả presigned
 * URL của storage: bản gốc trỏ thẳng file chưa vá; bản biến thể trỏ bản đã vá playgroundConfig, được
 * backend cache lại trên storage từ lần share đầu tiên (xem SharedPreviewLinksService.resolve()) — khỏi
 * phải tải+vá lại full single.html (vài MB) mỗi lượt xem như trước.
 */
export async function resolveSharedPreviewLink(
  token: string,
): Promise<ResolvedSharedPreview> {
  const res = await fetch(`${API_URL}/share/${encodeURIComponent(token)}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message || "Link xem không hợp lệ hoặc đã hết hạn.");
  }
  return res.json();
}

/**
 * Endpoint download yêu cầu JWT (RolesGuard) nhưng redirect (302) sang
 * presigned URL của storage — điều hướng bằng <a href> thẳng sẽ không gắn
 * được Authorization header, nên phải fetch thủ công rồi tự mở/tải blob.
 */
export async function fetchArtifactBlob(
  token: string,
  buildId: string,
  artifactId: string,
): Promise<Blob> {
  const res = await fetch(
    `${API_URL}/builds/${buildId}/artifacts/${artifactId}/download`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  if (!res.ok) throw new Error(`Tải file thất bại (HTTP ${res.status})`);
  return res.blob();
}

export async function openOrDownloadArtifact(
  token: string,
  artifact: ApiBuildArtifact,
): Promise<void> {
  const blob = await fetchArtifactBlob(token, artifact.buildId, artifact.id);
  const url = URL.createObjectURL(blob);
  if (artifact.kind === "HTML") {
    window.open(url, "_blank");
  } else {
    const a = document.createElement("a");
    a.href = url;
    a.download = `${artifact.channelName}.zip`;
    a.click();
  }
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

/** Tiến độ export: `processing` = server đang ráp file (chưa có byte nào, không biết %); `downloading` = đang nhận file. */
export type ExportProgress =
  | { phase: "processing" }
  | { phase: "downloading"; loaded: number; total: number | null };

function fileNameFromContentDisposition(header: string | null): string | null {
  if (!header) return null;
  const star = /filename\*=UTF-8''([^;]+)/i.exec(header);
  if (star) {
    try {
      return decodeURIComponent(star[1].trim());
    } catch {
      // rơi xuống filename= thường
    }
  }
  const plain = /filename="?([^";]+)"?/i.exec(header);
  return plain ? plain[1].trim() : null;
}

/**
 * Build on-demand cho 1/nhiều network × 1/nhiều biến thể được chọn CÙNG LÚC (1 request duy nhất, không lưu lại trên
 * server — xem builds.service.ts's exportBuild) rồi lưu về máy. 1 file (1 network × 1 biến thể) -> đúng file đó
 * (html/zip); nhiều hơn -> server gộp hết vào 1 zip. `variantIds`: `""` = "Mặc định (engine)".
 *
 * Chạy NGAY TRÊN TRANG hiện tại (không mở tab mới như trước): fetch `GET /builds/:id/export` có Authorization, đọc
 * body theo stream để báo % qua `onProgress` (tổng lấy từ Content-Length), nhận đủ thì lưu bằng `<a download>` trỏ
 * blob URL — download từ blob cùng trang không bị Chrome chặn, chỉ tải đúng 1 lần. Giai đoạn server đang ráp file
 * thì chưa có byte nào nên chỉ báo `processing` (không có %). Tên file lấy từ Content-Disposition (CORS đã expose).
 */
export async function exportBuild(
  token: string,
  buildId: string,
  networks: string[],
  variantIds: string[],
  onProgress?: (progress: ExportProgress) => void,
): Promise<void> {
  const params = new URLSearchParams({
    networks: networks.join(","),
    variantIds: variantIds.join(","),
  });
  onProgress?.({ phase: "processing" });
  const res = await fetch(`${API_URL}/builds/${buildId}/export?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message || `Export thất bại (HTTP ${res.status})`);
  }

  const totalHeader = Number(res.headers.get("Content-Length"));
  const total = Number.isFinite(totalHeader) && totalHeader > 0 ? totalHeader : null;
  const contentType = res.headers.get("Content-Type") ?? "application/octet-stream";
  const fileName = fileNameFromContentDisposition(res.headers.get("Content-Disposition")) ?? `export-${buildId}`;

  let blob: Blob;
  if (res.body) {
    const reader = res.body.getReader();
    const chunks: Uint8Array<ArrayBuffer>[] = [];
    let loaded = 0;
    onProgress?.({ phase: "downloading", loaded, total });
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      loaded += value.byteLength;
      onProgress?.({ phase: "downloading", loaded, total });
    }
    blob = new Blob(chunks, { type: contentType });
  } else {
    blob = await res.blob();
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

/** Mở tab mới xem bản single-html gốc đã vá config của 1 variant — dùng cho nút "Xem nhanh" ở danh sách biến thể. */
export async function openVariantPreview(
  token: string,
  variantId: string,
): Promise<void> {
  const res = await fetch(`${API_URL}/variants/${variantId}/preview`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(
      body?.message || `Xem preview thất bại (HTTP ${res.status})`,
    );
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
