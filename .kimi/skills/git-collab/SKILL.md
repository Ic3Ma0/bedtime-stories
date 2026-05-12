# Git 双人协作 Skill

适用于 2 人小团队共同维护一个 GitHub 项目，团队成员不熟悉 Git 命令。

## 触发词

当用户提到以下关键词时触发：
- "git 协作" / "怎么协作" / "同事怎么拉代码"
- "上传代码" / "提交代码" / "push 代码"
- "拉取最新" / "同步代码" / "更新代码"
- "冲突" / "合并" / "同事改了我也改了"

## 协作原则（极简版）

**核心就一句话：先拉后推，有冲突找 agent。**

```
开发前 → git pull origin main
开发后 → git add . && git commit -m "说明" && git push origin main
```

## 初始化（同事只做一次）

```bash
git clone https://github.com/Ic3Ma0/bedtime-stories.git
cd bedtime-stories
npm install
```

> `.env.local` 已加入 `.gitignore`，不会上传。各自本地创建即可，API Key 互不影响。

## 日常三步走

### 第一步：开工前拉最新代码

```bash
git pull origin main
```

如果提示 `npm install` 有变化，就运行：
```bash
npm install
```

### 第二步：写代码（正常开发）

改文件、保存、测试，和平时一样。

### 第三步：完工后上传

```bash
git add .
git commit -m "feat: 你改了什么一句话说明"
git push origin main
```

## 常见问题处理

### Q1: push 时报错 "rejected" / "non-fast-forward"

**原因**：同事在你之前 push 了，你的代码不是最新的。

**解决**：
```bash
git pull origin main
# 如果没有冲突提示，直接再 push
git push origin main
```

### Q2: pull 后提示 "CONFLICT" 冲突

**原因**：你们两人改了同一个文件的同一个地方。

**解决**：让 agent 处理。告诉 agent "我和同事代码冲突了"，agent 会：
1. 查看冲突文件
2. 保留双方的有效代码
3. 重新提交并推送

### Q3: 想撤销刚才的修改（还没 commit）

```bash
git checkout -- .
```

### Q4: 想撤销刚才的 commit（还没 push）

```bash
git reset --soft HEAD~1
```

### Q5: 怎么查看同事最近改了什么

```bash
git log --oneline -5
```

## Commit 消息规范（建议）

| 前缀 | 用途 | 示例 |
|------|------|------|
| `feat:` | 新功能 | `feat: 添加夜间模式` |
| `fix:` | 修复 bug | `fix: 修复字体无法保存` |
| `docs:` | 文档更新 | `docs: 更新 README` |
| `style:` | 样式调整 | `style: 调整按钮圆角` |
| `refactor:` | 重构代码 | `refactor: 提取公共组件` |

## Agent 操作指南

当用户请求协作相关帮助时：

1. **判断用户身份**：是仓库所有者还是协作者？通常不需要区分，操作一样。
2. **检查当前 git 状态**：`git status --short`
3. **如果需要推送**：先 `git pull origin main`，处理冲突（如有），再 `git add . && git commit -m "..." && git push origin main`
4. **如果需要拉取**：直接 `git pull origin main`
5. **如果发生冲突**：读取冲突文件内容，分析双方修改，合并后重新提交推送

## 禁忌（不要做的事）

- ❌ 不要 `git push -f`（强制推送会覆盖同事的代码）
- ❌ 不要把 `node_modules`、`.next`、`dist` 提交到 Git（已在 `.gitignore` 中）
- ❌ 不要把 `.env.local` 提交到 Git（已在 `.gitignore` 中）
