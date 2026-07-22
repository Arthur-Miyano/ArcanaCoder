# 完整用户流程记录 & Playwright 修正方案

> 日期：2026-06-23 | 用途：根据实际 DOM 状态重写 e2e 测试

---

## 一、完整用户操作流程（从打开到通关）

### 第 1 屏：LoadingOverlay

- 组件：`LoadingOverlay.vue`
- 入口：`viewState === 'loading'`
- 触发：页面加载 → `onMounted(load)` → `initPyodide()`
- 结束：Pyodide 加载完成 → `emit('ready')` → `onPyodideReady()`
- 结果：`viewState = 'chapterSelect'`, `showDailyPlan = true`

### 第 2 屏：DailyPlanDialog（2 步）

**步骤 A — 选择时长**（`step === 'time'`）
- DOM 检测点：`text=今天打算修行多久`
- 操作：点击时长按钮（30/60/120/240 分钟）
- 操作：点击"确认"按钮（`@click="generate"` → `step = 'plan'`）

**步骤 B — 查看计划**（`step === 'plan'`）
- DOM 检测点：`text=今日计划`
- 操作：点击"开始修行"按钮（`@click="dismiss"` → `emit('start')`）
- 结果：`showDailyPlan = false`，弹窗关闭，露出 ChapterSelect

**总耗时：** 约 2-5 秒（取决于 Pyodide 加载速度）

### 第 3 屏：ChapterSelect

- 组件：`ChapterSelect.vue`
- DOM 检测点：`text=智慧圣殿编年史`
- 章节列表：每章有标题卡片，点击展开显示「节」列表
- 点击章节：展开/收起节列表
- 点击节：调用 `startSection()` → `emit('selectChapter')`

**ch1 的节：**
| 节名 | section id | 题数 |
|------|-----------|------|
| 符文铭刻 | s1_vars | 5 |
| 元素鉴定 | s1_types | 4 |
| 术式推演 | s1_ops | 10 |
| 真言编织 | s1_strings | 9 |

### 第 4 屏：WisdomBook（仅首次进入章节时出现）

- 组件：`WisdomBook.vue`
- DOM 检测点：`text=卷1 ·`（第一章标题）
- 触发条件：`store.isWisdomViewed(chapterId) === false`
- 智慧点数量：**ch1 共 5 个**（变量赋值 → 字符串 → f-string → 导入模块 → 函数定义）
- **"开始试炼"按钮**：`v-if="isLast"`，只有翻到最后一个智慧点才出现
- 按钮文本：**"开始试炼"**（不是"开始"）
- 翻页操作：点击右侧箭头按钮 `.arrow-right` 或 `text=›`
- 跳过后：`store.markWisdomViewed()` → `viewState = 'quiz'`

### 第 5 屏：QuizPanel

- 组件：`QuizPanel.vue`
- DOM 检测点：`[data-testid="btn-submit"]`
- 答题流程：
  1. 渲染题目（Choice/Code/OutputPredict 等子组件）
  2. 用户选择/填写答案
  3. 点击 `[data-testid="btn-submit"]`
  4. 执行中：按钮文字变为"魔力解析中..."，`disabled`，`data-executing="true"`
  5. 执行完成：`data-executing="false"`，`FeedbackPanel` 出现
  6. 点击 `[data-testid="btn-next"]` 下一题

### 第 6 屏：反馈

- 组件：`FeedbackPanel.vue`
- DOM 检测点：`[data-testid="feedback-panel"]`
- 按钮：`[data-testid="btn-next"]` 文本"下一道试炼"
- 答错情况：插入备用题，不跳题
- 答对情况：`currentIndex++`

### 第 7 屏：节完成 / 章节完成

- 节内所有题答对 → `store.completeSection()`
- 章节内所有节完成 → 自动解锁下一章
- 最后一节完成 → ChapterComplete 页

---

## 二、当前 Playwright 测试失败根因

| 用例 | 失败原因 | 根因细节 |
|------|---------|---------|
| 第 3 个（导航+答题） | `[data-testid="btn-submit"]` 不可见 | 智慧之书有 5 页，需翻到最后一页 "开始试炼" 按钮才出现。测试假设按钮立刻可见 |
| 第 4 个（完整周期） | `[data-testid="btn-next"]` 不可见 | 同根因，根本进不去答题面板 |

**失败的 3 个错误假设：**
1. WisdomBook 的"开始试炼"按钮立刻可用 → 实际需要翻完 5 页
2. `has-text("开始")` 能匹配到按钮 → 按钮文本是 "开始试炼"，`has-text` 做子串匹配理论上能行，但需要确认按钮在 DOM 中可见
3. 节名称点进去直接到答题 → 实际先到 WisdomBook

---

## 三、修正后 Playwright 测试流程

```
第 1 步：goto → 等待加载
第 2 步：等待 DailyPlanDialog
第 3 步：确认 → 开始修行 → 弹窗消失
第 4 步：展开语法圣殿 → 点符文铭刻
第 5 步：等待 WisdomBook 出现（检测 "卷1 ·" 文本）
第 6 步：循环翻页，直到 "开始试炼" 按钮可见
第 7 步：点 "开始试炼"
第 8 步：等待 QuizPanel 出现（检测 [data-testid="btn-submit"]）
第 9 步：检测题目类型，选择/输入答案
第 10 步：提交 → 等待 data-executing="false"
第 11 步：等待反馈面板 → 点击下一道试炼
第 12 步：重复 9-11 直到节完成
```

---

## 四、需要你确认后再执行

- [ ] 上述流程是否和你实际手动操作看到的一致
- [ ] 是否按这个流程重写 Playwright 测试
- [ ] 还是先走别的修复项（P1-4 疲劳 / P0-3 开场介绍）
