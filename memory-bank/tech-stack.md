# 技术栈文档

## 核心选择

| 层级 | 技术 | 版本 | 选择理由 |
|------|------|------|----------|
| 前端框架 | 纯 HTML + CSS + JavaScript | ES2020 | 零构建、零依赖、GitHub Pages直接部署、维护极简 |
| 样式方案 | Tailwind CSS (CDN) | v3 | 快速实现夜间模式/响应式，无需配置构建工具 |
| 图标 | Lucide Icons (CDN) | latest | 轻量、风格统一 |
| AI生成 | Google Gemini API | gemini-1.5-flash | 免费额度充足、中文生成质量好、无需后端代理（CORS允许） |
| 数据存储 | localStorage | 原生 | 收藏、阅读进度、用户偏好，无需服务器 |
| 语音朗读 | Web Speech API | 原生 | 浏览器内置TTS，无需额外依赖 |

## 放弃的方案

| 方案 | 放弃原因 |
|------|----------|
| Vue/React + Vite | 构建工具增加复杂度，此项目交互并不复杂 |
| Node.js后端 | 增加部署成本，纯前端可直接调用Gemini API |
| 自建故事数据库 | 前期用JSON文件足够，后续可迁移 |

## 部署目标

- **GitHub Pages**：免费、自动部署、自定义域名支持
- 零服务器成本， repository push 即发布

## 关键约束

- Gemini API Key 需用户自行申请（免费），存储在 localStorage
- 首次使用需输入 API Key
- 离线时自动回退到预制故事库
