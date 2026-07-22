# ArcanaCoder 项目审查报告

> 审查目标：识别 AI vibe coding 导致的典型问题（虚假引用、过度耦合、重复定义、虚假测试等）  
> 审查范围：`src/` 目录下所有 `.ts`、`.vue`、测试文件及 Playwright E2E 测试  
> 审查方式：静态代码分析 + 运行验证 + 交叉比对  
> 审查日期：2026-06-24  
> 重要说明：**本报告仅审查，未修改任何文件**

---

## 一、执行摘要

### 1.1 总体结论

项目目前**可以运行**：
- ✅ `npm run typecheck` 通过
- ✅ `npm run test` 通过（57 个测试）
- ✅ `npm run build` 通过

但存在**典型的 AI 生成代码问题**，主要集中在：
- **数据层不一致**（章节 ID 映射错误、题目 ID 重复）
- **过度耦合**（QuizPanel 成为"上帝组件"）
- **虚假/薄弱测试**（存在恒成立断言、核心逻辑未覆盖）
- **异步处理隐患**（`save()` 未 `await`）
- **类型安全弱化**（多处 `any`、强制非空断言）

### 1.2 风险等级分布

| 等级 | 数量 | 说明 |
|---|---|---|
| 🔴 高 | 8 | 可能导致运行时 bug 或数据损坏 |
| 🟡 中 | 14 | 影响可维护性，长期会拖慢开发 |
| 🟢 低 | 12 | 代码风格/可读性问题 |

### 1.3 最关键的三个问题

1. **`src/data/backup_questions.ts` 中 `bk_in_1` 重复定义** —— 会导致题目查找不可预期
2. **`src/components/ChapterSelect.vue` 中章节 ID 映射错误** —— `ch2_lists` 应为 `ch2_strings`，第 2 章中文名和节名显示会错乱
3. **`src/stores/gameStore.ts` 中 `save()` 未 `await`** —— IndexedDB 保存失败时无法感知，可能成为未处理的 Promise rejection

---

## 二、AI vibe coding 常见问题检查表

| 问题类型 | 是否出现 | 严重程度 | 具体证据 |
|---|---|---|---|
| 虚假引用 / 死导入 | ✅ 是 | 低 | `DailyPlanDialog.vue` 导入未使用的 `questions` |
| 过度耦合 / 上帝组件 | ✅ 是 | 高 | `QuizPanel.vue` 568 行，承担 10+ 职责 |
| 重复定义 / 重复逻辑 | ✅ 是 | 高 | `backup_questions.ts` 中 `bk_in_1` 重复；`getQuestionsByChapter/Section` 逻辑重复 |
| 虚假测试 / 无意义断言 | ✅ 是 | 高 | `commonErrors.test.ts:42` `toBeGreaterThanOrEqual(0)` 恒成立 |
| 硬编码 Magic Numbers | ✅ 是 | 高 | EXP 公式、疲劳阈值、掌握度算法散落 |
| 类型滥用 `any` | ✅ 是 | 高 | `QuizPanel.vue:64` `userAnswer = ref<any>` |
| 异步错误处理缺失 | ✅ 是 | 高 | `gameStore.ts` 多处 `save()` 未 await |
| 数据不一致 | ✅ 是 | 高 | `ch2_lists` vs `ch2_strings` |
| 未处理空值 | ✅ 是 | 中 | `q.correctOption!` 强制非空断言 |
| 测试覆盖不足 | ✅ 是 | 高 | 覆盖率 49.4%，低于 vitest 配置 60% 阈值 |
| 循环依赖 | ✅ 是 | 低 | `storage.ts` ↔ `gameStore.ts` 类型导入循环 |
| 死代码 | ✅ 是 | 低 | `commonErrors.ts` 未被业务组件使用 |
| 模板复杂表达式 | ✅ 是 | 低 | `ChapterSelect.vue` 模板中直接数组索引计算 |
| 脆弱的 E2E 选择器 | ✅ 是 | 中 | Playwright 大量依赖中文文案选择器 |
| 备份文件污染仓库 | ✅ 是 | 低 | `src/data/*.bak` 文件 |

---

## 三、高危问题详细报告

### 🔴 H1: QuizPanel.vue 过度耦合（上帝组件）

- **文件**：`src/components/QuizPanel.vue`
- **行数**：568 行
- **问题**：
  - 同时承担：题目切换、代码执行、free coding 校验、输出对比、备用题注入、疲劳检测、休息弹窗、结果展示、节完成、重试逻辑、Nox 提示
  - 直接依赖：`gameStore`、`pyodide`、`questions/backupQuestions`、`diff`、`codeValidator`、4 个子组件
- **后果**：
  - 任何小改动都可能影响整个答题流程
  - 无法单元测试（当前覆盖率 0%）
  - 难以复用
- **修复建议**：
  - 抽取 `useQuizEngine` composable
  - 抽取 `useCodeValidation` 或 `services/questionValidation.ts`
  - 抽取 `useFatigue` composable
  - QuizPanel 只负责布局与事件委托

### 🔴 H2: 题目 ID 重复

- **文件**：`src/data/backup_questions.ts`
- **位置**：第 203 行和第 610 行
- **问题**：两个不同的题目都使用 `id: 'bk_in_1'`
- **后果**：
  - `questions.find(q => q.id === 'bk_in_1')` 永远返回第一个
  - 备用题库查找行为不可预期
  - 数据完整性被破坏
- **修复建议**：
  - 立即重命名其中一个（如 `bk_str_in_1`）
  - 增加 CI 检查题目 ID 唯一性的脚本

### 🔴 H3: 章节 ID 映射错误

- **文件**：`src/components/ChapterSelect.vue`
- **位置**：第 14-33 行
- **问题**：
  - `chapterNames` 使用 `ch2_lists: '爬虫山脉'`，但真实章节 ID 是 `ch2_strings`
  - `sectionNames` / `sectionSubs` 使用 `s2_lists: '文献采集'`，但真实节 ID 是 `s2_advanced`
- **后果**：
  - 第 2 章中文名无法正确显示
  - 世界地图、章节卡片、解锁逻辑可能错乱
- **修复建议**：
  - 统一使用 `ch2_strings`、`s2_advanced`、`s2_methods`、`s2_format`
  - 将显示名迁移到数据层，不在组件中硬编码

### 🔴 H4: save() 未 await

- **文件**：`src/stores/gameStore.ts`
- **位置**：第 73、163、183、294 行
- **问题**：`save()` 在同步函数中被直接调用，未 `await`
- **后果**：
  - IndexedDB 保存失败时无法感知
  - 可能成为未处理的 Promise rejection
  - 调用方无法确认保存是否成功
- **修复建议**：
  - 将 `markWisdomViewed`、`submitAnswer`、`completeSection`、`resetProgress` 改为 `async`
  - 对 `save()` 使用 `await` 或 `.catch` 统一错误处理

### 🔴 H5: 虚假测试（恒成立断言）

- **文件**：`src/__tests__/commonErrors.test.ts`
- **位置**：第 36-43 行
- **问题**：
  ```ts
  expect(errors.length).toBeGreaterThanOrEqual(0)
  ```
  这个断言对任何数组都恒成立，没有真正测试拼写检测逻辑。
- **后果**：
  - 测试通过了，但功能可能是坏的
  - 产生"测试覆盖"的虚假安全感
- **修复建议**：
  - 补充真实命中用例
  - 断言具体的 `message`、`noxHint`、`confidence`

### 🔴 H6: 测试覆盖率低于阈值

- **当前覆盖率**：行 49.4% / 函数 45.31% / 分支 72.48%
- **配置阈值**：`vitest.config.ts` 中 60%
- **问题**：CI 虽然通过（因为 threshold 配置可能未生效或被覆盖），但实际覆盖不足
- **核心未覆盖模块**：
  - `src/App.vue`：0%
  - `src/components/QuizPanel.vue`：0%
  - `src/components/ChapterSelect.vue`：0%
  - `src/services/pyodide.ts`：0%
  - `src/utils/codeValidator.ts`：0%
  - `src/utils/errorParser.ts` 的 `findErrorLines`：0%
- **修复建议**：
  - 为 QuizPanel 编写组件测试
  - mock `pyodide` 服务
  - 提升覆盖率至 60% 以上

### 🔴 H7: 类型系统失效（userAnswer = ref<any>）

- **文件**：`src/components/QuizPanel.vue`
- **位置**：第 64 行
- **问题**：答题状态使用 `any`，导致下游所有类型检查失效
- **后果**：
  - 无法发现选择题/代码题答案类型混用的问题
  - 运行时容易出现类型错误
- **修复建议**：
  - 改为 `ref<string | number | null>(null)`
  - 结合 `Question` 的 discriminated union 做类型收窄

### 🔴 H8: Question 类型未做 discriminated union

- **文件**：`src/types/index.ts`
- **位置**：第 21-52 行
- **问题**：所有题型字段堆在一个接口里，大量使用 `?`
- **后果**：
  - 代码中充满 `q.options?.[q.correctOption!]` 这类防御式访问
  - 类型系统无法保证"选择题必须有 options"
- **修复建议**：
  - 拆分为 `ChoiceQuestion`、`CodeQuestion` 等子类型
  - 使用 `type Question = ChoiceQuestion | CodeQuestion | ...`

---

## 四、中危问题详细报告

### 🟡 M1: 游戏规则硬编码

- **文件**：`src/stores/gameStore.ts`
- **位置**：多处
- **问题**：
  - `calcExpToNext` 公式 `100 * level`
  - `EXP_TABLE` 硬编码
  - 答错经验 `Math.floor(baseExp / 3)`
  - 掌握度算法 `consecutiveCorrect >= 3`、`totalAttempts / 5`
- **后果**：调整平衡性困难，magic numbers 遍布
- **修复建议**：集中到 `src/constants/progression.ts` 和 `src/utils/mastery.ts`

### 🟡 M2: Store 直接暴露 state

- **文件**：`src/components/ChapterSelect.vue`、`src/components/DailyPlanDialog.vue`
- **问题**：组件直接访问 `store.state.xxx`
- **后果**：破坏 store 封装，组件与状态结构紧耦合
- **修复建议**：store 提供 getter，如 `isChapterUnlocked`、`unlockedChapterCount`

### 🟡 M3: 代码校验逻辑写在组件里

- **文件**：`src/components/QuizPanel.vue` 第 105-153 行
- **问题**：`validateCode` 和 `validateFreeCoding` 直接写在 QuizPanel 中
- **修复建议**：迁移到 `src/services/questionValidation.ts`

### 🟡 M4: commonErrors.ts 成为死代码

- **文件**：`src/utils/commonErrors.ts`
- **问题**：只在测试中使用，业务组件未调用
- **后果**：维护两套错误诊断逻辑
- **修复建议**：整合到 FeedbackPanel 或删除

### 🟡 M5: 数据层 .bak 文件污染仓库

- **文件**：`src/data/backup_questions.ts.bak`、`src/data/stage1_questions.ts.bak`、`src/data/stage2_questions.ts.bak`
- **后果**：增加体积，Grep 时重复命中
- **修复建议**：删除或加入 `.gitignore`

### 🟡 M6: Playwright E2E 测试脆弱

- **文件**：`e2e/tests/*.spec.ts`
- **问题**：
  - 大量使用 `page.waitForTimeout(400~5000)`
  - 选择器硬编码中文文案
  - 对已知失败直接 `passed: false` 继续，不触发测试失败
  - 通过正则解析 DOM 文本判断备用题插入
- **修复建议**：
  - 使用 `data-testid` 选择器
  - 用显式等待替代固定 sleep
  - 对已知失败使用 `test.fixme` 并附 issue 链接

### 🟡 M7: 模板复杂表达式

- **文件**：`src/components/ChapterSelect.vue`
- **问题**：
  - `['I', 'II', 'III', 'IV', 'V'][chapters.indexOf(ch)]`
  - `region.replace('圣殿', '').replace('山脉', '')...`
- **修复建议**：提取为 computed 或 helper 函数

### 🟡 M8: pyodide.ts 类型不精确

- **文件**：`src/services/pyodide.ts`
- **问题**：
  - `LoadPyodideFn options?: any`
  - `(window as any).loadPyodide`
  - `catch (err: any)`
- **修复建议**：
  - 在 `env.d.ts` 声明 `Window.loadPyodide`
  - 使用 `catch (err: unknown)`

### 🟡 M9: storage.ts 与 gameStore.ts 循环依赖

- **文件**：`src/services/storage.ts`、`src/stores/gameStore.ts`
- **问题**：storage 从 gameStore type-import `GameState`，gameStore 从 storage value-import save/load
- **后果**：TS 模块依赖图成环
- **修复建议**：将 `GameState` 迁移到 `src/types/index.ts`

### 🟡 M10: 迁移函数使用 Record<string, any>

- **文件**：`src/stores/gameStore.ts` 第 261 行
- **问题**：`migrate(saved: Record<string, any>): GameState`
- **修复建议**：定义 `PersistedGameState` 接口，做运行时校验

### 🟡 M11: OutputPredict 错误与输出混淆

- **文件**：`src/components/OutputPredict.vue` 第 25 行
- **问题**：`actualOutput.value = error || output || '(无输出)'`
- **修复建议**：拆分为 `error` 和 `output` 两个状态

### 🟡 M12: e2e_flow.test.ts 名不副实

- **文件**：`src/__tests__/e2e_flow.test.ts`
- **问题**：名为 E2E，实际是数据+store 集成测试，不启动浏览器
- **修复建议**：重命名为 `flow.integration.test.ts` 或 `dataIntegrity.test.ts`

### 🟡 M13: 函数返回类型缺失

- **文件**：多处
- **问题**：大量导出函数和组件核心函数未显式标注返回类型
- **修复建议**：尤其是 `async` 函数和 store actions

### 🟡 M14: 备用题与主线题内容高度重叠

- **文件**：`src/data/backup_questions.ts` vs stage files
- **问题**：多个 backup 题与主线题考察同一知识点
- **修复建议**：建立题目模板/变体机制

---

## 五、低危问题详细报告

### 🟢 L1: 死导入

- `src/components/DailyPlanDialog.vue:4` 导入未使用的 `questions`
- `src/data/questions.ts:93` `getQuestionById` 未使用
- `src/services/pyodide.ts:68` `getPyodide` 未使用

### 🟢 L2: Tailwind 类重复

- 多个组件重复出现 `rounded-full bg-magic-accent border-2 border-magic-gold` 等类组合
- **修复建议**：抽取 `BaseButton`、`AvatarIcon` 原子组件

### 🟢 L3: wisdom.ts 中 ch3_lists 提前定义

- `src/data/wisdom.ts:272` 定义了 `ch3_lists`，但 `questions.ts` 中尚无该章节
- **修复建议**：保持同步或先移除

### 🟢 L4: commonErrors pattern 字段语义不清

- `commonErrors` 的 `pattern` 字段当前未消费，且内容可能是自然语言或代码片段
- **修复建议**：明确消费方式，按字面匹配或正则匹配

### 🟢 L5: 进度条边界未处理

- `src/components/QuizPanel.vue:356`、`src/components/ChapterComplete.vue:57`
- `total === 0` 时会产生 `NaN%`
- **修复建议**：增加保护判断

### 🟢 L6: 使用 confirm() 全局函数

- `src/components/QuizPanel.vue:322` 直接调用 `confirm(msg)`
- **修复建议**：封装确认对话框组件

---

## 六、虚假测试专项分析

### 6.1 恒成立断言

```ts
// src/__tests__/commonErrors.test.ts:42
expect(errors.length).toBeGreaterThanOrEqual(0)
```

**问题**：任何数组的 length 都 ≥ 0，此断言永远通过。

### 6.2 测试名与内容不符

```ts
// src/__tests__/commonErrors.test.ts:29
test('detects variable typo via levenshtein', () => {
  // 实际测试的是：没有 expected vars 时不会误判
})
```

### 6.3 未测试核心函数

- `errorParser.ts` 的 `findErrorLines` 完全未测
- `codeValidator.ts` 完全未测
- `pyodide.ts` 完全未测
- `gameStore.ts` 的 `load`、`getChapterAccuracy`、疲劳函数未测

### 6.4 E2E 中的"伪通过"

```ts
// e2e/tests/scenario_A_all.spec.ts:52-65
if (!option) {
  result.passed = false
  continue  // 不触发测试失败！
}
```

### 6.5 覆盖率不达标的测试集

虽然 57 个测试全部通过，但行覆盖率 49.4%，说明大量代码没有测试保护。

---

## 七、如何在未来避免这些问题

### 7.1 与 AI 协作的纪律

1. **小步生成，不要一次要太多代码**
   - 一次只生成/修改一个组件或一个功能
   - 生成后立即 review 和测试

2. **强制 AI 遵守架构约束**
   - 每次开始前重申："单一职责、不硬编码、使用类型、要写测试"
   - 让 AI 先给方案，再写代码

3. **要求 AI 自我审查**
   - 生成代码后，要求 AI 列出"这段代码可能的 3 个问题"
   - 这是发现隐藏 bug 最有效的方法

4. **不信任 AI 写的测试**
   - 必须人工阅读每个断言
   - 检查是否有 `toBeTruthy()`、`toBeDefined()`、`toBeGreaterThanOrEqual(0)` 等弱断言
   - 测试应该先写失败版本，确认失败后再修复

5. **数据变更必须有校验**
   - 新增/修改题目后，运行数据完整性检查
   - 检查 ID 唯一性、章节关联、选项数量

### 7.2 建立代码规范

1. **组件大小限制**
   - Vue 单文件不超过 250 行
   - 超过就拆分 composable 或子组件

2. **禁止直接使用 `any`**
   - 除非有充分理由，并在注释中说明
   - 优先使用 `unknown` + 类型守卫

3. **异步函数必须处理错误**
   - `async` 函数内部对 `await` 用 `try/catch`
   - 不要 fire-and-forget

4. **store 不暴露 state**
   - 只通过 getter 和 action 访问
   - 组件不直接读写 `store.state`

5. **游戏规则集中管理**
   - EXP、掌握度、疲劳阈值全部放到 `constants/` 和 `utils/`
   - 组件中不出现 magic numbers

### 7.3 CI/CD 防护

1. **类型检查**：`vue-tsc --noEmit`
2. **单元测试**：`vitest run`
3. **覆盖率门禁**：设置 60% 行覆盖率，且只能提升不能下降
4. **构建检查**：`npm run build`
5. **数据完整性检查**：自定义脚本检查题目 ID 唯一性、章节/节/题目关联
6. **E2E 测试**：Playwright 用 `data-testid` 选择器

### 7.4 推荐的数据校验脚本

```ts
// scripts/validate_questions.ts
import { questions, chapters } from '../src/data/questions'

// 检查 ID 唯一性
const ids = questions.map(q => q.id)
const duplicates = ids.filter((item, index) => ids.indexOf(item) !== index)
if (duplicates.length > 0) {
  throw new Error(`Duplicate question IDs: ${duplicates.join(', ')}`)
}

// 检查章节/节/题目关联
for (const ch of chapters) {
  for (const sec of ch.sections) {
    for (const qId of sec.questionIds) {
      const q = questions.find(q => q.id === qId)
      if (!q) throw new Error(`Missing question: ${qId} in ${sec.id}`)
      if (q.chapterId !== ch.id) throw new Error(`Question ${qId} chapter mismatch`)
    }
  }
}

console.log('✅ Question data validation passed')
```

---

## 八、你自己如何审查代码

### 8.1 每次 AI 生成后必做的 5 件事

1. **运行三件套**：`typecheck` → `test` → `build`
2. **读 diff**：用 `git diff` 看所有变更，不要只看 AI 的总结
3. **读测试**：每个新测试都要读断言，确认它真的能失败
4. **查重复**：新代码是否和已有代码重复？是否该抽离？
5. **查引用**：新 import 是否真实存在？是否被使用？

### 8.2 审查 Checklist

#### 架构
- [ ] 组件是否只做一件事？
- [ ] 是否出现新的上帝组件（>250 行）？
- [ ] store 是否暴露了 state？
- [ ] 是否有循环依赖？

#### 数据
- [ ] 新增 ID 是否唯一？
- [ ] 类型定义是否与实际数据一致？
- [ ] 是否有硬编码的 ID/name？

#### 类型
- [ ] 是否使用了 `any`？
- [ ] 是否有 `!` 非空断言？
- [ ] 函数是否标注了返回类型？
- [ ] `async` 函数是否处理了错误？

#### 测试
- [ ] 测试是否真的能失败？
- [ ] 断言是否具体？（避免 `toBeTruthy`、`toBeDefined`、`toBeGreaterThanOrEqual(0)`）
- [ ] 是否覆盖了边界情况？
- [ ] 是否有 mock 了但没有验证调用？

#### 风格
- [ ] 是否有 magic numbers/strings？
- [ ] 模板中是否有复杂表达式？
- [ ] 类名是否语义清晰？

### 8.3 推荐工具

| 工具 | 用途 |
|---|---|
| `vue-tsc --noEmit` | TypeScript 类型检查 |
| `vitest run --coverage` | 测试 + 覆盖率 |
| `eslint` / `prettier` | 代码风格 |
| `git diff` | 人工审查 |
| `grep -r "any" src/` | 查找 any 滥用 |
| `grep -r "toBeGreaterThanOrEqual(0)" src/__tests__` | 查找弱断言 |
| `grep -r "save()" src/stores` | 检查异步调用 |

### 8.4 一个快速发现问题的脚本

```bash
#!/bin/bash
# scripts/quick_check.sh

echo "=== 1. Type Check ==="
npm run typecheck || exit 1

echo "=== 2. Tests ==="
npm run test || exit 1

echo "=== 3. Build ==="
npm run build || exit 1

echo "=== 4. Check for 'any' in source ==="
grep -rn "ref<any>" src/ || true
grep -rn "as any" src/ || true

echo "=== 5. Check for unawaited save ==="
grep -rn "save()" src/stores/

echo "=== 6. Check component sizes ==="
wc -l src/components/*.vue src/stores/*.ts src/services/*.ts

echo "=== Done ==="
```

---

## 九、修复优先级建议

### P0（本周必须修）

1. 修复 `backup_questions.ts` 中 `bk_in_1` 重复
2. 修复 `ChapterSelect.vue` 中 `ch2_lists` → `ch2_strings`
3. 将 `gameStore` 中 `save()` 调用改为 `await`
4. 修复 `commonErrors.test.ts` 中的恒成立断言
5. 删除 `src/data/*.bak` 文件或加入 `.gitignore`

### P1（本月修）

6. 拆分 `QuizPanel.vue`
7. 将 `Question` 类型改为 discriminated union
8. 修复 `userAnswer = ref<any>`
9. 将游戏规则硬编码值抽到 `constants/`
10. store 不再直接暴露 `state`
11. 提升测试覆盖率到 60%+

### P2（后续优化）

12. 重构 Playwright E2E 测试
13. 抽取 `BaseButton`、`AvatarIcon` 等原子组件
14. 整合或删除 `commonErrors.ts`
15. 添加数据完整性校验脚本到 CI

---

## 十、总结

ArcanaCoder 项目已经跑通了核心循环，但作为 AI vibe coding 的产物，它典型地存在：**能运行但不可维护**的问题。最危险的不是某个 bug，而是：

- 数据层不一致会在内容扩展时持续放大
- QuizPanel 的耦合会让新题型/新机制难以加入
- 假测试和未覆盖的核心逻辑会让重构缺乏安全网
- 未 await 的保存会在真实用户场景下出现数据丢失

建议先集中修复 P0 问题，然后按 P1/P2 逐步重构。每次重构都应有测试保护。

---

*报告生成时间：2026-06-24*  
*审查方式：多代理并行代码审查 + 运行验证*  
*未修改任何源文件*
