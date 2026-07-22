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

## 错误记录（Phase 1 开发周期，完整）

### 第一轮：数据与判题

| 错误 | 根因 | 修复 | 验证方式 |
|------|------|------|---------|
| free_coding 判题永远判错 | testCases.input 写裸参数 `'3'`，验证代码 `print(3)` 输出 `3`，期望 `28.27` | testCases.input 改为完整函数调用 `circle_area(3)` | `python -c` 跑一遍 |
| Boss 题 correctCode 含 print 导致重复输出 | correctCode 自带 `print(greet("贤者"))`，测试再拼接 `print(greet("冒险者"))` 后输出两行 | correctCode 去掉 print 行 | 2 个测试用例 PASS |
| free_coding 检测格式没加函数名 | test.input 是 `'3'` 不是 `'circle_area(3)'` | 修改 testCase 格式，明确需要完整函数调用 | 4 个测试用例 PASS |

### 第二轮：UI 渲染与反馈

| 错误 | 根因 | 修复 |
|------|------|------|
| 反馈弹窗不显示 | FeedbackToast 双重 `v-if` 竞争条件 | 删除 FeedbackToast，改用 FeedbackPanel |
| 关卡错误判通关 | 通关条件为"所有题已答"而非"所有题正确" | gameStore 改为 `allCorrect` 检查 |
| diff 误判 78.5 vs 78.50 | 字符串比较 `"785" ≠ "7850"` | 改为提取数字后 float 比较 + 标点归一化 |
| 重试题跳到序号题而非错题 | nextQuestion 按顺序导航 | 新增 retryIds/isRetryMode |

### 第三轮：重构引入的新 bug（关键教训）

| 错误 | 根因 | 修复 | 预防 |
|------|------|------|------|
| `currentIndex` TDZ | `watch({ immediate:true })` 写在 `const currentIndex = ref(0)` 之前 | 将 watch 移到所有 ref 定义之后 | **所有 `{immediate:true}` 的 watch 必须写在相关 ref 定义之后** |
| `backupLimit` / `fatigue*` TDZ | 同上，6 个变量定义在 watch 之后 | 全部移到 watch 之前 | 同上 |
| IndexedDB `DataCloneError` | Pinia reactive proxy 无法被结构化克隆 | `JSON.parse(JSON.stringify(state))` | **持久化前必须解包 reactive 对象** |
| 节拆分后 UI 不显示节 | `ChapterSelect.vue` 只渲染章级，忽略 sections 数据 | 添加展开/收起式节卡片 | **数据层改动必须同步检查 UI 层** |
| 节完成无反馈 | `nextQuestion` 仍用旧的"章完成"逻辑 | 增加 `showSectionComplete` 视图 | **逻辑拆分后检查所有出口点** |
| 章节拆分后章解锁逻辑被删 | 重构 store 时删掉了旧的 `unlockedChapters.push(ch2)` 代码 | 在 `completeSection` 中检查所有节完成后解锁 | **重构前 diff 检查被删除的代码** |
| GDD 术语违规 22+ 处 | 组件文案直接用"正确/答题/代码"等禁用词 | 全部替换为"魔力共鸣/试炼/咒文" | **提交前对照 GDD §5.1 逐项检查** |

## 重复发生模式分析

| 模式 | 发生次数 | 对策 |
|------|---------|------|
| TDZ 死区（watch 访问未初始化的 ref） | 3 次（currentIndex, backupLimit, fatigue*） | **所有 `{immediate:true}` 的 watch 紧跟在最后一行的 ref 定义之后** |
| 重构时遗漏旧逻辑 | 2 次（章解锁删除、节 UI 没加） | **重构后检查删除了什么，而不是只检查增加了什么** |
| 文本硬编码 | 22+ 处 | **使用 `GDD_TERMS` 常量表，不用裸字符串** |

## 代码质量审计（2026-06-22）

### 发现的问题分类

| 类别 | 问题数 | 已修复 |
|------|--------|--------|
| 死代码（未使用的函数/组件） | 4 处 | ✅ 全部删除 |
| 逻辑重复（同一功能不同实现） | 2 处 | ✅ 统一引用 |
| 模板/样式重复 | 4 处 | ✅ 已重构 2 处 |
| 颜色裸值 | 26 处 | ✅ 替换为 Tailwind 语义类 |
| 导入路径不统一 | 1 处 | ✅ 统一从 data/questions 走 |

### 预防措施

| 模式 | 对策 |
|------|------|
| 新增功能后产生死代码 | 提交前 `git diff --stat` 检查是否有不再引用的文件 |
| 逻辑/样式重复 | 新代码先搜索是否有同类功能，优先扩展而非复制 |
| 颜色裸值 | 已在 `tailwind.config.js` 定义 `magic-*` 语义色，后续禁止直接写 Hex |
| 导入路径混乱 | 统一从 `data/questions` 导入，不从子模块直接引用 |

## 仍需注意

| 项目 | 说明 |
|------|------|
| codeValidator 只做变量名提示 | 不做语法检查，交给 Python 解释器 |
| confirm() 在移动端行为不一 | 后续可改为自定义模态框 |
| narrativeExplanation 缺失 | 28 道题全部缺少，占位符阶段可接受 |
| 约 15 道题 hintRoleplay 语气不够"朋友" | GDD §5.3 要求"嘿""哈哈""我当年..."风格 |

## 解决方案

### 批量修改计划

1. **Title** → index.html
2. **KnowledgeBook + Chapter.knowledge** → types + questions + 新组件 + App.vue
3. **OutputPredict 修复** → 加 initialCode，删无用 code computed
4. **Layout 重构** → CodeMirror 自适应高度 / FeedbackToast 改为 inline / NoxDialog 上移
5. **反馈显示正确答案** → 修改 QuizPanel + FeedbackToast
6. **Pyodide 加载失败处理** → LoadingOverlay 加错误状态 + 重试按钮
