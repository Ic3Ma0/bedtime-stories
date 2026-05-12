import { Story, StoryCategory, CATEGORIES } from "@/types/story";
import { stories } from "@/lib/stories";
import { GeneratedStoryRecord } from "@/lib/storage";

export type ProtagonistRole = "male" | "female" | "couple";

export interface GenerateParams {
  theme: string;
  protagonist: string;
  secondProtagonist?: string;
  role: ProtagonistRole;
  style: StoryCategory;
  suspenseLevel?: number;
}

// 检测是否有服务端 Kimi 配置（用于 UI 显示）
export async function checkKimiAvailable(): Promise<boolean> {
  try {
    const res = await fetch("/api/generate-story", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: "test" }),
    });
    // 200 说明服务端有 Key 且 Key 有效
    // 401 说明 Key 无效/过期
    // 500 说明 Key 未配置
    return res.status === 200;
  } catch {
    return false;
  }
}

// 主入口：有服务端 Kimi 就调真 API，没有就模拟生成
export async function generateStory(params: GenerateParams): Promise<GeneratedStoryRecord> {
  try {
    return await generateStoryWithKimi(params);
  } catch (e) {
    // 如果 Kimi 调用失败（如 Key 无效、网络错误），fallback 到模拟生成
    console.warn("Kimi API 调用失败，使用模拟生成:", e);
    return generateStorySimulated(params);
  }
}

// ========== 真实 Kimi API 调用（通过服务端代理） ==========

export async function generateStoryWithKimi(params: GenerateParams): Promise<GeneratedStoryRecord> {
  const prompt = buildPrompt(params);

  const res = await fetch("/api/generate-story", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `服务端错误: ${res.status}`);
  }

  const data = await res.json();
  const text = data.text || "";

  if (!text) {
    throw new Error("Kimi 返回内容为空");
  }

  const parsed = parseKimiResponse(text, params);

  return {
    id: `generated-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: parsed.title,
    tag: "Kimi 生成",
    category: params.style,
    minutes: estimateMinutes(parsed.content),
    content: parsed.content,
    createdAt: new Date().toISOString(),
    params: {
      theme: params.theme || "随机主题",
      protagonist: params.protagonist || "主角",
      secondProtagonist: params.secondProtagonist,
      role: params.role,
      style: CATEGORIES.find((c) => c.key === params.style)?.label || params.style,
    },
  };
}

// ========== 模拟生成（服务端 Kimi 不可用时的兜底） ==========

export async function generateStorySimulated(params: GenerateParams): Promise<GeneratedStoryRecord> {
  // 模拟网络延迟
  await new Promise((resolve) => setTimeout(resolve, 1500 + Math.random() * 1500));

  // 1. 根据风格筛选候选故事
  const candidates = stories.filter((s) => s.category === params.style);
  const pool = candidates.length > 0 ? candidates : stories;

  // 2. 随机选择一个作为"模板"
  const template = pool[Math.floor(Math.random() * pool.length)];

  // 3. 个性化改编
  const protagonist = params.protagonist.trim() || "主角";
  const theme = params.theme.trim();

  // 替换主角名字
  let content = template.content;
  const originalNames = extractProtagonistNames(template.content);
  if (originalNames.length > 0) {
    const mainName = originalNames[0];
    const regex = new RegExp(mainName, "g");
    content = content.replace(regex, protagonist);
  }

  // 如果用户提供了主题，在开头加入主题相关描述
  if (theme) {
    content = `【${theme}】\n\n${content}`;
  }

  // 生成新标题
  const newTitle = theme
    ? `${protagonist}的${theme}`
    : `${protagonist}的${template.title.split("的").pop() || "奇妙故事"}`;

  const id = `generated-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  return {
    id,
    title: newTitle,
    tag: "模拟生成",
    category: params.style,
    minutes: template.minutes,
    content,
    createdAt: new Date().toISOString(),
    params: {
      theme: params.theme || "随机主题",
      protagonist,
      secondProtagonist: params.secondProtagonist,
      role: params.role,
      style: CATEGORIES.find((c) => c.key === params.style)?.label || params.style,
    },
  };
}

// ========== 内部工具 ==========

function buildPrompt(params: GenerateParams): string {
  const styleMap: Record<string, string> = {
    mystery: "轻悬疑/微恐怖，要有反转结局，让人笑着揭开谜底",
    romance: "浪漫爱情故事，甜蜜温柔，让人心动",
    fantasy: "奇幻冒险，充满想象力，像童话一样奇妙",
    scifi: "科幻脑洞，结合未来科技，有哲思",
    warm: "温馨治愈，温暖人心，抚平疲惫",
    comedy: "搞笑喜剧，幽默风趣，让人笑着睡着",
  };

  const roleDesc: Record<ProtagonistRole, string> = {
    male: `主角是一位男性，名字叫做${params.protagonist || "男主角"}`
      + (params.secondProtagonist ? `，另一位重要角色是${params.secondProtagonist}` : ""),
    female: `主角是一位女性，名字叫做${params.protagonist || "女主角"}`
      + (params.secondProtagonist ? `，另一位重要角色是${params.secondProtagonist}` : ""),
    couple: `故事有两位主角：男生叫做${params.protagonist || "男主角"}`
      + `，女生叫做${params.secondProtagonist || "女主角"}，他们是故事的核心人物`,
  };

  return `请创作一个适合睡前阅读的原创小故事，要求如下：

风格：${styleMap[params.style] || "温馨有趣"}
${roleDesc[params.role]}
主题：${params.theme || "自由选择"}
要求：
- 主角必须是人类（不能是动物）
- 剧情要有转折或意外结局
- 适合睡前阅读，温暖或有趣
- 字数在 800-1500 字之间
- 段落之间用空行分隔

请直接返回故事内容，格式如下：
标题：《故事标题》

正文内容...

（只返回标题和正文，不要其他说明）`;
}

function parseKimiResponse(text: string, params: GenerateParams): { title: string; content: string } {
  // 尝试提取标题
  const titleMatch = text.match(/[《""']([^《""'\n]+)[》""']/);
  const title = titleMatch ? titleMatch[1].trim() : `${params.protagonist || "主角"}的睡前故事`;

  // 清理正文
  let content = text
    .replace(/[《""'][^《""'\n]+[》""']\s*\n*/, "")
    .replace(/^\s*标题[：:]\s*.+\n*/m, "")
    .trim();

  return { title, content };
}

function estimateMinutes(content: string): number {
  const chars = content.length;
  // 中文阅读速度约 300-400 字/分钟
  return Math.max(3, Math.min(10, Math.round(chars / 350)));
}

function extractProtagonistNames(content: string): string[] {
  const nameRegex = /[\u4e00-\u9fa5]{2,4}(?=[，。！？、：；""''])/g;
  const matches = content.match(nameRegex) || [];

  const freq: Record<string, number> = {};
  for (const name of matches) {
    freq[name] = (freq[name] || 0) + 1;
  }

  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .map(([name]) => name)
    .slice(0, 3);
}
