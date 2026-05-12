"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Story, CATEGORIES, StoryCategory } from "@/types/story";
import { stories, getStoriesByCategory, getRandomStory, findStoryById } from "@/lib/stories";
import { storage, GeneratedStoryRecord } from "@/lib/storage";
import { speech } from "@/lib/speech";


type ViewMode = "list" | "reading";

export default function StoryReader() {
  type AnyStory = Story | GeneratedStoryRecord;
  const [story, setStory] = useState<AnyStory | null>(null);
  const [storyList, setStoryList] = useState<AnyStory[]>(stories);
  const [generatedStories, setGeneratedStories] = useState<GeneratedStoryRecord[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const [rate, setRate] = useState(0.9);
  const [fontSize, setFontSize] = useState(18);
  const [fontFamily, setFontFamily] = useState("sans");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const [toasts, setToasts] = useState<{ id: number; msg: string; type: string }[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<"short" | "medium" | "long">("short");
  const [showGenerated, setShowGenerated] = useState(false);
  const [showFontPicker, setShowFontPicker] = useState(false);
  const fontPickerRef = useRef<HTMLDivElement>(null);
  const toastIdRef = useRef(0);

  const DURATIONS = [
    { key: "short" as const, label: "短故事", emoji: "⚡", min: 3, max: 5 },
    { key: "medium" as const, label: "中长故事", emoji: "📖", min: 6, max: 8 },
    { key: "long" as const, label: "长故事", emoji: "📚", min: 9, max: 13 },
  ];

  const getFilteredStories = (): (Story | GeneratedStoryRecord)[] => {
    let result: (Story | GeneratedStoryRecord)[] = [...stories, ...generatedStories];
    if (selectedCategory) {
      result = result.filter((s) => s.category === selectedCategory);
    }
    if (selectedDuration) {
      const d = DURATIONS.find((x) => x.key === selectedDuration)!;
      result = result.filter((s) => s.minutes >= d.min && s.minutes <= d.max);
    }
    return result;
  };

  // 初始化
  useEffect(() => {
    const savedTheme = storage.getTheme();
    setTheme(savedTheme);
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    }
    setFavorites(storage.getFavorites());
    setGeneratedStories(storage.getGeneratedStories());
    setRate(speech.getRate());
    setFontSize(storage.getFontSize());
    setFontFamily(storage.getFontFamily());

    speech.setOnChange(() => {
      setIsSpeaking(speech.isSpeaking);
      setIsPaused(speech.isPaused);
    });

    // 默认显示短故事列表
    const shortDuration = DURATIONS.find((d) => d.key === "short")!;
    setStoryList(stories.filter((s) => s.minutes >= shortDuration.min && s.minutes <= shortDuration.max));

    // 键盘快捷键
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowFavorites(false);
        setShowSettings(false);
        setShowFontPicker(false);
      }
      if (e.key === " " && viewMode === "reading" && !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        toggleSpeech();
      }
    };
    document.addEventListener("keydown", handleKey);

    // 点击外部关闭字体选择器
    const handleClickOutside = (e: MouseEvent) => {
      if (fontPickerRef.current && !fontPickerRef.current.contains(e.target as Node)) {
        setShowFontPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    // Ctrl/Cmd + 滚轮 调整阅读字体大小
    const handleWheel = (e: WheelEvent) => {
      if (viewMode === "reading" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setFontSize((prev) => {
          const delta = e.deltaY > 0 ? -1 : 1;
          const next = Math.max(14, Math.min(28, prev + delta));
          storage.setFontSize(next);
          return next;
        });
      }
    };
    document.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      document.removeEventListener("keydown", handleKey);
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("wheel", handleWheel);
    };
  }, [viewMode]);

  const showToast = (msg: string, type: "info" | "success" | "error" = "info") => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2000);
  };

  // 选择分类 → 在当前时长下进一步筛选
  const selectCategory = (category: string | null) => {
    setShowGenerated(false);
    setSelectedCategory(category);
    let result = stories;
    if (selectedDuration) {
      const d = DURATIONS.find((x) => x.key === selectedDuration)!;
      result = result.filter((s) => s.minutes >= d.min && s.minutes <= d.max);
    }
    if (category) {
      result = result.filter((s) => s.category === category);
    }
    setStoryList(result);
    setViewMode("list");
    setStory(null);
    speech.stop();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 选择时长 → 切换时长层级
  const selectDuration = (duration: "short" | "medium" | "long") => {
    setShowGenerated(false);
    setSelectedDuration(duration);
    setSelectedCategory(null);
    const d = DURATIONS.find((x) => x.key === duration)!;
    setStoryList(stories.filter((s) => s.minutes >= d.min && s.minutes <= d.max));
    setViewMode("list");
    setStory(null);
    speech.stop();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 切换 AI 创作显示
  const toggleGenerated = () => {
    setShowGenerated(true);
    setSelectedCategory(null);
    setViewMode("list");
    setStory(null);
    speech.stop();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 选择故事 → 阅读
  const selectStory = (s: AnyStory) => {
    setStory(s);
    setViewMode("reading");
    speech.stop();
    window.scrollTo({ top: 0, behavior: "smooth" });

    // 恢复阅读进度
    const progress = storage.getProgress(s.id);
    if (progress > 0) {
      setTimeout(() => window.scrollTo({ top: progress, behavior: "smooth" }), 300);
    }
  };

  // 返回列表
  const backToList = () => {
    setViewMode("list");
    setStory(null);
    speech.stop();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 换一篇（在阅读模式下）
  const nextStory = useCallback(() => {
    const pool = getFilteredStories();
    const newStory = pool[Math.floor(Math.random() * pool.length)];
    if (newStory) {
      setStory(newStory as AnyStory);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [selectedCategory, selectedDuration]);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    storage.setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
  };

  const toggleFavorite = () => {
    if (!story) return;
    if (storage.isFavorite(story.id)) {
      storage.removeFavorite(story.id);
      showToast("已取消收藏", "info");
    } else {
      storage.addFavorite(story.id);
      showToast("已收藏", "success");
    }
    setFavorites(storage.getFavorites());
  };

  const toggleSpeech = () => {
    if (!story) return;
    if (!speech.isSupported()) {
      showToast("当前浏览器不支持语音朗读", "error");
      return;
    }
    if (speech.isSpeaking) {
      if (speech.isPaused) speech.resume();
      else speech.pause();
    } else {
      speech.speak(story.content);
    }
  };

  const openFavStory = (id: string) => {
    // 先在预制库中查找
    const s = findStoryById(id);
    if (s) {
      selectStory(s);
      setShowFavorites(false);
      return;
    }
    // 再在生成的故事中查找
    const g = generatedStories.find((gs) => gs.id === id);
    if (g) {
      selectStory(g);
      setShowFavorites(false);
    }
  };

  const isFav = story ? favorites.includes(story.id) : false;
  const currentFilterLabel = DURATIONS.find((d) => d.key === selectedDuration)?.label;

  // ========== 列表视图 ==========
  const renderListView = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold">
          {currentFilterLabel}
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            共 {showGenerated ? generatedStories.length : storyList.length} 篇
          </span>
        </h2>
        <button
          onClick={() => {
            const all = [...generatedStories, ...storyList];
            const pool = selectedCategory
              ? all.filter((s) => s.category === selectedCategory)
              : all;
            const s = pool[Math.floor(Math.random() * pool.length)];
            if (s) selectStory(s);
          }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <ShuffleIcon />
          随机一篇
        </button>
      </div>

      <div className="grid gap-3">
        {showGenerated ? (
          /* 仅显示 AI 创作 */
          generatedStories.length > 0 ? (
            generatedStories.map((s) => (
              <button
                key={s.id}
                onClick={() => selectStory(s)}
                className="flex items-center gap-4 p-4 rounded-xl bg-card border border-ring/40 hover:border-ring hover:shadow-sm transition-all text-left group"
              >
                <div className="w-12 h-12 rounded-xl bg-ring/10 flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform">
                  ✨
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground truncate group-hover:text-ring transition-colors">
                    {s.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    <span className="text-ring font-medium">{s.tag}</span> · 约{s.minutes}分钟
                  </p>
                </div>
                <div className="text-muted-foreground">
                  <ChevronRightIcon />
                </div>
              </button>
            ))
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-2xl mb-3">✨</p>
              <p>还没有 AI 创作的故事</p>
              <p className="text-sm mt-1">去"创作"页面生成你的第一个故事吧</p>
            </div>
          )
        ) : (
          /* 仅显示预制故事库 */
          storyList.map((s) => (
            <button
              key={s.id}
              onClick={() => selectStory(s)}
              className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-ring hover:shadow-sm transition-all text-left group"
            >
              <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform">
                {CATEGORIES.find((c) => c.key === s.category)?.emoji || "📖"}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-foreground truncate group-hover:text-ring transition-colors">
                  {s.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {s.tag} · 约{s.minutes}分钟
                </p>
              </div>
              <div className="text-muted-foreground">
                <ChevronRightIcon />
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );

  // ========== 阅读视图 ==========
  const renderReadingView = () => {
    if (!story) return null;
    return (
      <div className="relative">
        {/* 字体选择器 - 卡片右上方外部 */}
        <div className="absolute -top-2 right-2 md:-right-2 z-10" ref={fontPickerRef}>
          <button
            onClick={() => setShowFontPicker(!showFontPicker)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-base font-medium bg-card border border-border shadow-sm text-muted-foreground hover:text-foreground hover:shadow-md transition-all"
          >
            <span className="text-lg">🅰️</span>
            <span className="hidden sm:inline">字体</span>
          </button>
          {showFontPicker && (
            <div className="absolute right-0 top-full mt-2 w-32 bg-card rounded-xl shadow-xl border border-border z-50 overflow-hidden py-1">
              {[
                { key: "sans", label: "黑体" },
                { key: "serif", label: "宋体" },
                { key: "kai", label: "楷体" },
              ].map((f) => (
                <button
                  key={f.key}
                  onClick={() => {
                    setFontFamily(f.key);
                    storage.setFontFamily(f.key);
                    setShowFontPicker(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-base transition-colors ${
                    fontFamily === f.key
                      ? "bg-muted text-foreground font-medium"
                      : "text-muted-foreground hover:bg-muted/50"
                  }`}
                  style={{
                    fontFamily:
                      f.key === "sans"
                        ? "ui-sans-serif, system-ui, -apple-system, 'PingFang SC', 'Microsoft YaHei', sans-serif"
                        : f.key === "serif"
                        ? "ui-serif, Georgia, 'SimSun', 'Songti SC', serif"
                        : "'KaiTi', 'Kaiti SC', 'STKaiti', serif",
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <article className="bg-card rounded-2xl shadow-sm border border-border p-6 md:p-8 min-h-[50vh] story-enter">
          <button
            onClick={backToList}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeftIcon />
            返回{currentFilterLabel}列表
          </button>

        <div className="mb-6 pb-4 border-b border-border">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="px-2 py-0.5 text-xs rounded-full bg-muted text-muted-foreground">
              {story.tag}
            </span>
            <span className="text-xs text-muted-foreground">约 {story.minutes} 分钟</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold leading-tight">{story.title}</h2>
        </div>
        <div
          className="story-content text-card-foreground leading-relaxed"
          style={{
            fontSize: `${fontSize}px`,
            lineHeight: 1.8,
            fontFamily:
              fontFamily === "sans"
                ? "ui-sans-serif, system-ui, -apple-system, 'PingFang SC', 'Microsoft YaHei', sans-serif"
                : fontFamily === "serif"
                ? "ui-serif, Georgia, 'SimSun', 'Songti SC', serif"
                : "'KaiTi', 'Kaiti SC', 'STKaiti', serif",
          }}
          dangerouslySetInnerHTML={{
            __html: story.content
              .split("\n")
              .filter((p) => p.trim())
              .map((p) => `<p style="margin-bottom:1em;text-indent:2em;">${escapeHtml(p.trim())}</p>`)
              .join(""),
          }}
        />
      </article>
    </div>
    );
  };

  return (
    <>
      {/* Toast */}
      <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[70] pointer-events-none space-y-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`px-4 py-2.5 rounded-xl shadow-lg text-sm font-medium text-white animate-in fade-in slide-in-from-top-2 duration-300 ${
              t.type === "success" ? "bg-green-500" : t.type === "error" ? "bg-red-500" : "bg-slate-800 dark:bg-slate-700"
            }`}
          >
            {t.msg}
          </div>
        ))}
      </div>

      {/* Main */}
      <div className={`flex flex-1 max-w-5xl w-full mx-auto px-4 py-6 gap-6 ${viewMode === "reading" ? "pb-28" : "pb-6"}`}>
        {/* 左侧边栏 - 桌面端 */}
        <aside className="hidden md:flex flex-col w-44 shrink-0">
          {/* 顶部工具栏 */}
          <div className="flex items-center gap-2 mb-4 px-2">
            <button
              onClick={() => setShowFavorites(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:bg-muted transition-colors relative"
            >
              <BookmarkIcon />
              <span>收藏</span>
              {favorites.length > 0 && (
                <span className="ml-1 w-4 h-4 text-[10px] bg-red-500 text-white rounded-full flex items-center justify-center">
                  {favorites.length}
                </span>
              )}
            </button>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
            >
              {theme === "dark" ? <SunIcon /> : <MoonIcon />}
            </button>
          </div>

          {/* 故事时长分组 */}
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-2">
            故事时长
          </div>
          <nav className="space-y-1 mb-4">
            {DURATIONS.map((d) => {
              const count = stories.filter((s) => s.minutes >= d.min && s.minutes <= d.max).length;
              return (
                <button
                  key={d.key}
                  onClick={() => selectDuration(d.key)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-colors text-left ${
                    selectedDuration === d.key && viewMode === "list" && !showGenerated
                      ? "bg-foreground text-background font-medium"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <span className="text-base">{d.emoji}</span>
                  <span>{d.label}</span>
                  <span className="ml-auto text-xs opacity-60">{count}</span>
                </button>
              );
            })}
            {/* AI 创作入口 */}
            <button
              onClick={toggleGenerated}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-colors text-left ${
                showGenerated && viewMode === "list"
                  ? "bg-foreground text-background font-medium"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <span className="text-base">✨</span>
              <span>我的创作</span>
              <span className="ml-auto text-xs opacity-60">{generatedStories.length}</span>
            </button>
          </nav>

          {/* 故事主题分组 */}
          {viewMode === "list" && (
            <>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-2">
                故事主题
              </div>
              <nav className="space-y-1">
                <button
                  onClick={() => selectCategory(null)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-colors text-left ${
                    selectedCategory === null
                      ? "bg-foreground text-background font-medium"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <span className="text-base">📚</span>
                  <span>全部主题</span>
                  <span className="ml-auto text-xs opacity-60">
                    {stories.filter((s) => {
                      const d = DURATIONS.find((di) => di.key === selectedDuration)!;
                      return s.minutes >= d.min && s.minutes <= d.max;
                    }).length}
                  </span>
                </button>
                {CATEGORIES.map((cat) => {
                  const d = DURATIONS.find((di) => di.key === selectedDuration)!;
                  const count = stories.filter(
                    (s) => s.category === cat.key && s.minutes >= d.min && s.minutes <= d.max
                  ).length;
                  return (
                    <button
                      key={cat.key}
                      onClick={() => selectCategory(cat.key)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-colors text-left ${
                        selectedCategory === cat.key
                          ? "bg-foreground text-background font-medium"
                          : "text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      <span className="text-base">{cat.emoji}</span>
                      <span>{cat.label}</span>
                      <span className="ml-auto text-xs opacity-60">{count}</span>
                    </button>
                  );
                })}
              </nav>
            </>
          )}

          {viewMode === "reading" && story && (
            <div className="mt-4 pt-4 border-t border-border">
              <button
                onClick={backToList}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:bg-muted transition-colors"
              >
                <ArrowLeftIcon />
                返回列表
              </button>
            </div>
          )}

          <div className="mt-auto pt-6 px-2">
            <div className="text-xs text-muted-foreground leading-relaxed">
              <p className="mb-1">💡 小贴士</p>
              <p>{viewMode === "reading" ? "按空格键朗读故事" : "点击主题筛选故事"}</p>
            </div>
          </div>
        </aside>

        {/* 右侧主内容 */}
        <div className="flex-1 min-w-0">
          {/* 移动端工具栏 */}
          <div className="md:hidden flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFavorites(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:bg-muted transition-colors relative"
              >
                <BookmarkIcon />
                <span>收藏</span>
                {favorites.length > 0 && (
                  <span className="ml-1 w-4 h-4 text-[10px] bg-red-500 text-white rounded-full flex items-center justify-center">
                    {favorites.length}
                  </span>
                )}
              </button>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
              >
                {theme === "dark" ? <SunIcon /> : <MoonIcon />}
              </button>
            </div>
          </div>

          {/* 移动端主题筛选 */}
          <div className="md:hidden flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
            <button
              onClick={() => selectCategory(null)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-sm transition-colors ${
                selectedCategory === null && !showGenerated
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              全部
            </button>
            {CATEGORIES.map((cat) => {
              const d = DURATIONS.find((di) => di.key === selectedDuration)!;
              const count = stories.filter(
                (s) => s.category === cat.key && s.minutes >= d.min && s.minutes <= d.max
              ).length;
              if (count === 0) return null;
              return (
                <button
                  key={cat.key}
                  onClick={() => selectCategory(cat.key)}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-sm transition-colors ${
                    selectedCategory === cat.key
                      ? "bg-foreground text-background"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {cat.emoji} {cat.label}
                </button>
              );
            })}
            {generatedStories.length > 0 && (
              <button
                onClick={toggleGenerated}
                className={`shrink-0 px-3 py-1.5 rounded-full text-sm transition-colors ${
                  showGenerated
                    ? "bg-foreground text-background"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                ✨ 我的创作
              </button>
            )}
          </div>

          {/* 内容区域 */}
          {viewMode === "list" ? renderListView() : renderReadingView()}
        </div>
      </div>

      {/* Bottom Bar - 仅在阅读模式显示 */}
      {viewMode === "reading" && story && (
        <div className="fixed bottom-0 left-0 right-0 bg-card/90 backdrop-blur-md border-t border-border z-40">
          <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between gap-2">
            <button
              onClick={toggleFavorite}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-colors ${
                isFav ? "text-red-500" : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <HeartIcon filled={isFav} />
              <span className="text-sm hidden sm:inline">{isFav ? "已收藏" : "收藏"}</span>
            </button>
            <button
              onClick={toggleSpeech}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-muted-foreground hover:bg-muted transition-colors"
            >
              {isSpeaking && !isPaused ? <PauseIcon /> : isPaused ? <PlayIcon /> : <VolumeIcon />}
              <span className="text-sm hidden sm:inline">
                {isSpeaking && !isPaused ? "暂停" : isPaused ? "继续" : "朗读"}
              </span>
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-muted-foreground hover:bg-muted transition-colors"
            >
              <SettingsIcon />
              <span className="text-sm hidden sm:inline">设置</span>
            </button>
            <button
              onClick={nextStory}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-foreground text-background font-medium hover:opacity-90 transition-opacity"
            >
              <ShuffleIcon />
              <span>换一篇</span>
            </button>
          </div>
        </div>
      )}

      {/* Favorites Modal */}
      {showFavorites && (
        <div className="fixed inset-0 z-[60]">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowFavorites(false)} />
          <div className="absolute inset-x-4 top-20 bottom-20 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-[480px] bg-card rounded-2xl shadow-2xl border border-border flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="text-lg font-semibold">我的收藏</h3>
              <button onClick={() => setShowFavorites(false)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                <CloseIcon />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {favorites.length === 0 ? (
                <div className="text-center text-muted-foreground py-12">
                  <p className="text-2xl mb-3">🤍</p>
                  <p>还没有收藏任何故事</p>
                  <p className="text-sm mt-1">遇到喜欢的故事，点击收藏按钮保存</p>
                </div>
              ) : (
                favorites.map((id) => {
                  const s = findStoryById(id);
                  if (!s) return null;
                  return (
                    <div
                      key={id}
                      onClick={() => openFavStory(id)}
                      className="flex items-center gap-3 p-3 rounded-xl bg-muted hover:bg-muted/80 transition-colors cursor-pointer"
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{s.title}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {s.tag} · 约{s.minutes}分钟
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          storage.removeFavorite(id);
                          setFavorites(storage.getFavorites());
                        }}
                        className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-muted-foreground hover:text-red-500 transition-colors"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-[60]">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowSettings(false)} />
          <div className="absolute bottom-0 inset-x-0 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-[480px] bg-card rounded-t-2xl md:rounded-2xl shadow-2xl border-t md:border border-border p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">阅读设置</h3>
              <button onClick={() => setShowSettings(false)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                <CloseIcon />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted text-sm text-muted-foreground">
                <span>💡</span>
                <span>阅读时按住 <kbd className="px-1.5 py-0.5 rounded bg-card text-xs font-mono border border-border">Ctrl</kbd> + 滚轮可调整字体大小</span>
              </div>
              <div>
                <label className="flex items-center justify-between text-sm mb-2">
                  <span>语速</span>
                  <span className="text-muted-foreground">{rate.toFixed(1)}x</span>
                </label>
                <input
                  type="range"
                  min={0.5}
                  max={2.0}
                  step={0.1}
                  value={rate}
                  onChange={(e) => {
                    const r = parseFloat(e.target.value);
                    setRate(r);
                    speech.setRate(r);
                  }}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-foreground"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>慢</span>
                  <span>快</span>
                </div>
              </div>
              <div className="pt-2 text-xs text-muted-foreground">
                <p>提示：语音朗读功能需要浏览器支持。部分移动端浏览器可能无法使用。</p>
              </div>
            </div>
          </div>
        </div>
      )}


    </>
  );
}

// ========== 图标组件 ==========
function BookmarkIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
  );
}
function MoonIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
  );
}
function SunIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
  );
}
function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
  );
}
function VolumeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
  );
}
function PauseIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="4" height="16" x="6" y="4"/><rect width="4" height="16" x="14" y="4"/></svg>
  );
}
function PlayIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="6 3 20 12 6 21 6 3"/></svg>
  );
}
function SettingsIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
  );
}
function ShuffleIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m18 14 4 4-4 4"/><path d="m18 2 4 4-4 4"/><path d="M2 18h1.973a4 4 0 0 0 3.3-1.7l5.454-8.6a4 4 0 0 1 3.3-1.7H22"/><path d="M2 6h1.972a4 4 0 0 1 3.6 2.2"/><path d="M22 18h-6.041a4 4 0 0 1-3.3-1.8l-.359-.45"/></svg>
  );
}
function CloseIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
  );
}
function TrashIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
  );
}
function ChevronRightIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
  );
}
function ArrowLeftIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
  );
}

function escapeHtml(text: string): string {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
