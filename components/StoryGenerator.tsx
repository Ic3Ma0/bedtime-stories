"use client";

import { useState, useEffect } from "react";
import { StoryCategory, CATEGORIES } from "@/types/story";
import { generateStory, checkKimiAvailable, ProtagonistRole } from "@/lib/ai-story";
import { storage, GeneratedStoryRecord } from "@/lib/storage";

interface StoryGeneratorProps {
  onStoryGenerated?: (story: GeneratedStoryRecord) => void;
  onClose?: () => void;
}

export default function StoryGenerator({ onStoryGenerated, onClose }: StoryGeneratorProps) {
  const [theme, setTheme] = useState("");
  const [protagonist, setProtagonist] = useState("");
  const [secondProtagonist, setSecondProtagonist] = useState("");
  const [role, setRole] = useState<ProtagonistRole>("male");
  const [style, setStyle] = useState<StoryCategory>("warm");
  const [suspenseLevel, setSuspenseLevel] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GeneratedStoryRecord | null>(null);
  const [error, setError] = useState("");
  const [kimiReady, setKimiReady] = useState<boolean | null>(null);

  useEffect(() => {
    checkKimiAvailable().then(setKimiReady);
  }, []);

  const handleGenerate = async () => {
    setError("");
    setIsGenerating(true);
    try {
      const story = await generateStory({
        theme,
        protagonist: protagonist || (role === "couple" ? "男主角" : "主角"),
        secondProtagonist: role === "couple" ? secondProtagonist || "女主角" : undefined,
        role,
        style,
        suspenseLevel,
      });
      storage.addGeneratedStory(story);
      setResult(story);
      onStoryGenerated?.(story);
    } catch (e) {
      setError(e instanceof Error ? e.message : "生成失败，请重试");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError("");
  };

  // 生成结果视图
  if (result) {
    return (
      <div className="max-w-2xl mx-auto w-full">
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          {/* 头部 */}
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                AI 生成
              </span>
              <h3 className="text-lg font-semibold mt-0.5">{result.title}</h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <CloseIcon />
            </button>
          </div>

          {/* 故事内容 */}
          <div className="p-6 md:p-8">
            <div className="flex items-center gap-2 mb-4 text-xs text-muted-foreground">
              <span className="px-2 py-0.5 rounded-full bg-muted">
                {CATEGORIES.find((c) => c.key === result.category)?.emoji} {" "}
                {CATEGORIES.find((c) => c.key === result.category)?.label}
              </span>
              <span>·</span>
              <span>约 {result.minutes} 分钟</span>
              <span>·</span>
              <span>{new Date(result.createdAt).toLocaleDateString("zh-CN")}</span>
            </div>

            <div className="story-content text-base md:text-lg text-card-foreground leading-relaxed">
              {result.content.split("\n").filter((p) => p.trim()).map((paragraph, i) => (
                <p key={i} className="mb-4 text-justify" style={{ textIndent: "2em" }}>
                  {paragraph.trim()}
                </p>
              ))}
            </div>
          </div>

          {/* 操作栏 */}
          <div className="px-6 py-4 border-t border-border flex items-center gap-3">
            <button
              onClick={handleReset}
              className="flex-1 px-4 py-2.5 rounded-xl bg-muted text-foreground font-medium hover:bg-muted/80 transition-colors"
            >
              再写一篇
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl bg-foreground text-background font-medium hover:opacity-90 transition-opacity"
            >
              完成
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto w-full">
      <div className="bg-card rounded-2xl border border-border shadow-sm p-6 md:p-8">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold">创作新故事</h2>
            <p className="text-sm text-muted-foreground mt-1">
              告诉我你想要的，AI 会为你编织一个独一无二的睡前故事
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <CloseIcon />
            </button>
          )}
        </div>

        {/* 表单 */}
        <div className="space-y-5">
          {/* Kimi 状态 */}
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-muted">
            {kimiReady === null ? (
              <span className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse" />
            ) : kimiReady ? (
              <span className="w-2 h-2 rounded-full bg-green-500" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-amber-500" />
            )}
            <span className="text-sm">
              {kimiReady === null
                ? "检测 Kimi 服务状态..."
                : kimiReady
                ? "Kimi AI 已就绪，将调用真实 AI 创作"
                : "Kimi 未配置，当前为模拟生成"}
            </span>
          </div>

          {/* 角色设定 */}
          <div>
            <label className="block text-sm font-medium mb-2">角色设定</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setRole("male")}
                className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-all ${
                  role === "male"
                    ? "bg-foreground text-background font-medium"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                <span>🧑</span>
                <span>男主</span>
              </button>
              <button
                onClick={() => setRole("female")}
                className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-all ${
                  role === "female"
                    ? "bg-foreground text-background font-medium"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                <span>👩</span>
                <span>女主</span>
              </button>
              <button
                onClick={() => setRole("couple")}
                className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-all ${
                  role === "couple"
                    ? "bg-foreground text-background font-medium"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                <span>💑</span>
                <span>双主角</span>
              </button>
            </div>
          </div>

          {/* 主角名字 */}
          <div>
            <label className="block text-sm font-medium mb-2">
              {role === "couple" ? "男主角名字" : "主角名字"} <span className="text-muted-foreground font-normal">（选填）</span>
            </label>
            <input
              type="text"
              value={protagonist}
              onChange={(e) => setProtagonist(e.target.value)}
              placeholder={
                role === "male"
                  ? "例如：阿明、小林..."
                  : role === "female"
                  ? "例如：小雨、晓萱..."
                  : "例如：阿明..."
              }
              className="w-full px-4 py-2.5 rounded-xl bg-muted border border-transparent focus:border-ring focus:outline-none transition-colors text-foreground placeholder:text-muted-foreground/60"
            />
          </div>

          {/* 双主角时显示女主角名字 */}
          {role === "couple" && (
            <div>
              <label className="block text-sm font-medium mb-2">
                女主角名字 <span className="text-muted-foreground font-normal">（选填）</span>
              </label>
              <input
                type="text"
                value={secondProtagonist}
                onChange={(e) => setSecondProtagonist(e.target.value)}
                placeholder="例如：小雨、晓萱..."
                className="w-full px-4 py-2.5 rounded-xl bg-muted border border-transparent focus:border-ring focus:outline-none transition-colors text-foreground placeholder:text-muted-foreground/60"
              />
            </div>
          )}

          {/* 主题 */}
          <div>
            <label className="block text-sm font-medium mb-2">
              故事主题 <span className="text-muted-foreground font-normal">（选填）</span>
            </label>
            <input
              type="text"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              placeholder="例如：一次意外的时间旅行、楼下便利店的秘密..."
              className="w-full px-4 py-2.5 rounded-xl bg-muted border border-transparent focus:border-ring focus:outline-none transition-colors text-foreground placeholder:text-muted-foreground/60"
            />
          </div>

          {/* 风格选择 */}
          <div>
            <label className="block text-sm font-medium mb-2">故事风格</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setStyle(cat.key)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-all text-left ${
                    style === cat.key
                      ? "bg-foreground text-background font-medium ring-2 ring-ring ring-offset-2 ring-offset-card"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  <span>{cat.emoji}</span>
                  <span className="truncate">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 悬疑度 */}
          {style === "mystery" && (
            <div>
              <label className="block text-sm font-medium mb-2">
                悬疑强度 <span className="text-muted-foreground font-normal">({suspenseLevel}/10)</span>
              </label>
              <input
                type="range"
                min={1}
                max={10}
                step={1}
                value={suspenseLevel}
                onChange={(e) => setSuspenseLevel(Number(e.target.value))}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-foreground"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>微悬疑</span>
                <span>轻恐怖</span>
              </div>
            </div>
          )}

          {/* 错误提示 */}
          {error && (
            <div className="px-4 py-3 rounded-xl bg-red-500/10 text-red-500 text-sm">
              {error}
            </div>
          )}

          {/* 生成按钮 */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-foreground text-background font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <SpinnerIcon />
                <span>正在编织故事...</span>
              </>
            ) : (
              <>
                <SparklesIcon />
                <span>开始创作</span>
              </>
            )}
          </button>

          <p className="text-xs text-center text-muted-foreground">
            {kimiReady
              ? "已接入 Kimi AI，每次生成都是真正的原创故事"
              : "当前为模拟生成模式。服务端配置 Kimi API Key 后可调用真实 AI。"}
          </p>
        </div>
      </div>
    </div>
  );
}

// ========== Icons ==========

function CloseIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
  );
}

function SparklesIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
  );
}

function SpinnerIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
  );
}
