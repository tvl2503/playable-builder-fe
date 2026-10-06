import { redirect } from "next/navigation";
import { Card } from "@/components/common";
import { resolveSharedPreviewLink, type ResolvedSharedPreview } from "@/lib/api";

/**
 * Route public (không cần đăng nhập playable-tool — xem useAuthGate.ts's PUBLIC_ROUTE_PREFIXES) — nút
 * "Share" ở builds/[id] và variant editor tạo ra link dạng /share/<token>. Server Component: resolve
 * token ở server (không qua fetch()/CORS phía client) ra 1 presigned URL (đã vá sẵn config nếu là share
 * biến thể — xem SharedPreviewLinksService.resolve()), rồi redirect (307) THẲNG sang URL đó — người xem
 * rời khỏi domain playable-tool, vào thẳng domain storage, tương đương hệt "mở thẳng link storage" (đã
 * test không lag trên Safari). TẠM THỜI bỏ cách nhúng `<iframe>` cũ (giữ được domain playable-tool nhưng
 * nghi là nguồn cơn 1 bubble di chuyển bằng rigidbody bị chậm trên Safari dù chạy đúng tốc độ khi mở thẳng
 * link hoặc host ở nơi khác như edgeone.ai/drop) để kiểm chứng trên production thật — xem lại toàn bộ nếu
 * xác nhận đây đúng là nguyên nhân (quay về iframe thì mất domain masking, phải đổi hướng khác, vd Service
 * Worker proxy hoặc World Writable headers, không redirect thẳng như này).
 */
export default async function SharePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  let resolved: ResolvedSharedPreview;
  try {
    resolved = await resolveSharedPreviewLink(token);
  } catch (e) {
    return (
      <div className="flex flex-1 items-center justify-center bg-zinc-50 px-4 dark:bg-black">
        <Card variant="default" padding="lg" className="w-full max-w-md text-center">
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Không thể mở link xem</h1>
          <p className="mt-2 text-sm text-zinc-500">{e instanceof Error ? e.message : "Đã có lỗi xảy ra."}</p>
        </Card>
      </div>
    );
  }

  redirect(resolved.url);
}
