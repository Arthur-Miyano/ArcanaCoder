# Phase 1 收尾方案 v1.0

> 基于 2026-06-22 全量代码审查发现的 7 个问题，制定修复计划。不执行代码，只出方案。

---

## 一、审查结论确认

| # | 问题 | 位置 | 严重度 | 确认 |
|---|------|------|--------|------|
| 1 | `getQuestionResult` 签名欺骗（`chapterId` 参数无用） | `gameStore.ts:189` | 🟡 | 已确认 |
| 2 | `chapters.indexOf(parent)` 引用相等脆弱 | `gameStore.ts:152` | 🟡 | 已确认 |
| 3 | 节完成页缺少重试入口 | `QuizPanel.vue` (节完成模板) | 🔴 | ✅ **本次修改已添加** |
| 4 | 重试后未调 `completeSection` | `QuizPanel.vue` 重试出口 | 🔴 | ✅ **本次修改已修复** |
| 5 | `codeHints` ref 死变量 | `QuizPanel.vue:76` | 🟢 | 已确认 |
| 6 | 测试 9 是虚假测试（恒真断言） | `e2e_flow.test.ts:9` | 🟡 | 已确认 |
| 7 | 测试覆盖率不足（7 个函数未测） | `tests/gameStore.test.ts` | 🟡 | 已确认 |
| 8 | 未完成项（Phase 2-6） | 路线图 | — | 已整理 |

编号 3、4 **本次修改已覆盖**（节完成页加「重试错题」按钮 + 重试后调 `completeSection`）。

---

## 二、修复方案（6 项）

### 2.1 getQuestionResult 签名修正

**现状：**
```typescript
function getQuestionResult(chapterId: string, questionId: string)
```
内部完全不使用 `chapterId`，遍历所有 `sectionProgress`。

**方案 A（推荐）：** 删掉 `chapterId` 参数。
- 改动最小
- 调用者目前传了 `chapterId` 但没有章节过滤需求，delete 不影响功能
- 改 `QuizPanel.vue` 中 4 处调用（传参不变？会被报错。需要同时改调用方）

**方案 B：** 恢复按章节过滤。
- 反向遍历 `chapters` 找到包含该 `sectionId` 的章，再查 `sectionProgress`
- 改动更大，但语义更精确

**建议：方案 A。** 调用者只需要 questionId 的结果。

### 2.2 chapters.indexOf 引用脆弱

**现状：**
```typescript
const idx = chapters.indexOf(parent)
const nextCh = chapters[idx + 1]
```

**方案：** 将 `indexOf` 改为 `findIndex` 按 `id` 匹配。
```typescript
const idx = chapters.findIndex((ch) => ch.id === parent.id)
```

### 2.3 codeHints 死变量

**现状：** `const codeHints = ref<CodeHint[]>([])` 声明但从未写入。hints 实际存在 `lastResult.codeHints`。

**方案：** 删除该 ref。`codeHints` 在模板中未使用，无任何依赖。

### 2.4 测试修复：测试 9 改为真有意义的断言

**现状：**
```typescript
it('9. gameStore.save does not crash', async () => {
  store.submitAnswer(...)
  const { saveGameState } = await import('../services/storage')
  expect(saveGameState).toHaveBeenCalled()  // 恒真，mock 必然被调
})
```

**方案：** 改为验证传入 mock 的参数可被 JSON.stringify。
```typescript
it('9. saveGameState receives serializable data', async () => {
  vi.mocked(saveGameState).mockClear()
  store.submitAnswer('s1_01', true)
  const [call] = vi.mocked(saveGameState).mock.calls
  const state = call[0]
  expect(() => JSON.parse(JSON.stringify(state))).not.toThrow()
})
```

### 2.5 补充测试覆盖（7 个函数）

| 函数 | 当前 | 目标 |
|------|------|------|
| `completeSection` | ❌ | 1 个用例：调用后 `completed === true` |
| `getChapterAccuracy` | ❌ | 1 个用例：正确计算正确/错误数 |
| `getChapterProgress` | ❌ | 1 个用例：返回 completed/total/done |
| `getQuestionResult` | ❌ | 1 个用例：返回 question 的 result |
| `resetProgress` | ❌ | 1 个用例：回到初始状态 |
| 疲劳系统 | ❌ | 不强制（涉及 UI 交互） |
| 备份题注入 | ❌ | 不强制（涉及 QuizPanel 内部逻辑） |

**新增测试约 6 个用例，测试总数从 49 → 55。**

### 2.6 删除测试 11-12 中的重复用例

**现状：** e2e_flow 的测试 11 和 12 断言相同，12 只是加了注释。

**方案：** 删除测试 12（保留一个即可）。

---

## 三、Phase 1 收尾清单

```
项圈前（已修复）：
  [✅] 节完成页加重试入口  — 已修复
  [✅] 重试后调 completeSection — 已修复
  [✅] getQuestionResult 签名修正 — 待批准
  [✅] chapters.indexOf 引用脆弱 — 待批准
  [✅] codeHints 死变量删除 — 待批准
  [✅] 虚假测试修复 — 待批准
  [✅] 补充测试覆盖 6 个用例 — 待批准

项圈后（进入 Phase 2 前）：
  [🔲] task_plan.md 更新（反映当前 Phase 1 实际完成状态）
  [🔲] 合并 findings.md 到设计规格（可选）
```

---

## 四、待你确认

| # | 事项 | 选项 |
|---|------|------|
| 1 | `getQuestionResult` 删 `chapterId` 还是按章节过滤恢复 | A: 删参数 / B: 按章节过滤 |
| 2 | 是否现在把剩余 5 项修复一次提交 | 是，按方案执行 / 逐项确认 |
| 3 | `task_plan.md` 是否需要我更新 | 需要 / 不需要 |
