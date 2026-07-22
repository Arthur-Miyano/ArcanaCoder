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

## 2026-06-23

### 新加
- [内容体系] 基于 walter201230/Python 教程重新设计 10 章教学内容（5 区域 × 2 章）
- [内容体系] 第 9-10 章覆盖现代 Python 工程：pytest/logging/ruff/async/dataclass/uv/打包
- [定位] 高阶内容（9-10 章）以概念题为主（choice 70% + code_fill 30%），适配 Pyodide 限制
- [设计规格] 更新内容结构表，明确每章节数据文件命名规范 `stage{N}_questions.ts`

### 删除
- `方案_主题题库修复.md` — Phase 1 已执行完毕，存在会误导
- `方案_Phase1收尾.md` — 已过时，修复已落地
- `题目审核清单_完整版.md` — 2032 行 Phase 1 审核记录，当前状态与代码不一致

### 归档
- `audit_report.md` → `archive/`
- `方案_Phase2_掌握度模型.md` → `archive/`

### 已废弃
- 方案 1.1（初始架构，已过时）
- 方案 1.2（错误修复，已合并到 findings.md）
- 方案 1.3（设计决策，已合并到设计规格.md）
- 方案 1.4（补全方案，已合并到设计规格.md）
- 方案 1.5（内容结构重构，已合并到设计规格.md）

## 2026-06-24

### 架构重构
- [grade()] 从 QuizPanel 抽离判题逻辑到 `src/utils/grade.ts` — 纯函数可测
- [useQuiz] 从 QuizPanel 抽离答题逻辑到 `src/composables/useQuiz.ts` — QuizPanel 473→137 行
- [ChapterSelect] 移除硬编码 chapterNames/sectionNames → 数据驱动（displayName/regionName）
- [constants] EXP_TABLE/calcExpToNext 从 gameStore 移到 `src/constants/progression.ts`
- [mastery] calcMastery 从 gameStore 移到 `src/utils/mastery.ts`
- [usePythonRunner] 新建 composable 封装 Pyodide 状态管理

### 数据修复
- [s2_17] 选项文本 `\n` 被解释为换行符 → 改为 `\\n`
- [s2_02] R"" 合法但只认小写 r → 改描述明确要求小写 r
- [s2_20] free_coding 测试用例 2→6 个（补充空字符串/无逗号/多逗号边界）

### 测试体系
- [变体矩阵] 新增 `scenario_variants.spec.ts` — 14 变体验证判题空格/等价实现/空答案
- [备用题] 新增 `scenario_backup.spec.ts` — 答错触发备用题验证
- [fake tests] 删除 gameStore.test.ts / e2e_flow.test.ts；纯函数测试移到 `src/utils/*.test.ts`（31 测试，4 文件，1.5s）
- [vitest] 新增 `src/utils/grade.test.ts` — gradeChoice 纯函数测试

### 体验改进
- [疲劳弹窗] 45 分钟累计 + 非答题页弹（ChapterSelect 入口），跨会话持久
- [Pyodide] LoadingOverlay 15 秒后显示慢加载提示"需下载约 10MB"

### 基础设施
- [错误监控] window.onerror + app.config.errorHandler + IndexedDB error_log
- [save()] try-catch 包裹 saveGameState，防静默崩溃
- [存储重试] IndexedDB getDb 最多 3 次重试
- [数据版本] GameState 加 version 字段 + migrate() 兼容逻辑

### 文档体系
- [新增] `题目设计规范.md` — 题目创建硬性规则（TS转义/选项互斥/validationMode/用例数）
- [新增] `测试策略.md` — 测试金字塔/测什么不测什么/判题验证哲学
- [新增] `已知缺口.md` — 跨会话持久追踪未完成需求
- [更新] `方案_执行计划.md` — 重构为三线并行（建系统/修数据/推内容）
- [更新] `项目总纲_v2.md` — 整合 GDD+设计规格+路线图
- [更新] `设计规格.md` — 新增 §11 AI Vibe Coding 预防规范（30+ 规则）
- [更新] `CLAUDE.md` — 加入需求确认三栏格式 + 记录命名规则

### 归档
- 方案_问题复盘与改进机制.md → archive/
- 方案_Playwright测试扩展计划.md → archive/
- 方案_s1_23_s1_24修复.md → archive/
- 方案_全量测试计划.md → archive/
- 方案_完整用户流程与Playwright修正方案.md → archive/
- 方案_所有问题汇总与修复计划.md → archive/
- task_plan.md → archive/
- progress.md → archive/
- 记录审查.md → archive/
- ArcanaCoder_开发路线图_v4.1.md → archive/

## 2026-06-24（续）

### 内容体系完成（ch8-ch10）

- [ch8] 类型注解/dataclass/上下文管理器 — 20 题（数据库森林）
- [ch9] pytest/logging/ruff — 18 题（前端海岸，choice 89%）
- [ch10] async/uv/打包发布 — 18 题（前端海岸，choice 89%）
- **10 章总计 212 题 + 36 备用题 = 248 题**，覆盖 Python 基础→现代工程实践

### 第二轮审查修复（C 系列）

- [C1] verify_questions.cjs B2 统计 bug — 改用章节级 regex + 补全 FILES
- [C2] pyodide.ts stdoutBuffer 局部化 — 每调用独立 buffer
- [C3] userAnswer 类型 — 改为 `ref<UserAnswer>` + `computed{get/set}` 组件适配
- [C4] migrate 类型安全 — `migrate(raw: unknown)` + 类型守卫
- [C5] store.state 保留但加注释 — E2E 测试专用
- [C6] 死导出清理 — 确认已在 P2-5 从 return 移除
- [verify] 空格敏感 off-by-one bug — 修复 `+1` 偏移，错误从 8 → 0

### 设计规格同步（7 项）

- §4.2 数据模型：补 displayName/regionName/regionOrder
- §6 测试数量：54 → 71
- §9.1 验证步骤：改为 `npm run test`（含 coverage）
- §11.2 ChapterSelect：🔄 → ✅
- §11.3 Store 封装：加 `state` 保留说明
- §11.5 类型安全：加 `any` 缺口追踪
- §11.8 测试规范：toBeDefined 加数据完整性测试说明
