"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { PageLoading } from "../Spinner";
import { Sidebar } from "../Sidebar";
import { MenuIcon } from "../icons";
import { useAuthGate } from "./useAuthGate";

/**
 * Chặn toàn bộ hệ thống sau đăng nhập: bọc ở root layout, quanh mọi trang
 * trừ /login. Sidebar (header) cũng chỉ render ở đây — sau khi đã xác nhận
 * đăng nhập — nên /login không bao giờ thấy nó.
 */
export function AuthGate({ children }: { children: ReactNode }) {
  const { ready, isPublicRoute } = useAuthGate();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!ready) {
    return <PageLoading />;
  }

  if (isPublicRoute) return <div className="w-full h-full">{children}</div>;

  return (
    <div className="flex min-h-0 flex-1 flex-col md:flex-row">
      {/* Top bar chỉ hiện ở mobile (<md); desktop dùng sidebar cố định. */}
      <header className="flex h-12 shrink-0 items-center gap-3 border-b border-zinc-200 bg-white px-3 md:hidden dark:border-zinc-800 dark:bg-zinc-950">
        <button
          type="button"
          aria-label="Menu"
          onClick={() => setMobileOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
        >
          <MenuIcon className="h-5 w-5" />
        </button>
        <Link href="/" className="text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Playable Tool
        </Link>
      </header>
      <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
      <main className="min-h-0 min-w-0 flex-1 overflow-auto">{children}</main>
    </div>
  );
}
