"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ProfileSwitcher from "./ProfileSwitcher";

export default function AppHeader() {
  const pathname = usePathname() ?? "/";

  return (
    <header className="sticky top-0 z-50 bg-card/80 dark:bg-card/80 backdrop-blur-md border-b border-border">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <span className="text-lg">🌙</span>
          <h1 className="text-lg font-semibold tracking-wide">枕边故事</h1>
        </Link>

        <div className="flex items-center gap-1">
          {/* 模式切换 - 桌面端 */}
          <div className="hidden sm:flex items-center bg-muted rounded-lg p-0.5 mr-2">
            <Link
              href="/"
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                pathname === "/"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              浏览
            </Link>
            <Link
              href="/create"
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                pathname === "/create"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              创作
            </Link>
          </div>

          <ProfileSwitcher
            onProfileChange={() => {
              // 切换身份后通知页面刷新
              window.dispatchEvent(new Event("bs-profile-changed"));
            }}
          />
        </div>
      </div>

      {/* 移动端模式切换 */}
      <div className="sm:hidden flex border-t border-border">
        <Link
          href="/"
          className={`flex-1 py-2.5 text-sm font-medium text-center transition-colors ${
            pathname === "/"
              ? "text-foreground border-b-2 border-foreground"
              : "text-muted-foreground"
          }`}
        >
          浏览故事
        </Link>
        <Link
          href="/create"
          className={`flex-1 py-2.5 text-sm font-medium text-center transition-colors ${
            pathname === "/create"
              ? "text-foreground border-b-2 border-foreground"
              : "text-muted-foreground"
          }`}
        >
          AI 创作
        </Link>
      </div>
    </header>
  );
}
