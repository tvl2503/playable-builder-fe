"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/context";
import { routes } from "@/lib/routes";
import { useThemeStore } from "@/lib/theme/store";
import { useLocaleStore } from "@/lib/i18n/store";
import { useT } from "@/lib/i18n/useT";
import type { Locale } from "@/lib/i18n/types";

export interface SidebarNavItem {
  id: "games" | "media" | "all-games" | "unity-playworks" | "admin";
  label: string;
  href: string;
}

/** Riêng của trình duyệt người dùng đó, không cần đồng bộ server — localStorage là đủ. */
const COLLAPSE_STORAGE_KEY = "playable_sidebar_collapsed";

export function useSidebar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useThemeStore();
  const { locale, setLocale } = useLocaleStore();
  const t = useT("sidebar");
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  // Đọc sau khi mount (không đọc trong useState initializer) để tránh lệch hydration.
  useEffect(() => {
    try {
      setCollapsed(window.localStorage.getItem(COLLAPSE_STORAGE_KEY) === "1");
    } catch {
      // private mode / storage bị chặn -> cứ mặc định mở rộng
    }
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(COLLAPSE_STORAGE_KEY, next ? "1" : "0");
      } catch {
        // ignore
      }
      return next;
    });
  };

  const toggleLocale = () => {
    const next: Locale = locale === "en" ? "vi" : "en";
    setLocale(next);
  };

  const isActive = (href: string): boolean =>
    href === routes.home ? pathname === routes.home : pathname.startsWith(href);

  const handleLogout = async () => {
    await logout();
    router.replace(routes.login);
  };

  const navItems: SidebarNavItem[] = [
    { id: "games", label: t("navCreatives"), href: routes.creatives },
    { id: "media", label: t("navMedia"), href: routes.media },
    { id: "all-games", label: t("navAllGames"), href: routes.allGames },
    { id: "unity-playworks", label: t("navUnityPlayworks"), href: routes.unityPlayworks },
    ...(user?.role === "ADMIN" ? [{ id: "admin" as const, label: t("navAdmin"), href: routes.admin }] : []),
  ];

  const roleLabel = (role: string): string => {
    switch (role) {
      case "ADMIN":
        return t("roleAdmin");
      case "DEVELOP":
        return t("roleDevelop");
      case "UA":
        return t("roleUa");
      case "VIEWER":
        return t("roleViewer");
      default:
        return role;
    }
  };

  return {
    user,
    navItems,
    isActive,
    handleLogout,
    collapsed,
    toggleCollapsed,
    theme,
    toggleTheme,
    locale,
    toggleLocale,
    roleLabel,
    t,
  };
}
