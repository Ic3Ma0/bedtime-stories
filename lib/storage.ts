const KEYS = {
  theme: "bs_theme",
  favorites: "bs_favorites",
  progress: "bs_progress",
  generated: "bs_generated_stories",
  activeProfile: "bs_active_profile",
  profiles: "bs_profiles",
} as const;

// ========== Profile ==========

export interface Profile {
  name: string;
  avatar?: string;
}

export const profileStorage = {
  getActiveProfile(): string {
    if (typeof window === "undefined") return "default";
    return localStorage.getItem(KEYS.activeProfile) || "default";
  },

  setActiveProfile(name: string) {
    if (typeof window === "undefined") return;
    localStorage.setItem(KEYS.activeProfile, name);
  },

  getProfiles(): Profile[] {
    if (typeof window === "undefined") return [{ name: "default" }];
    const raw = localStorage.getItem(KEYS.profiles);
    if (raw) return JSON.parse(raw);
    return [{ name: "default" }];
  },

  addProfile(name: string) {
    const list = this.getProfiles();
    if (!list.find((p) => p.name === name)) {
      list.push({ name });
      localStorage.setItem(KEYS.profiles, JSON.stringify(list));
    }
  },

  removeProfile(name: string) {
    const list = this.getProfiles().filter((p) => p.name !== name);
    localStorage.setItem(KEYS.profiles, JSON.stringify(list));
  },

  // 为当前 Profile 获取 key
  _profileKey(key: string): string {
    const profile = this.getActiveProfile();
    return profile === "default" ? key : `${key}:${profile}`;
  },
};

// ========== Theme ==========

export const storage = {
  getTheme(): "light" | "dark" {
    if (typeof window === "undefined") return "light";
    const key = profileStorage._profileKey(KEYS.theme);
    return (localStorage.getItem(key) as "light" | "dark") || "light";
  },

  setTheme(theme: "light" | "dark") {
    if (typeof window === "undefined") return;
    const key = profileStorage._profileKey(KEYS.theme);
    localStorage.setItem(key, theme);
  },

  // ========== Favorites ==========

  getFavorites(): string[] {
    if (typeof window === "undefined") return [];
    const key = profileStorage._profileKey(KEYS.favorites);
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  },

  addFavorite(storyId: string) {
    const list = this.getFavorites();
    if (!list.includes(storyId)) {
      list.push(storyId);
      const key = profileStorage._profileKey(KEYS.favorites);
      localStorage.setItem(key, JSON.stringify(list));
    }
  },

  removeFavorite(storyId: string) {
    const list = this.getFavorites().filter((id) => id !== storyId);
    const key = profileStorage._profileKey(KEYS.favorites);
    localStorage.setItem(key, JSON.stringify(list));
  },

  isFavorite(storyId: string): boolean {
    return this.getFavorites().includes(storyId);
  },

  // ========== Progress ==========

  getProgress(storyId: string): number {
    if (typeof window === "undefined") return 0;
    const key = profileStorage._profileKey(KEYS.progress);
    const raw = localStorage.getItem(key);
    const map = raw ? JSON.parse(raw) : {};
    return map[storyId] || 0;
  },

  setProgress(storyId: string, scrollTop: number) {
    if (typeof window === "undefined") return;
    const key = profileStorage._profileKey(KEYS.progress);
    const raw = localStorage.getItem(key);
    const map = raw ? JSON.parse(raw) : {};
    map[storyId] = scrollTop;
    localStorage.setItem(key, JSON.stringify(map));
  },

  // ========== Generated Stories ==========

  getGeneratedStories(): GeneratedStoryRecord[] {
    if (typeof window === "undefined") return [];
    const key = profileStorage._profileKey(KEYS.generated);
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  },

  addGeneratedStory(story: GeneratedStoryRecord) {
    const list = this.getGeneratedStories();
    list.unshift(story); // 最新的在前面
    const key = profileStorage._profileKey(KEYS.generated);
    localStorage.setItem(key, JSON.stringify(list.slice(0, 50))); // 最多存 50 个
  },

  removeGeneratedStory(storyId: string) {
    const list = this.getGeneratedStories().filter((s) => s.id !== storyId);
    const key = profileStorage._profileKey(KEYS.generated);
    localStorage.setItem(key, JSON.stringify(list));
  },

  // ========== Font Size ==========

  getFontSize(): number {
    if (typeof window === "undefined") return 18;
    const key = profileStorage._profileKey("bs_font_size");
    const raw = localStorage.getItem(key);
    return raw ? parseInt(raw, 10) : 18;
  },

  setFontSize(size: number) {
    if (typeof window === "undefined") return;
    const key = profileStorage._profileKey("bs_font_size");
    localStorage.setItem(key, String(size));
  },

  getFontFamily(): string {
    if (typeof window === "undefined") return "sans";
    const key = profileStorage._profileKey("bs_font_family");
    return localStorage.getItem(key) || "sans";
  },

  setFontFamily(family: string) {
    if (typeof window === "undefined") return;
    const key = profileStorage._profileKey("bs_font_family");
    localStorage.setItem(key, family);
  },
};

export interface GeneratedStoryRecord {
  id: string;
  title: string;
  tag: string;
  category: string;
  minutes: number;
  content: string;
  createdAt: string;
  params: {
    theme: string;
    protagonist: string;
    secondProtagonist?: string;
    role?: string;
    style: string;
  };
}
