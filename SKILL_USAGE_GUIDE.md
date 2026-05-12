# Skills 驱动开发教程：科学启动项目

> 核心理念：**不按「总指挥官」模式，而是按阶段、按需触发 Skill**。每个 Skill 只解决一个具体问题，保持灵活和控制权。

---

n个## 项目信息

- **项目名**：睡前故事系统
- **技术栈**：Next.js + TypeScript（已初始化）
- **已有资产**：`memory-bank/` 下已有 PRD、架构、技术栈、进度文档
- **当前状态**：基础框架就绪，即将进入功能开发

---

## 阶段总览

```
第0天（一次性）  项目初始化     → /setup-matt-pocock-skills
第1天           需求对齐       → /grill-with-docs
第1-2天         设计验证（可选）→ /prototype
第2天           规划拆解       → /to-prd → /to-issues
第3天起         日常开发       → /tdd（每个功能一个循环）
每3-5天         架构维护       → /improve-codebase-architecture
随时            排障           → /diagnose
随时            看不懂代码     → /zoom-out
```

---

## 阶段一：项目初始化（只做一次）

**触发词**：`/setup-matt-pocock-skills`

**作用**：配置 Issue Tracker、Triage 标签体系、文档目录。后续所有 Engineering Skills 都会读取这个配置。

**操作**：

```bash
# 在聊天中输入
/setup-matt-pocock-skills
```

**回答示例**：

| 问题 | 建议回答 |
|---|---|
| Issue Tracker 用什么？ | GitHub Issues |
| Triage 标签体系？ | `needs-triage` → `ready-for-dev` → `in-progress` → `done` |
| 文档存哪里？ | `docs/agents/` |

**预期产出**：

```
docs/
  agents/
    triage-labels.md      # 标签映射表
    issue-tracker.md      # Issue Tracker 配置
```

> ⚠️ **注意**：你的项目已有 `memory-bank/`，可以保留它作为项目级文档，`docs/agents/` 则专门存放 Agent 配置和 ADR（架构决策记录）。

---

## 阶段二：需求对齐与领域建模

**触发词**：`/grill-with-docs`

**作用**：Agent 会 relentless 地追问你关于项目的细节，帮你理清需求，同时产出两个关键文档：

1. **`CONTEXT.md`** — 领域通用语言（Ubiquitous Language）
2. **`docs/adr/`** — 架构决策记录（Architecture Decision Records）

**为什么用 `/grill-with-docs` 而不是 `/grill-me`？**

- `/grill-me` 是纯通用追问，适合非代码场景
- `/grill-with-docs` 额外会维护 `CONTEXT.md` 和 ADR，对工程项目更有价值

**操作示例**：

```
你：/grill-with-docs

Agent：你要做什么项目？
你：一个睡前故事系统。家长输入孩子的名字和喜欢的主题，AI 生成定制化故事，配语音朗读和插画。

Agent：目标用户是谁？家长还是孩子？
你：主要是家长（3-8岁孩子的父母），但也希望孩子能独立使用。

Agent：故事生成的 AI 用哪个模型？图像生成呢？
你：故事用 OpenAI GPT-4o，图像用 DALL-E 3，语音用 ElevenLabs。

Agent：故事需要保存吗？需要分享功能吗？
你：需要收藏和历史记录，分享先不做。

...（经过 5-10 轮追问）...
```

**预期产出**：

```
CONTEXT.md                      # 领域通用语言
├── 故事生成 → Story Weaving
├── 语音朗读 → Narration
├── 插画生成 → Illustration
├── 收藏故事 → Bookmarking
├── 历史记录 → Story History
└── ...

docs/adr/
├── 001-use-openai-for-story.md   # 为什么选 OpenAI
├── 002-use-elevenlabs-for-voice.md
└── 003-server-actions-over-api-routes.md
```

**收益**：

- 之后你和 Agent 对话时，你说"Bookmarking"它就知道是"收藏故事"
- Agent 生成的代码里，变量名、函数名会统一使用这些术语
- 大幅减少沟通成本和 Token 消耗

---

## 阶段三：设计验证（可选，不确定时启用）

**触发词**：`/prototype`

**适用场景**：

- 核心交互流程不确定（比如故事生成的用户旅程）
- 技术方案犹豫（比如 Server Actions vs API Routes）
- UI 风格没定（想快速看几个不同风格的效果）

**操作示例**：

```
你：/prototype

Agent：你想验证什么？
你：我想快速验证故事生成的用户流程：输入页 → 生成中状态 → 故事展示页 → 播放语音。我想看这几个页面的流转是否顺畅。

Agent：好，我会创建一个可切换的原型，包含三个不同风格的 UI 变体。
```

**预期产出**：

一个可运行的本地原型（可能是 Next.js 的临时路由），你可以点击体验流程，确认后再进入正式开发。

> 💡 **建议**：如果需求很清晰（比如你已经有 `memory-bank/product-requirements.md`），可以跳过这步。

---

## 阶段四：规划拆解

### Step 4.1：生成 PRD

**触发词**：`/to-prd`

**作用**：把当前会话中讨论的所有需求，自动整理成一份产品需求文档（PRD），并提交到 Issue Tracker。

**操作**：

```
你：/to-prd

Agent：基于我们刚才的讨论，我将生成 PRD：「睡前故事系统 - MVP 功能规格」。
      涉及模块：StoryWeaving（故事生成）、Narration（语音）、Illustration（插画）、Bookmarking（收藏）。
      确认提交到 GitHub Issues？
你：确认
```

**预期产出**：

- GitHub Issue #1：`[PRD] 睡前故事系统 MVP 功能规格`
- PRD 内容包含：功能列表、模块划分、非功能需求、验收标准

### Step 4.2：拆分为可执行 Issues

**触发词**：`/to-issues`

**作用**：把 PRD 拆成垂直切片（Vertical Slices），每个 Issue 都是可独立开发、测试、交付的最小完整功能单元。

**操作**：

```
你：/to-issues

Agent：基于 PRD #1，我拆分为以下 Issues：

GitHub Issue #2: [Slice] 搭建故事生成核心流程
  - 接受用户输入（名字、主题、年龄）
  - 调用 OpenAI 生成故事文本
  - 展示故事内容
  - 验收：输入 → 生成 → 展示，端到端可跑

GitHub Issue #3: [Slice] 集成语音朗读（Narration）
  - 为已生成的故事添加语音播放按钮
  - 调用 ElevenLabs API 生成语音
  - 支持播放/暂停/重播
  - 验收：点击播放能听到语音

GitHub Issue #4: [Slice] 添加插画生成（Illustration）
  - 故事生成后自动创建封面插画
  - 使用 DALL-E 3
  - 展示在故事页面顶部
  - 验收：每个故事都有专属插画

GitHub Issue #5: [Slice] 实现收藏与历史（Bookmarking & History）
  - 收藏按钮和收藏列表页
  - 本地存储（或数据库）保存历史记录
  - 验收：收藏后可在「我的故事」中查看

GitHub Issue #6: [Slice] 优化与打磨
  - 加载状态、错误处理、响应式适配
  - 验收：移动端可用，有友好错误提示
```

**关键原则**：每个 Issue 都是一个 **Vertical Slice**（垂直切片），不是水平分层。比如不是"先写所有 API，再写所有 UI"，而是"一个故事生成端到端流程"。

---

## 阶段五：日常开发（核心循环）

**触发词**：`/tdd`

**作用**：测试驱动开发。Agent 先写失败测试，再写实现让测试通过，最后重构。

**以 Issue #2「故事生成核心流程」为例**：

```
你：/tdd

Agent：我们要实现哪个功能？
你：Issue #2 - 故事生成核心流程。先实现服务端的故事生成 Action。

Agent：好，我先写测试。

// Agent 创建测试文件
__tests__/actions/generate-story.test.ts

Agent：测试写好了，它期望 `generateStoryAction` 接收 `{ childName, theme, age }`，
      返回 `{ title, content, summary }`，并且内容要包含 childName。
      测试现在失败（Red）。我现在实现它。

// Agent 创建实现
app/actions/generate-story.ts

Agent：实现完成，测试通过（Green）。我来看看有没有需要重构的地方。

// Agent 检查代码，可能做小的重构
```

**为什么用 `/tdd`？**

- 给 Agent 提供即时反馈（测试通过/失败）
- 防止 Agent "飞得太快" 写出大量未验证的代码
- 每个功能都有测试兜底，后续重构更安全

**开发节奏**：

```
选一个 Issue → /tdd（开发）→ 手动验证 → 提交代码 → 关闭 Issue
     ↑                                              |
     └──────────── 下一个 Issue ←───────────────────┘
```

---

## 阶段六：维护与进化（每 3-5 天）

### 架构体检

**触发词**：`/improve-codebase-architecture`

**作用**：扫描代码库，基于 `CONTEXT.md` 和 `docs/adr/` 发现：

- 哪些模块可以深化（提取更简洁的接口）
- 哪些耦合过紧的地方可以解耦
- 命名是否符合通用语言

**操作**：

```
你：/improve-codebase-architecture

Agent：我检查了代码库，发现以下机会：

1. [建议] `app/actions/generate-story.ts` 和 `app/actions/generate-illustration.ts`
   都直接调用外部 API，可以提取一个 `ai-client/` 模块统一封装。

2. [建议] `StoryCard` 组件同时处理了展示和收藏逻辑，违反了单一职责。
   建议拆分为 `StoryCard`（纯展示）+ `BookmarkButton`（收藏逻辑）。

3. [命名] `getData()` 不够清晰，建议改为 `fetchStoryById()`，与 CONTEXT.md 中的术语一致。

你：同意 1 和 2，先执行 1。
Agent：好的，我开始重构...
```

### 看不懂代码时

**触发词**：`/zoom-out`

**作用**：让 Agent 从全局视角解释某段代码，说明它在整个系统中的位置和职责。

**操作**：

```
你：/zoom-out

Agent：请告诉我你想理解哪部分代码？
你：`app/story/[id]/page.tsx` 里的 `revalidate` 逻辑

Agent：这段代码位于「故事展示页」的 SSR 流程中。它的作用是...
       上游是 `generateStoryAction`，下游是 `StoryViewer` 组件。
       在整个数据流中，它负责...
```

### 遇到 Bug 时

**触发词**：`/diagnose`

**作用**：启动纪律化的诊断循环：复现 → 最小化 → 假设 → 验证 → 修复 → 回归测试。

**操作**：

```
你：/diagnose

Agent：描述一下你遇到的 Bug。
你：故事生成偶尔会返回空内容，但不是每次都发生。

Agent：我们按步骤来：
      Step 1 - 复现：你能提供触发条件吗？特定输入？
      ...
```

---

## 常用场景速查表

| 我想做... | 触发哪个 Skill | 预期产出 |
|---|---|---|
| 刚 clone 项目，开始第一天 | `/setup-matt-pocock-skills` | `docs/agents/` 配置 |
| 有个新想法，不确定细节 | `/grill-with-docs` | `CONTEXT.md` + ADR |
| 技术方案犹豫，想快速验证 | `/prototype` | 可运行的临时原型 |
| 需求聊完了，要出文档 | `/to-prd` | GitHub Issue（PRD） |
| PRD 有了，要拆任务 | `/to-issues` | 多个可执行的 GitHub Issues |
| 开始写代码 | `/tdd` | 测试 + 实现 + 重构 |
| 代码跑不通，不知道怎么查 | `/diagnose` | 定位到根因 + 修复 |
| 代码看不懂，想知道全局上下文 | `/zoom-out` | 系统级解释 |
| 项目跑了一阵，感觉代码乱了 | `/improve-codebase-architecture` | 重构建议 + 执行 |
| 会话太长了，要交接给另一个 Agent | `/handoff` | 交接文档 |
| 想节省 Token，快速沟通 | `/caveman` | 极简模式的对话 |

---

## 与已有 memory-bank 的配合

你的项目已有 `memory-bank/`，建议这样分工：

| 目录/文件 | 用途 | 由谁维护 |
|---|---|---|
| `memory-bank/product-requirements.md` | 产品需求总纲 | 你 + `/grill-with-docs` |
| `memory-bank/tech-stack.md` | 技术栈说明 | 你 + Agent |
| `memory-bank/architecture.md` | 架构概览 | `/improve-codebase-architecture` |
| `memory-bank/implementation-plan.md` | 实施计划 | `/to-issues` 后更新 |
| `memory-bank/progress.md` | 当前进度 | 每次关闭 Issue 后更新 |
| `CONTEXT.md` | 领域通用语言 | `/grill-with-docs` |
| `docs/adr/*.md` | 架构决策记录 | `/grill-with-docs` |
| `docs/agents/*.md` | Agent 配置 | `/setup-matt-pocock-skills` |

---

## 下一步行动（针对「睡前故事系统」）

基于你项目的当前状态，建议按以下顺序执行：

1. **立即执行**：`/setup-matt-pocock-skills`（配置 Agent 环境）
2. **今天执行**：`/grill-with-docs`（对齐需求，补充 CONTEXT.md，把已有 memory-bank 中的需求提炼为通用语言）
3. **确认是否需要**：`/prototype`（如果不确定故事展示页的设计，快速验证）
4. **明天执行**：`/to-prd` → `/to-issues`（把 memory-bank 中的规划转为可执行的 GitHub Issues）
5. **进入开发循环**：对每个 Issue 执行 `/tdd`

---

> 📌 **记住**：Skills 不是菜单上的固定套餐，而是工具箱里的工具。**按阶段拿，按需用，用完放下。**
