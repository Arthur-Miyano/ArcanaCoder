import { test, expect } from '@playwright/test'

test('备用题触发', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('text=今天打算修行多久')).toBeVisible({ timeout: 90000 })
  await page.locator('text=确认').click()
  await page.waitForTimeout(500)
  await page.locator('text=开始修行').click()
  await page.waitForTimeout(500)

  // 展开语法圣殿
  await page.locator('text=语法圣殿').click()
  await page.waitForTimeout(500)
  // 点击符文铭刻节（用 text 匹配，第1节始终解锁）
  const secBtn = page.locator('button:has-text("符文铭刻")')
  await secBtn.waitFor({ state: 'visible', timeout: 5000 })
  await secBtn.click()
  await page.waitForTimeout(1000)

  // 智慧之书翻页到"开始试炼"
  const sb = page.locator('text=开始试炼')
  if (!(await sb.isVisible().catch(() => false))) {
    for (let i = 0; i < 15; i++) {
      if (await sb.isVisible().catch(() => false)) break
      const a = page.locator('button.arrow-right')
      if (!(await a.isVisible().catch(() => false))) break
      if (await a.isDisabled().catch(() => true)) break
      await a.click()
      await page.waitForTimeout(600)
    }
  }
  if (await sb.isVisible().catch(() => false)) {
    await sb.click()
    await page.waitForSelector('.cm-content, [data-testid^="choice-option-"]', { timeout: 10000 })
  }

  const submitBtn = page.locator('[data-testid="btn-submit"]')
  await submitBtn.waitFor({ state: 'visible', timeout: 30000 })
  await page.waitForTimeout(500)

  // s1_01 choice: 故意选错
  const title = await page.locator('h2').first().textContent().catch(() => '')
  console.log(`题目: "${title}"`)
  const opt1 = page.locator('[data-testid="choice-option-1"]')
  await opt1.waitFor({ state: 'visible', timeout: 5000 })
  await opt1.click()
  await submitBtn.click()
  await page.waitForSelector('[data-testid="feedback-panel"]', { timeout: 60000 })
  expect(await page.locator('text=魔力共鸣!').isVisible()).toBe(false)
  await page.locator('[data-testid="btn-next"]').click({ timeout: 30000 })
  await page.waitForTimeout(800)

  // 下一题应为备用题
  await submitBtn.waitFor({ state: 'visible', timeout: 30000 })
  await page.waitForTimeout(500)
  const title2 = await page.locator('h2').first().textContent().catch(() => '')
  console.log(`下一题: "${title2}"`)
  expect(title2).not.toContain('铭刻符文') // 不是 s1_02
  console.log('备用题触发 ✅')
})
