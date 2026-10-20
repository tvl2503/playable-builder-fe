import { resolveSharedPreviewLink } from "@/lib/api";

/**
 * Route public — proxy HTML của bản share: resolve token ở server ra presigned URL, tải single.html về rồi
 * trả THẲNG làm response của /share2/<token>. Không redirect (URL vẫn là domain playable-tool) và không
 * `<iframe>` (game là document top-level). Là Route Handler nên không đi qua root layout → không có
 * Sidebar/AuthGate. Đánh đổi: cả file HTML (vài MB) đi qua server playable-tool mỗi lượt xem.
 */
const errorPage = (message: string, status: number) =>
  new Response(
    `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Unable to open this preview link</title><body style="font-family:system-ui,sans-serif;display:flex;min-height:100vh;align-items:center;justify-content:center;margin:0;background:#fafafa"><div style="max-width:28rem;padding:2rem;text-align:center"><h1 style="font-size:1.125rem">Unable to open this preview link</h1><p style="color:#71717a;font-size:.875rem">${message.replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`)}</p></div>`,
    { status, headers: { "Content-Type": "text/html; charset=utf-8" } },
  );

export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  let url: string;
  try {
    ({ url } = await resolveSharedPreviewLink(token));
  } catch (e) {
    return errorPage(e instanceof Error ? e.message : "Something went wrong.", 404);
  }

  const upstream = await fetch(url, { cache: "no-store" });
  if (!upstream.ok || !upstream.body) return errorPage("Could not load the preview file.", 502);

  return new Response(upstream.body, {
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
  });
}
