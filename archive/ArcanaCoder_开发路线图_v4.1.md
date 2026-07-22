# ArcanaCoder: 智慧圣殿编年史
# 开发路线图 v4.1（美术资源后移版）

> 核心原则：先让代码跑起来，再让画面好看
> Phase 1-3 用纯色块/文字占位，Phase 4 批量替换为像素画

---

## Phase 1: 核心循环（Week 1-2）

**目标：能打开网页、能做题、能运行 Python 代码、有即时反馈**

**美术：零要求，全部用纯色块+文字**

| 任务 | 内容 | 验收标准 | 预计时间 |
|------|------|---------|---------|
| 1.1 | Vue 3 + Vite + TypeScript 项目脚手架 | npm run dev 正常启动 | 10min |
| 1.2 | Pyodide 集成（浏览器运行 Python） | 能运行 print("Hello") 并显示输出 | 20min |
| 1.3 | 题目数据结构（5道测试题） | 包含 choice/code_fill/code_fix/output_predict/free_coding | 15min |
| 1.4 | 答题面板组件（QuizPanel.vue） | 根据题型渲染不同输入方式 | 30min |
| 1.5 | 即时反馈组件（FeedbackToast.vue） | 答对绿色/答错红色，显示解析 | 10min |
| 1.6 | Pinia 游戏状态（等级/经验/进度） | 答题后经验值增加，等级提升 | 15min |
| 1.7 | IndexedDB 本地存储 | 刷新页面进度不丢失 | 15min |

**Phase 1 界面示意：**
```
┌─────────────────────────────────────┐
│  [紫色圆块] 贤者 Lv.1  经验: 50/100  │  ← 纯色块占位
├─────────────────────────────────────┤
│  第1关：变量与类型                    │
│                                     │
│  以下哪个是 Python 中的字符串？       │
│                                     │
│  ○ 123                              │
|  ● "123"  ← 选中                   │
|  ○ 123.0                            │
|  ○ True                             │
│                                     │
│  [提交答案]                         │
│                                     │
│  [白色圆块] 诺克斯：选 B 哦！       │  ← 纯色块占位
└─────────────────────────────────────┘
```

**占位符规范（Phase 1-3 统一使用）：**

| 元素 | 占位样式 | 后期替换 |
|------|---------|---------|
| 贤者头像 | 32x32px 紫色圆 `#4B0082` + 金色边框 `#c9a227` | 像素画精灵图 |
| 诺克斯头像 | 16x16px 白色圆 `#FFFAFA` + 淡蓝边框 | 像素画精灵图 |
| 地图节点 | 16x16px 灰色方块 `#666` | 金色星星/蓝色水晶 |
| 技能树节点 | 12x12px 圆点 `#888` | 发光节点图标 |
| 背景 | 纯色 `#1a1a2e` | 场景背景图 |
| 按钮 | Tailwind 基础样式 | 像素风按钮 |
| 对话框 | 白色边框+圆角 | 羊皮卷纹理 |

---

> **2026-06-23 更新：内容扩展重排。** Phase 2（掌握度模型基础算法已实现）和 Phase 3-4（AI 总结、像素风）向后排，优先完成 10 章教学内容。见下方 Phase 3（内容扩展）。

## Phase 2: 掌握度模型（Week 3-4，已实现基础）

**目标：FSRS 算法、薄弱点检测、每日规划、时长自定义**

**美术：零新增，复用 Phase 1 占位符**

| 任务 | 内容 | 验收标准 |
|------|------|---------|
| 2.1 | 集成 FSRS 开源库（py-fsrs 或自实现） | 每次答题后更新 D/S/R |
| 2.2 | 薄弱点检测算法 | 能识别掌握度低于 0.9 的知识点 |
| 2.3 | 每日时长选择（30min/1h/2h/4h/自定义） | 用户可自由输入时长 |
| 2.4 | 每日计划生成器 | 根据时长分配薄弱巩固/主线/项目 |
| 2.5 | 诺克斯提醒系统（文字版） | 登录时显示今日计划 |
| 2.6 | 掌握度数据可视化（简单进度条） | 每个知识点显示掌握度百分比 |

**Phase 2 界面示意：**
```
┌─────────────────────────────────────┐
│  今日学习时长：[ 2 小时 ] [确认]      │
├─────────────────────────────────────┤
│  [诺克斯] 今天建议：                 │
│  • 薄弱巩固：字典（掌握度 55%）      │
│  • 主线推进：第 8 关 - 列表          │
│  • 预计用时：2 小时                 │
├─────────────────────────────────────┤
│  技能树（文字版）：                   │
│  字符串  ████████░░ 80%             │
│  列表    ██████░░░░ 60%             │
│  字典    █████░░░░░ 55%  ⚠️ 薄弱    │
└─────────────────────────────────────┘
```

---

## Phase 3（新）: 内容扩展（Week 3-6）

**目标：将教学内容从 1 章扩展为 10 章，覆盖 Python 基础到现代工程实践**

**设计原则：**
- 参考 walter201230/Python（26.5k ★）的 29 模块结构
- 5 GDD 区域 × 2 章 = 10 章，严格前置解锁
- 第 1 章（变量与类型）✅ 已有，第 2-10 章待生成
- 第 9-10 章为高阶内容，以概念题为主（choice 70% + code_fill 30%）

**技术约束：**
- pytest/logging/async → Pyodide 可运行 ✅
- ruff/uv/打包 → Rust 工具，Pyodide 不可运行，仅概念题 + 智慧之书

| 章 | 名称 | 题量 | 内容来源 |
|----|------|------|---------|
| 2 | 字符串与输入输出 | 20 题 | 字符串/转义/input/sep/end |
| 3 | 列表、元组、字典与集合 | 22 题 | 4 种数据结构的基本操作 |
| 4 | 条件判断与循环 | 22 题 | if/elif/else/for/while/break/continue |
| 5 | 函数与模块 | 20 题 | def/参数/返回值/import/包 |
| 6 | 异常处理与 pathlib | 20 题 | try/except/异常组/文件路径 |
| 7 | 面向对象 | 22 题 | 类/继承/多态/Magic Method |
| 8 | 类型注解、dataclass 与上下文管理器 | 20 题 | type hints/dataclass/with |
| 9 | pytest、logging 与 ruff 规范 | 18 题 | 测试/日志/代码风格 |
| 10 | async/await、uv 与打包发布 | 18 题 | 异步/pyproject/打包 |

**代码改造：** ChapterSelect 硬编码（chapterNames/sectionNames/世界地图）迁移为数据驱动。

---

## Phase 4（原 Phase 3）: AI 总结（Week 7-8）

**目标：LLM 配置、手动触发报告、根因诊断、诺克斯对话**

**美术：零新增，复用 Phase 1 占位符**

| 任务 | 内容 | 验收标准 |
|------|------|---------|
| 3.1 | LLM API 配置界面（用户输入 Key/URL/模型） | 支持通义千问/DeepSeek/智谱 |
| 3.2 | 手动触发 [诺克斯，帮我看看] 按钮 | 点击后生成分析报告 |
| 3.3 | 根因诊断规则库（9条基础规则） | 常见错误模式匹配 |
| 3.4 | LLM 润色为诺克斯朋友语气 | 报告用"嘿""哈哈"等口语 |
| 3.5 | 掌握度趋势图（Chart.js 简单折线） | 7 天掌握度变化 |
| 3.6 | 明日计划建议（接受/调整/忽略） | 用户可修改明日计划 |

**Phase 3 界面示意：**
```
┌─────────────────────────────────────┐
│  [诺克斯，帮我看看今天怎么样]        │
├─────────────────────────────────────┤
│  今日概览                            │
│  • 学习时长：2 小时                  │
│  • 答题：15 道                     │
│  • 正确率：80%                     │
├─────────────────────────────────────┤
│  [诺克斯] 嘿！今天不错啊，但你在字   │
│  典上栽了 3 次。dict.get() 和        │
│  dict[] 不是一回事，我当年也踩过     │
│  这个坑...                          │
├─────────────────────────────────────┤
│  [接受建议] [我再练练] [忽略]        │
└─────────────────────────────────────┘
```

---

## Phase 5（原 Phase 4）: 像素风与游戏化（Week 9-10）⭐ 美术资源上线

**目标：AI 生成像素画、角色动画、世界地图、技能树可视化**

**美术：全部 22 张像素画在此阶段生成并替换**

### 4.1 像素画生成（AI 工具）

| 优先级 | 素材 | 尺寸 | 用途 | AI 提示词（复制用） |
|--------|------|------|------|-------------------|
| P0 | 贤者-待机 | 32x32 | 主界面显示 | pixel art, female mage, brown hair, green eyes, purple robe, wooden wand with green gem, idle pose, 3-frame animation, breathing, 16-bit style, transparent background |
| P0 | 贤者-答对 | 32x32 | 答题正确反馈 | pixel art, female mage, happy expression, eyes curved, wand glowing, jumping slightly, 3-frame animation, golden particles, 16-bit style, transparent background |
| P0 | 贤者-答错 | 32x32 | 答题错误反馈 | pixel art, female mage, confused expression, eyebrow frown, shaking head, 2-frame animation, 16-bit style, transparent background |
| P0 | 诺克斯-待机 | 16x16 | 主界面显示 | pixel art, white snowy owl, golden eyes, blue glow on forehead, perched on shoulder, turning head, 3-frame animation, 16-bit style, transparent background |
| P0 | 诺克斯-说话 | 16x16 | AI 总结时 | pixel art, white snowy owl, head bobbing, blue rune glowing, 2-frame animation, 16-bit style, transparent background |
| P1 | 世界地图背景 | 1024x768 | 主界面地图 | pixel art, fantasy world map, 5 regions connected by paths, medieval style, dark blue background, 16-bit |
| P1 | 地图节点-已通关 | 16x16 | 地图交互 | pixel art, glowing golden star, 16-bit style, transparent background |
| P1 | 地图节点-未通关 | 16x16 | 地图交互 | pixel art, gray stone, 16-bit style, transparent background |
| P1 | 地图节点-当前 | 16x16 | 地图交互 | pixel art, pulsing blue crystal, 16-bit style, transparent background |
| P2 | 贤者-升级 | 32x32 | 等级提升 | pixel art, female mage, robe expanding, golden light surrounding, level up pose, 5-frame animation, 16-bit style, transparent background |
| P2 | 贤者-思考 | 32x32 | 加载/等待 | pixel art, female mage, hand on chin, thinking pose, blinking eyes, 2-frame animation, 16-bit style, transparent background |
| P2 | 诺克斯-飞行 | 24x24 | 过渡动画 | pixel art, white snowy owl, wings flapping, flying pose, 4-frame animation, 16-bit style, transparent background |
| P2 | 诺克斯-警示 | 16x16 | 错误提示 | pixel art, white snowy owl, wings spread, eyes glowing, alert pose, 2-frame animation, 16-bit style, transparent background |
| P3 | 语法圣殿背景 | 1024x768 | 答题界面 | pixel art, ancient stone temple, golden runes, mystical atmosphere, 16-bit style, dark blue background |
| P3 | 爬虫山脉背景 | 1024x768 | 答题界面 | pixel art, snowy mountain range, data streams like aurora, 16-bit style |
| P3 | 后端城背景 | 1024x768 | 答题界面 | pixel art, steampunk towers, mechanical structures, 16-bit style |
| P3 | 数据库森林背景 | 1024x768 | 答题界面 | pixel art, glowing trees, data particles like fireflies, 16-bit style |
| P3 | 前端海岸背景 | 1024x768 | 答题界面 | pixel art, seaside cliffs, code waves, 16-bit style |
| P3 | 技能树节点-已点亮 | 16x16 | 技能树 | pixel art, glowing skill node, golden, 16-bit style, transparent background |
| P3 | 技能树节点-未点亮 | 16x16 | 技能树 | pixel art, dark skill node, gray, 16-bit style, transparent background |
| P4 | 对话框-贤者 | 64x64 | 对话头像 | pixel art, female mage portrait, neutral expression, 64x64, 16-bit style |
| P4 | 对话框-诺克斯 | 64x64 | 对话头像 | pixel art, white owl portrait, golden eyes, 64x64, 16-bit style |

### 4.2 技术实现（替换占位符）

| 替换内容 | 实现方式 |
|---------|---------|
| 纯色块 → 像素精灵 | CSS `background-image` + `animation` 切换帧 |
| 文字进度条 → 技能树 | Canvas 或 SVG 绘制节点连线 |
| 纯色背景 → 场景背景 | CSS `background-image` |
| 基础按钮 → 像素按钮 | CSS 边框样式 + 点击效果 |
| 文字气泡 → 羊皮卷对话框 | CSS 边框图片 + 纹理背景 |

### 4.3 动画实现（CSS 帧动画）

```css
/* 贤者待机动画（3帧循环） */
@keyframes mage-idle {
  0% { background-position: 0 0; }
  33% { background-position: -32px 0; }
  66% { background-position: -64px 0; }
  100% { background-position: 0 0; }
}

.mage-sprite {
  width: 32px;
  height: 32px;
  background-image: url('/sprites/mage-idle.png');
  background-size: 96px 32px; /* 3帧横向排列 */
  animation: mage-idle 0.8s steps(3) infinite;
}
```

---

## Phase 6（原 Phase 5）: 项目实战（Week 11-14）

**目标：8 个项目 + 终局智慧圣殿**

**美术：复用 Phase 4 素材，少量新增项目图标**

| 任务 | 内容 |
|------|------|
| 5.1 | 项目解锁条件检查 |
| 5.2 | 项目分析题（设计题/步骤排序） |
| 5.3 | 综合评估系统 |
| 5.4 | 终局：智慧圣殿（全栈综合） |
| 5.5 | 通关动画（金色粒子+水晶） |

---

## Phase 7（原 Phase 6）: 发布（Week 15-16）

**目标：GitHub Pages 部署、README、开源**

| 任务 | 内容 |
|------|------|
| 6.1 | GitHub Actions 自动部署 |
| 6.2 | README 完善（截图、功能介绍） |
| 6.3 | MIT 开源协议 |
| 6.4 | 社区反馈收集（GitHub Issues） |

---

## 美术资源时间线总结

```
Week 1-6:  ████████░░░░░░░░░░░░  Phase 1-3，零美术，纯色块占位
Week 7-8:  ░░░░░░░░████████░░░░  Phase 4，AI生成22张像素画，批量替换
Week 9-14: ░░░░░░░░░░░░░░░░████  Phase 5-6，复用美术，少量新增
           ↑
           美术资源唯一上线窗口
```

## 关键决策

| 问题 | 决策 |
|------|------|
| 是否需要游戏引擎？ | ❌ 不需要，Vue + CSS 足够 |
| 美术什么时候上？ | Week 7-8，Phase 4 集中替换 |
| 前期用什么代替？ | 纯色块 + Tailwind 基础样式 |
| AI 生成工具？ | Midjourney/DALL-E/Stable Diffusion |
| 生成后需要修改吗？ | 需要，AI 生成后你审核调整 |

---

## 给你的建议

**现在（Week 1-2）完全不用想美术：**
- 打开 Figma/纸笔，画个草图知道界面长什么样就行
- 用 Tailwind 的 `bg-purple-900`、`text-yellow-500` 就能做出不错的暗色魔法风格
- 诺克斯用 `🦉` emoji 都行，后期再换像素画

**Week 6 结束时再开始想美术：**
- 那时核心功能都跑通了
- 你知道界面需要哪些元素
- 生成像素画有明确目标，不会浪费

**一句话：代码是骨架，美术是皮肤，先长骨头再长皮。**
