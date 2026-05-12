"use client";

import { useState, useEffect, useRef } from "react";
import { profileStorage, Profile } from "@/lib/storage";

interface ProfileSwitcherProps {
  onProfileChange?: () => void;
}

export default function ProfileSwitcher({ onProfileChange }: ProfileSwitcherProps) {
  const [profiles, setProfiles] = useState<Profile[]>([{ name: "default" }]);
  const [active, setActive] = useState("default");
  const [isOpen, setIsOpen] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setProfiles(profileStorage.getProfiles());
    setActive(profileStorage.getActiveProfile());

    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const switchProfile = (name: string) => {
    profileStorage.setActiveProfile(name);
    setActive(name);
    setIsOpen(false);
    onProfileChange?.();
    // 刷新页面以应用新 Profile 的数据
    window.location.reload();
  };

  const addProfile = () => {
    const name = newName.trim();
    if (!name) return;
    profileStorage.addProfile(name);
    setProfiles(profileStorage.getProfiles());
    setNewName("");
    setShowAdd(false);
    switchProfile(name);
  };

  const removeProfile = (name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (name === "default") return;
    profileStorage.removeProfile(name);
    setProfiles(profileStorage.getProfiles());
    if (active === name) {
      switchProfile("default");
    }
  };

  const activeProfile = profiles.find((p) => p.name === active) || profiles[0];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-muted transition-colors text-sm"
      >
        <span className="w-6 h-6 rounded-full bg-ring/20 text-ring flex items-center justify-center text-xs font-medium">
          {activeProfile?.name.charAt(0).toUpperCase()}
        </span>
        <span className="hidden sm:inline max-w-[80px] truncate">
          {activeProfile?.name === "default" ? "我" : activeProfile?.name}
        </span>
        <ChevronDownIcon className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-card rounded-xl shadow-xl border border-border z-50 overflow-hidden">
          <div className="px-3 py-2 text-xs text-muted-foreground uppercase tracking-wider">
            切换身份
          </div>
          <div className="max-h-48 overflow-y-auto">
            {profiles.map((p) => (
              <button
                key={p.name}
                onClick={() => switchProfile(p.name)}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                  active === p.name
                    ? "bg-muted text-foreground font-medium"
                    : "text-muted-foreground hover:bg-muted/50"
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-ring/20 text-ring flex items-center justify-center text-[10px] font-medium shrink-0">
                  {p.name.charAt(0).toUpperCase()}
                </span>
                <span className="flex-1 text-left truncate">
                  {p.name === "default" ? "我" : p.name}
                </span>
                {active === p.name && (
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                )}
                {p.name !== "default" && (
                  <span
                    onClick={(e) => removeProfile(p.name, e)}
                    className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-muted-foreground hover:text-red-500 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                  </span>
                )}
              </button>
            ))}
          </div>

          {showAdd ? (
            <div className="px-3 py-2 border-t border-border">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="输入名字"
                className="w-full px-2 py-1.5 rounded-lg bg-muted text-sm border border-transparent focus:border-ring focus:outline-none mb-2"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && addProfile()}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setShowAdd(false)}
                  className="flex-1 px-2 py-1 rounded-lg text-xs text-muted-foreground hover:bg-muted transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={addProfile}
                  className="flex-1 px-2 py-1 rounded-lg text-xs bg-foreground text-background hover:opacity-90 transition-opacity"
                >
                  添加
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAdd(true)}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:bg-muted/50 transition-colors border-t border-border"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
              <span>添加身份</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m6 9 6 6 6-6"/></svg>
  );
}
