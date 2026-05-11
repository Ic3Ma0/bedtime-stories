const KEYS = {
  theme: "bs_theme",
  favorites: "bs_favorites",
  progress: "bs_progress",
} as const;

export const storage = {
  getTheme(): "light" | "dark" {
    if (typeof window === "undefined") return "light";
    return (localStorage.getItem(KEYS.theme) as "light" | "dark") || "light";
  },

  setTheme(theme: "light" | "dark") {
    if (typeof window === "undefined") return;
    localStorage.setItem(KEYS.theme, theme);
  },

  getFavorites(): string[] {
    if (typeof window === "undefined") return [];
    const raw = localStorage.getItem(KEYS.favorites);
    return raw ? JSON.parse(raw) : [];
  },

  addFavorite(storyId: string) {
    const list = this.getFavorites();
    if (!list.includes(storyId)) {
      list.push(storyId);
      localStorage.setItem(KEYS.favorites, JSON.stringify(list));
    }
  },

  removeFavorite(storyId: string) {
    const list = this.getFavorites().filter((id) => id !== storyId);
    localStorage.setItem(KEYS.favorites, JSON.stringify(list));
  },

  isFavorite(storyId: string): boolean {
    return this.getFavorites().includes(storyId);
  },

  getProgress(storyId: string): number {
    if (typeof window === "undefined") return 0;
    const raw = localStorage.getItem(KEYS.progress);
    const map = raw ? JSON.parse(raw) : {};
    return map[storyId] || 0;
  },

  setProgress(storyId: string, scrollTop: number) {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem(KEYS.progress);
    const map = raw ? JSON.parse(raw) : {};
    map[storyId] = scrollTop;
    localStorage.setItem(KEYS.progress, JSON.stringify(map));
  },

};
