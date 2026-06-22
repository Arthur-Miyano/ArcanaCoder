# Changelog

> 所有设计决策的变更记录。格���：[类型] 变更内容 — 原因

## 2026-06-22

### 新加
- [设计规格] 创建 `设计规格.md`，合并方案 1.1-1.5 的全部已批准决策
- [归档] 旧方案移至 `archive/`，主目录只留 `设计规格.md` 和 `Phase4_像素风...`
- [功能] 测试基础设施：vitest 35 用例 + CI test 步骤
- [功能] 智慧之书 3D 翻页 + 双栏书本布局 + 目录页 + 移动端回退
- [功能] commonErrors 模式匹配引擎（大小写/空白/str+int/变量拼写）
- [数据] 阶段 1 28 题数据（试炼一 9 + 试炼二 10 + 试炼三 9）
- [修复] diff 空白检测逻辑：`trim()` → `collapseWhitespace()`
- [修复] gameStore 通关条件：`attempts > 0` → `correct === true`
- [修复] free_coding testCases 格式：`input: '3'` → `input: 'circle_area(3)'`
- [修复] free_coding correctCode：去掉 `print()` 行避免重复输出
- [修复] 重试模式：答错不跳题 + 答对从 retryIds 移除
- [修复] FeedbackPanel：双重 `v-if` → 内联渲染

### 已废弃
- 方案 1.1（初始架构，已过时）
- 方案 1.2（错误修复，已合并到 findings.md）
- 方案 1.3（设计决策，已合并到设计规格.md）
- 方案 1.4（补全方案，已合并到设计规格.md）
- 方案 1.5（内容结构重构，已合并到设计规格.md）
