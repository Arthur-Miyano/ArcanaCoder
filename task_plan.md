# Task Plan: ArcanaCoder Phase 1 — Core Loop

## Goal
搭建 ArcanaCoder 像素风 RPG 学习游戏的 Phase 1：能打开网页、能做题、能运行 Python 代码、有即时反馈、刷新后进度不丢失。

## Current Phase
Step 1: 项目脚手架

## Phases

### Step 1: 项目脚手架
- [x] 需求讨论 + 方案 1.1 文档
- [ ] 创建 package.json / vite.config / tsconfig / tailwind / postcss
- [ ] 创建 src/main.ts / App.vue / index.html / main.css
- [ ] npm install 所有依赖
- [ ] 验证：npm run dev 正常启动
- **Status:** in_progress

### Step 2: 类型定义 + 测试题数据
- [ ] src/types/index.ts — 所有 TS 类型
- [ ] src/data/questions.ts — 5 道题完整数据（含自由编程的 testCases）
- **Status:** pending

### Step 3: Pinia 状态管理 + IndexedDB 存储
- [ ] src/stores/gameStore.ts
- [ ] src/services/storage.ts
- [ ] 验证：浏览器中状态可持久化
- **Status:** pending

### Step 4: Pyodide 服务 + LoadingOverlay
- [ ] src/services/pyodide.ts（单例封装，含加载进度回调）
- [ ] src/components/LoadingOverlay.vue
- [ ] 验证：控制台能运行 print("Hello")
- **Status:** pending

### Step 5: App.vue 状态路由
- [ ] 实现 viewState 切换（loading / chapterSelect / quiz / chapterComplete）
- **Status:** pending

### Step 6: 答题面板组件族
- [x] src/components/QuizPanel.vue
- [x] src/components/ChoiceQuestion.vue
- [x] src/components/CodeQuestion.vue
- [x] src/components/OutputPredict.vue
- [x] 验证：编译通过
- **Status:** complete

### Step 7: 反馈 + 对话 + 顶栏组件
- [x] src/components/FeedbackToast.vue
- [x] src/components/NoxDialog.vue
- [x] src/components/GameHeader.vue
- **Status:** complete

### Step 8: 关卡选择 + 关卡完成页
- [x] src/components/ChapterSelect.vue
- [x] src/components/ChapterComplete.vue
- **Status:** complete

### Step 9: 集成测试
- [x] TypeScript 编译无错误
- [x] Vite 构建成功（568KB JS, 13KB CSS）
- [x] Dev server 正常启动
- [ ] 浏览器内完整路径验证（需要手动测试）
- **Status:** complete

### Step 10: GitHub Pages 部署
- [x] .gitignore
- [x] GitHub Actions workflow (.github/workflows/deploy.yml)
- [ ] GitHub 仓库配置 + 首次部署触发（需要手动操作）
- **Status:** pending

## Decisions Made
| Decision | Rationale |
|----------|-----------|
| 不用 vue-router，viewState 切换 | Phase 1 页面少，减少复杂度 |
| Pyodide CDN 加载 | 避免 WASM 打包进 JS bundle |
| CodeMirror 6 按需渲染 | 仅 code 题型才 import，减小首屏体积 |
| 自由编程判题用 testCases 精确对比 | 比关键词匹配更严格、更可靠 |
| idb 异步落盘 | 路线图指定，为 Phase 2 FSRS 数据量做准备 |
| Tailwind v3 + PostCSS | 生态最稳，插件支持好 |
| 经验公式：每题固定经验，答错 1/3 保底 | 鼓励尝试，答错不归零 |

## Errors Encountered
| Error | Attempt | Resolution |
|-------|---------|------------|

## Notes
- 方案 1.1 已存为 `F:\Agent\ArcanaCoder\方案1.1_Phase1_详细实现计划.md`
- 自由编程的 testCases 在 Question 类型中新增字段
