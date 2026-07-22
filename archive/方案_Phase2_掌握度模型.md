# ArcanaCoder Phase 2 — 掌握度模型方案 v1.1

> 基于 v1.0 审查意见修正。核心变更：FSRS → 简单掌握度模型。

---

## 一、核心设计变更

### v1.0 的问题

| 错误 | 根因 | 修正 |
|------|------|------|
| FSRS 与闯关模式冲突 | 方案只设计了"学习闭环"，没设计"复习闭环"，R 值单向下降 | 改用"基于答题历史的简单掌握度"，不依赖时间衰减 |
| 薄弱点阈值 0.9 | 过于严格，大量误判 | 改为 0.7 |
| KnowledgeState 与 SectionProgress 关系未定义 | 跳过接口设计 | 明确定义：SectionProgress 控制进度，KnowledgeState 反映质量 |
| 每日计划含"项目" | 复制了路线图内容，Phase 2 不该有 | 移除项目，只留薄弱巩固 + 主线 |

---

## 二、掌握度模型

### 2.1 数据结构

```typescript
interface KnowledgeState {
  knowledgeTag: string
  totalAttempts: number
  correctAttempts: number
  consecutiveCorrect: number
  lastSeen: number          // 仅用于排序，不用于衰减
}
```

**与 SectionProgress 的关系：**

| 数据 | 用途 | 来源 |
|------|------|------|
| SectionProgress | 判定节是否通关（全对） | `submitAnswer` 更新 |
| KnowledgeState | 反映知识点掌握质量 | `submitAnswer` 时按 `knowledgeTags` 同步更新 |

两者独立：节通关了（SectionProgress.completed = true）但该节的知识点掌握度可能只有 0.6。UI 上地图节点显示"已通关金色星星"，侧边栏知识点显示"掌握度 60%"。两者不矛盾——节通关只说明"这节的题都答过且正确"，掌握度反映"同知识点在不同场景下答对的稳定性"。

### 2.2 计算公式

```typescript
function getMastery(state: KnowledgeState): number {
  if (state.totalAttempts === 0) return 0
  if (state.consecutiveCorrect >= 3) return 1.0
  const baseRate = state.correctAttempts / state.totalAttempts
  const volumeBonus = Math.min(state.totalAttempts / 5, 1)
  return baseRate * (0.5 + 0.5 * volumeBonus)
}
```

**行为：**
- 连续答对 3 次 → 直接 100%（充分证明已掌握）
- 答对 5 次以上 → `volumeBonus = 1`，满分衰减消失
- 薄弱点阈值：**0.7**（非 0.9）

### 2.3 存储

```typescript
interface GameState {
  // 现有字段...
  knowledgeStates: Record<string, KnowledgeState>
}
```

每次 `submitAnswer` 调用时，遍历题目 `knowledgeTags`，更新对应 `KnowledgeState`。

---

## 三、Phase 1 数据债务（Step 0）

先修完再进 Phase 2 核心功能。

| 待修项 | 说明 | 预估 |
|--------|------|------|
| narrativeDesc 术语替换 | 约 20 道题描述中仍有"print/字符串/变量"等禁用词 | 30min |
| difficulty 分布 | 全部为 1 星，需调整为 1-3 星混合 | 15min |

**不修的：** 选项格式问题已在前次修复中修正。

---

## 四、薄弱点检测 + 可视化

薄弱点检测嵌入 `gameStore.submitAnswer()` 中，每次答题后计算该题所有 `knowledgeTags` 的当前掌握度。

可视化方式：在 `ChapterSelect` 中，章节卡片展开后显示各知识点的掌握度进度条。

```
第 1 关：变量与类型
  □ 变量赋值     ██████████ 100%
  □ 数据类型     ███████░░░ 70%  ⚠️ 薄弱
  □ f-string     █████████░ 90%
```

---

## 五、每日计划

### UI：选择时长弹窗

登录后显示弹窗：

```
┌─────────────────────────────┐
│ 今日修行时间                │
│   30分钟 / 1小时 / 2小时    │
│   ┌─────────────────┐       │
│   │ 自定义输入: 120分钟 │   │
│   └─────────────────┘       │
│       [确认]                │
└─────────────────────────────┘
```

### 薄弱巩固题源

从 `backup_questions.ts` 中按 `knowledgeTags` 匹配抽取，每知识点最多 2 道。
备用题与主线题共享 `KnowledgeState`——补练即复习，不区分"这是主线题还是备用题"。

### 计划生成规则

1. 筛选掌握度 < 0.7 的知识点，按"最近出错时间"排序
2. 每次计划最多处理 3 个薄弱知识点
3. 连续补练答对 3 次 → 自动移出薄弱列表
4. 只保留"薄弱巩固 + 主线推进"，移除"项目"

### 计划生成

```
薄弱巩固：掌握度 < 0.7 的知识点（最多 3 个）
  题源：backup_questions.ts 按 knowledgeTags 匹配
  答对 3 次后从薄弱列表移除
主线推进：当前未通关的节

### 诺克斯提醒

确认时长后诺克斯以对话形式显示今日计划。关闭后下次打开重新生成。

---

## 六、题目扩容（84 题）

| 阶段 | 内容 | 题数 | 策略 |
|------|------|------|------|
| 2 | 字符串与类型转换 | 28 | 按已修复的阶段 1 模板生成 |
| 3 | 条件判断 | 28 | 阶段 2 审核通过后再生成 |
| 4 | 循环 | 28 | 同上 |

**备用题库升格：** 24 道备用题中质量合格的可升格为主线题，减少生成量。具体由你审查 `题目审核清单_完整版.md` 后决定。

### 阶段 2 质量门禁

阶段 2 的 28 题必须全部通过以下审核才能进入阶段 3 生成：

| 审核项 | 标准 |
|--------|------|
| narrative 字段 | 每题完整包含 Title / Desc / Explanation |
| 诺克斯语气 | hintRoleplay 带朋友语气（嘿/哈哈/我当年） |
| commonErrors | 每道至少 1 条 |
| GDD 禁用词 | narrative 层无"print/字符串/代码/输出/变量/修复" |
| 编译验证 | vue-tsc 0 error + vitest 通过 + build exit 0 |

---

## 七、实现顺序

```
Step 0: 修 Phase 1 数据债务（术语替换 + 难度分布）
Step 1: 简单掌握度模型（KnowledgeState + getMastery）
Step 2: 薄弱点检测 + 可视化（ChapterSelect 知识进度条）
Step 3: 每日时长选择 + 计划生成器
Step 4: 生成阶段 2 题目（28 题）
Step 5: 审核阶段 2 质量，确认后生成阶段 3-4
Step 6: 集成测试
```

---

## 八、待你确认

| # | 事项 | 建议 |
|---|------|------|
| 1 | 掌握度模型 | 采用"简单掌握度模型" |
| 2 | 先修债务 Step 0 | 先做术语替换 + 难度分布 |
| 3 | 薄弱点阈值 | 0.7 |
| 4 | 备用题升格为主线 | 你审查后决定 |
| 5 | 掌握度可视化 | 在 ChapterSelect 展开卡中显示 |
