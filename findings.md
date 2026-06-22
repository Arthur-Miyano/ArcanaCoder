# Findings & Decisions

## 自查发现的额外问题

| # | 问题 | 文件 | 严重度 |
|---|------|------|--------|
| 6 | OutputPredict 组件代码提取 bug | OutputPredict.vue | 🔴 |
| 7 | Pyodide CDN 加载失败无处理 | LoadingOverlay.vue | 🔴 |
| 8 | CodeMirror 固定 200px 高度 | CodeQuestion.vue | 🟡 |
| 9 | FeedbackToast 遮挡提交按钮 | FeedbackToast.vue | 🟡 |
| 10 | NoxDialog 位置太靠下 | QuizPanel.vue | 🟡 |
| 11 | initAnswer 重复初始化 | QuizPanel.vue | 🟢 |
| 12 | 代码错误不显示具体信息 | QuizPanel.vue | 🟡 |
| 13 | 无重试机制 | QuizPanel.vue | 🟢 |
| 14 | Chapter 类型缺少 knowledge 字段 | types/index.ts | 🟡 |
| 15 | ViewState 缺少 knowledgeBook 状态 | types/index.ts | 🟡 |

## 错误记录（Phase 1 开发周期）

| 错误 | 根因 | 修复 | 验证方式 |
|------|------|------|---------|
| free_coding 判题永远判错（第 16 题） | testCases.input 写裸参数 `'3'`，验证代码 `print(3)` 输出 `3`，期望 `28.27` | testCases.input 改为完整函数调用 `circle_area(3)` | 改后 `python -c` 跑一遍确认 |
| Boss 题 correctCode 含 print 导致测试重复输出 | correctCode 自带 `print(greet("贤者"))`，测试拼接 `print(greet("冒险者"))` 后输出两行 | correctCode 去掉 print 行，只保留函数定义 | 2 个测试用例全部 PASS |
| 反馈弹窗不显示 | FeedbackToast 双重 v-if 竞争条件 | 删除 FeedbackToast，改用内联 HTML + FeedbackPanel 组件 | Chrome DevTools 检查元素渲染 |
| 关卡错误判通关 | 通关条件为"所有题已答"而非"所有题正确" | gameStore 改为 `allCorrect` 检查 | 故意全部答错 → 不提示通关 |
| diff 误判 78.5 vs 78.50 | 字符串比较 "785" ≠ "7850" → logic | 改为提取数字后 float 比较 + 标点归一化 | 9 个 diff 用例全部 PASS |
| 重试题跳到序号题而非错题 | nextQuestion 按顺序导航 | 新增 retryIds/isRetryMode，答对后跳到下一道错题 | 全部答错后点击重试，确认走错题列表 |

## 仍需注意

| 项目 | 说明 |
|------|------|
| codeValidator 只做变量名提示 | 不做语法检查，交给 Python 解释器 |
| confirm() 在移动端行为不一 | 后续可改为自定义模态框 |
| 叙事描述更新 | 部分题目 missing narrativeDescription，需逐步补齐 |

## 解决方案

### 批量修改计划

1. **Title** → index.html
2. **KnowledgeBook + Chapter.knowledge** → types + questions + 新组件 + App.vue
3. **OutputPredict 修复** → 加 initialCode，删无用 code computed
4. **Layout 重构** → CodeMirror 自适应高度 / FeedbackToast 改为 inline / NoxDialog 上移
5. **反馈显示正确答案** → 修改 QuizPanel + FeedbackToast
6. **Pyodide 加载失败处理** → LoadingOverlay 加错误状态 + 重试按钮
