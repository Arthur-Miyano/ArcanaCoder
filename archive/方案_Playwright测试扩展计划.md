# Playwright 测试扩展计划 v3

> 状态：**待确认** | 正文已全部纳入用户审核意见

---

## 一、目标

对 s1_vars（符文铭刻）5 道题，每道用正确答案提交，记录通过/失败，输出 `e2e/results/s1_vars_result.json`。

不包含：备用题、节完成、重试模式。

---

## 二、已验证事实

| 事项 | 结论 | 证据位置 |
|------|------|---------|
| CodeMirror 版本 | 6 | package.json `@codemirror/*` |
| CM6 EditorView 是否暴露 | ❌ 未暴露 | `vue-codemirror` 内部创建 |
| 正确反馈文本 | `魔力共鸣!`（精确匹配） | FeedbackPanel.vue:51 |
| 错误反馈文本 | 无固定文本，显示 diff/详情 | FeedbackPanel.vue:84 |
| 展开章节 | `text=语法圣殿` | ChapterSelect.vue:120 |
| 选择节 | `text=符文铭刻` | ChapterSelect.vue:165 |
| 智慧之书翻页 | `.arrow-right` | WisdomBook.vue |
| 开始试炼按钮 | `button:has-text("开始试炼")` | WisdomBook.vue `v-if="isLast"` |
| 智慧之书"目录"文本 | 🔍 **未验证**，见下方风险处理 | WisdomBook.vue |
| P0-3 IntroOverlay | ❌ 不存在 | `src/components/` 无此文件 |
| Pyodide 本地加载 | ✅ 3s | 已通过测试验证 |

---

## 三、风险处理

### 风险 1：`text=目录` 未验证

`WisdomBook.vue` 中包含文本"目录"——但未经测试验证执行。不依赖此选择器。改用方案 B：

```typescript
// 不判断"目录"是否存在，直接尝试翻页或点击开始试炼
const startBtn = page.locator('button:has-text("开始试炼")')
if (await startBtn.isVisible().catch(() => false)) {
  await startBtn.click()
  // 等答题界面加载
  await page.waitForSelector('.cm-content, [data-testid^="choice-option-"]', { timeout: 10000 })
} else {
  for (let i = 0; i < 10; i++) {
    const arrow = page.locator('.arrow-right')
    if (!(await arrow.isVisible().catch(() => false))) break
    const isDisabled = await arrow.evaluate(el => (el as HTMLButtonElement).disabled).catch(() => true)
    if (isDisabled) break
    await arrow.click()
    await page.waitForTimeout(500)
  }
  // 翻页后再点开始试炼
  await page.locator('button:has-text("开始试炼")').click()
  await page.waitForSelector('.cm-content, [data-testid^="choice-option-"]', { timeout: 10000 })
}
```

### 风险 2：`keyboard.type` 换行缩进（阻塞项）

需要单独验证 s1_02 一题，确认 CM6 的自动缩进不会导致 `IndentationError`。

**验证代码：**
```typescript
test('验证 CM6 换行输入', async ({ page }) => {
  // 清理 + 加载
  await page.evaluate(() => new Promise<void>(resolve => {
    const req = indexedDB.deleteDatabase('ArcanaCoder')
    req.onsuccess = () => resolve()
    req.onerror = () => resolve()
    req.onblocked = () => resolve()
  }))
  await page.goto('/')
  await expect(page.locator('text=今天打算修行多久')).toBeVisible({ timeout: 60000 })
  await page.locator('text=确认').click()
  await page.waitForTimeout(500)
  await page.locator('text=开始修行').click()
  await page.waitForTimeout(500)
  await page.locator('text=语法圣殿').click()
  await page.waitForTimeout(400)
  await page.locator('text=符文铭刻').click()
  await page.waitForTimeout(500)

  // 翻页到最后一页
  const startBtn = page.locator('button:has-text("开始试炼")')
  if (!(await startBtn.isVisible().catch(() => false))) {
    for (let i = 0; i < 10; i++) {
      if (await startBtn.isVisible().catch(() => false)) break
      const arrow = page.locator('.arrow-right')
      if (!(await arrow.isVisible().catch(() => false))) break
      const disabled = await arrow.evaluate(el => (el as HTMLButtonElement).disabled).catch(() => true)
      if (disabled) break
      await arrow.click()
      await page.waitForTimeout(500)
    }
  }
  await startBtn.click()
  await page.waitForSelector('.cm-content, [data-testid^="choice-option-"]', { timeout: 10000 })

  // s1_01 是 choice，提交跳到 s1_02
  await expect(page.locator('[data-testid="btn-submit"]')).toBeVisible({ timeout: 10000 })
  const choice0 = page.locator('[data-testid="choice-option-0"]')
  if (await choice0.isVisible().catch(() => false)) {
    await choice0.click()
    await page.waitForTimeout(200)
  }
  await page.locator('[data-testid="btn-submit"]').click()
  await page.waitForSelector('[data-testid="feedback-panel"]', { timeout: 20000 })
  await page.locator('[data-testid="btn-next"]').click()
  await page.waitForTimeout(500)

  // s1_02 code_fill — 测试 keyboard.type
  await expect(page.locator('[data-testid="btn-submit"]')).toBeVisible({ timeout: 10000 })
  await page.locator('.cm-content').click()
  await page.keyboard.press('Control+a')
  await page.keyboard.press('Delete')
  await page.keyboard.type('message = "Hello, World!"\nprint(message)', { delay: 10 })
  await page.locator('[data-testid="btn-submit"]').click()
  await page.waitForSelector('[data-testid="feedback-panel"]', { timeout: 15000 })
  const feedback = await page.locator('[data-testid="feedback-panel"]').innerText()
  console.log('s1_02 feedback:', feedback)
  expect(feedback).toContain('魔力共鸣!')
})
```

---

## 四、方案细节

### 4.1 数据

`e2e/fixtures/s1_vars.json`（import 零配置）：

```json
[
  { "id": "s1_01", "type": "choice", "correctIndex": 0 },
  { "id": "s1_02", "type": "code_fill", "correctCode": "message = \"Hello, World!\"\nprint(message)" },
  { "id": "s1_03", "type": "output_predict", "correctIndex": 1 },
  { "id": "s1_04", "type": "choice", "correctIndex": 2 },
  { "id": "s1_05", "type": "code_fill", "correctCode": "a = \"Hello\"\nb = \"World!\"\nprint(a + \" \" + b)" }
]
```

### 4.2 前置清理

```typescript
test.beforeEach(async ({ page }) => {
  // 先清理 IndexedDB，再加载页面，避免竞态
  await page.evaluate(() => {
    return new Promise<void>((resolve) => {
      const req = indexedDB.deleteDatabase('ArcanaCoder')
      req.onsuccess = () => resolve()
      req.onerror = () => resolve()    // 数据库不存在时也会触发
      req.onblocked = () => resolve()  // 页面已有连接时的保护
    })
  })
  await page.goto('/')
})
```

### 4.3 每日计划弹窗按钮定位

`text=确认` 和 `text=开始修行` 可能不唯一（页面上其他元素可能包含相同文本）。用 `getByRole` 限定：

```typescript
await page.getByRole('dialog').getByRole('button', { name: '确认' }).click()
await page.waitForTimeout(500)
await page.getByRole('dialog').getByRole('button', { name: '开始修行' }).click()
```

如果弹窗只有一步（点"确认"直接关闭），则第二次点击会报 `TimeoutError`，此时改为只点一次。

### 4.4 CodeMirror 输入

先用风险 2 的验证代码跑一次 s1_02。如果无 `IndentationError`，方案可用。如果报错，改用逐行输入 + 手动消除缩进。

### 4.5 反馈判断

```typescript
await page.click('[data-testid="btn-submit"]')
await page.waitForSelector('[data-testid="feedback-panel"]', { timeout: 15000 })
const success = await page.locator('text=魔力共鸣!').isVisible()
```

### 4.6 结果输出

写入 `e2e/results/s1_vars_result.json`，控制台 `console.table` 打印摘要。目录不存在时自动创建：

```typescript
import { mkdirSync, writeFileSync } from 'fs'
mkdirSync('e2e/results', { recursive: true })
writeFileSync('e2e/results/s1_vars_result.json', JSON.stringify(results, null, 2))
```

---

## 五、执行顺序

```
1. 确认方案
2. 运行风险 2 的验证代码（仅 s1_02 一题），确认 keyboard.type 无缩进问题
3. 如果通过 → 扩展为完整 5 题测试
4. 如果失败 → 修改输入方案，再跑一次验证
5. headless: false 先跑通，全部通过后切 headless: true
```

---

## 六、待确认

- [ ] 方案整体是否通过
- [ ] 风险 2 验证是否现在执行
- [ ] 运行模式：先 `headless: false` 再切 `true`
