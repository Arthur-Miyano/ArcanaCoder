# Task Plan: ArcanaCoder Phase 1 — Core Loop

## Goal
搭建 ArcanaCoder 像素风 RPG 学习游戏的 Phase 1：能打开网页、能做题、能运行 Python 代码、有即时反馈、刷新后进度不丢失。

## Current Phase
Phase 1 — 核心循环（全部完成）

## Completed

### 基础设施
- [x] Vue 3 + Vite + TypeScript 脚手架
- [x] Tailwind CSS 配置 + 自定义主题色
- [x] Pyodide 浏览器内 Python 运行时（CDN 加载 + 进度条 + 超时控制）
- [x] Pinia 游戏状态管理（等级/经验/进度）
- [x] IndexedDB 持久化（idb 封装）
- [x] GitHub Actions 自动部署

### 5 种题型
- [x] choice — 单选题
- [x] code_fill — 代码填空
- [x] code_fix — 代码纠错
- [x] output_predict — 输出预测
- [x] free_coding — 自由编程（含 testCases 验证）

### 题目数据
- [x] 阶段 1（变量与类型）28 题，分 4 节线性解锁
- [x] 备用题库 24 题（12 个核心知识点各 2 道）
- [x] 每道题配 narrativeTitle / narrativeDesc / hint / hintRoleplay / hintDirect

### 节系统
- [x] 章节→节 拆分（4 节线性解锁）
- [x] 节完成页（含准确率 + 重试入口）
- [x] 节进度保存 + nextSection 解锁 + chapter 解锁

### 智慧之书
- [x] 3D 翻页双栏书本布局
- [x] 专业定义 + 语法规则 + 设计哲学 + 常见错误 + 即时验证
- [x] 移动端自适应回退

### 错误反馈
- [x] Python 错误中文翻译（errorParser）
- [x] 代码 diff 比对（数值比较 / format vs logic 分类 / 标点归一化）
- [x] commonErrors 模式匹配（大小写 / 空格 / str+int / 变量拼写）
- [x] codeValidator 变量名提示

### 诺克斯提示
- [x] 三级提示（hint / hintRoleplay / hintDirect）
- [x] 疲劳版提示（连续 3 错）
- [x] 折叠长文本

### 疲劳控制
- [x] 单节 7 题后弹出休息提示（5s 可跳过）
- [x] 连续 3 错诺克斯干预

### 测试
- [x] vitest 配置 + 覆盖率阈值
- [x] diff 测试（13 用例）
- [x] errorParser 测试（7 用例）
- [x] commonErrors 测试（7 用例）
- [x] gameStore 测试（16 用例）
- [x] E2E 流程测试（11 用例）
- [x] 共计 54 测试全部通过
- [x] CI 集成 test 步骤

### GDD 合规
- [x] 22+ 处 UI 文案替换（正确→魔力共鸣、提交→注入魔力、下一题→下一道试炼等）
- [x] 备用题库 24 道全部补齐 narrative 字段
- [x] 难度分布（1-3 星）
- [x] commonErrors 配置

## Decisions Made
| Decision | Rationale |
|----------|-----------|
| 不用 vue-router，viewState 切换 | Phase 1 页面少 |
| 反馈面板左右分栏，仅 diff 场景并排 | 代码对比需要 |
| 深色模式不做切换 | Phase 4 工作 |
| 正文保持 16px，行高 1.8 | 可读性补偿 |
| 三级诺克斯提示 | 覆盖常见场景 |
| 题目从 HackerRank/LeetCode AI 生成，不手写 | 内容效率 |
| Capstone 和侧链推迟到 Phase 3 | 依赖 AI 基础设施 |
| 不使用 30-Days-Of-Python 作为数据源 | 格式不匹配 |
| 阶段 1-4 做满 28 题，阶段 5-10 各 16-22 题 | 内容优先级 |

## Errors Encountered
（见 `findings.md` 完整记录）

## Phase 1 完成度
核心循环功能全部完成，54 测试通过。剩余问题：
- narrativeExplanation 尚未补齐（28 题缺失）
- hintRoleplay 约 15 题语气不够"朋友"
- 阶段 2-4 题目待生成
