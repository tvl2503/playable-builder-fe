import { resolveSharedPreviewLink } from "@/lib/api";

/**
 * Bản thử của /share: vẫn `<iframe src>` tới URL storage (URL trên thanh địa chỉ giữ domain playable-tool, không
 * proxy cả file HTML như /share2) nhưng trang cha là 1 document HTML tĩnh do Route Handler trả về — KHÔNG đi
 * qua root layout nên không hydrate React/Providers/AuthGate/Firebase, tránh tranh CPU với game lúc khởi động
 * (nghi là nguyên nhân giật đầu trên Safari khi dùng page.tsx + iframe).
 */
const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

const html = (body: string, title: string, status = 200) =>
  new Response(
    `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>${escapeHtml(title)}</title><style>html,body{margin:0;height:100%;background:#09090b}iframe{display:block;width:100%;height:100%;border:0}.err{font-family:system-ui,sans-serif;display:flex;height:100%;align-items:center;justify-content:center;background:#fafafa;text-align:center}.err h1{font-size:1.125rem}.err p{color:#71717a;font-size:.875rem}</style></head><body>${body}</body></html>`,
    {
      status,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
      },
    },
  );

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;

  try {
    const { url, buildName } = await resolveSharedPreviewLink(token);
    return html(
      `<iframe src="${escapeHtml(url)}" title="${escapeHtml(buildName)}" allow="autoplay; fullscreen" allowfullscreen></iframe>`,
      buildName,
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : "Something went wrong.";
    return html(
      `<div class="err"><div><h1>Unable to open this preview link</h1><p>${escapeHtml(message)}</p></div></div>`,
      "Unable to open this preview link",
      404,
    );
  }
}
