# 架构文档

```
bedtime-stories/
├── index.html              # 入口页面，整体布局容器
├── css/
│   └── styles.css          # 自定义样式（主题变量、阅读排版优化）
├── js/
│   ├── main.js             # 入口初始化，模块编排
│   ├── story-generator.js  # 故事生成逻辑（预制库 + AI API调用）
│   ├── story-data.js       # 预制故事库（JSON数组，离线保底）
│   ├── ui-controller.js    # DOM操作、主题切换、页面状态
│   ├── storage.js          # localStorage封装（收藏、进度、配置）
│   └── speech.js           # Web Speech API 语音朗读封装
├── assets/
│   └── (可选配图资源)
└── memory-bank/            # 项目文档
    ├── product-requirements.md
    ├── tech-stack.md
    ├── architecture.md
    ├── implementation-plan.md
    └── progress.md
```

## 模块职责

| Module | Responsibility | Upstream | Downstream |
|--------|---------------|----------|------------|
| `main.js` | 应用初始化，模块间事件协调 | `index.html` | 所有模块 |
| `story-generator.js` | 管理故事来源：优先AI生成，离线时用预制库 | `ui-controller.js` | `storage.js` |
| `story-data.js` | 预置20-30个轻悬疑/微恐怖小故事的数据集 | `story-generator.js` | 无 |
| `ui-controller.js` | 所有DOM渲染、主题切换、阅读界面控制 | `main.js` | 无 |
| `storage.js` | 本地数据持久化（收藏、API Key、阅读进度） | `ui-controller.js`, `story-generator.js` | 无 |
| `speech.js` | TTS语音播放/暂停/速度控制 | `ui-controller.js` | 无 |

## 关键决策

1. **无框架**：项目交互简单（读故事、切换、收藏），原生JS足够，减少构建复杂度
2. **AI与预制库并存**：`story-generator.js` 内部做策略判断——在线且有API Key时调用Gemini，否则随机返回预制故事
3. **主题通过CSS变量实现**：日间/夜间模式切换只修改 `data-theme` 属性，全部样式响应式变化
4. **单页面应用**：所有功能在一个页面内完成，通过显示/隐藏不同区域切换视图

## 数据流

```
用户操作 → ui-controller.js → 触发事件 → story-generator.js 获取故事
                                              ↓
                                       在线? → 调用 Gemini API
                                       离线? → 从 story-data.js 读取
                                              ↓
                                    返回故事内容 → ui-controller.js 渲染
                                              ↓
                                    storage.js 保存阅读进度/收藏
```

数据流单向：UI → 业务逻辑 → 数据源 → 回到UI渲染。无循环依赖。
