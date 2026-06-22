# Findings & Decisions

## 自查发现的额外问题

| # | 问题 | 文件 | 严重度 |
|---|------|------|--------|
| 6 | OutputPredict 组件代码提取 bug：`code` computed 用正则解析 description 但实际 verify 用 `initialCode`，而 q4_predict 没有 initialCode → 点击"运行验证"跑的是空代码 | OutputPredict.vue | 🔴 |
| 7 | Pyodide CDN 加载失败无处理：加载卡死，用户无法重试 | LoadingOverlay.vue | 🔴 |
| 8 | CodeMirror 固定 200px 高度，不根据内容自适应 | CodeQuestion.vue | 🟡 |
| 9 | FeedbackToast `fixed bottom-0` 遮挡提交按钮区域 | FeedbackToast.vue | 🟡 |
| 10 | NoxDialog 被放在题目区域最底部（所有题组件之后），离题目很远 | QuizPanel.vue | 🟡 |
| 11 | `initAnswer()` 与 `watch(currentQuestion)` 重复初始化逻辑 | QuizPanel.vue | 🟢 |
| 12 | 代码执行失败时（如语法错误）只显示"答错了"，不显示具体错误信息 | QuizPanel.vue | 🟡 |
| 13 | 无"重试"机制：答错后只能"下一题"，不能重新作答 | QuizPanel.vue | 🟢 |
| 14 | Chapter 类型缺少 knowledge 字段 | types/index.ts | 🟡 |
| 15 | ViewState 缺少 knowledgeBook 状态 | types/index.ts | 🟡 |

## 解决方案

### 批量修改计划

1. **Title** → index.html
2. **KnowledgeBook + Chapter.knowledge** → types + questions + 新组件 + App.vue
3. **OutputPredict 修复** → 加 initialCode，删无用 code computed
4. **Layout 重构** → CodeMirror 自适应高度 / FeedbackToast 改为 inline / NoxDialog 上移
5. **反馈显示正确答案** → 修改 QuizPanel + FeedbackToast
6. **Pyodide 加载失败处理** → LoadingOverlay 加错误状态 + 重试按钮
