import { test, expect } from '@playwright/test'
import { mkdirSync, writeFileSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const RESULTS_DIR = path.resolve(__dirname, '../results')

const variants = [
  { label: '多余空格', code: 'message = "Hello, World!"\nprint(message)', expectCorrect: true },
  { label: '多余换行', code: 'message = "Hello, World!"\nprint(message)\n', expectCorrect: true },
  { label: '大小写错误', code: 'MESSAGE = "Hello, World!"\nprint(MESSAGE)', expectCorrect: false },
]

test.describe('Scenario D: code variants', () => {

  test('s1_02 code_fill 变体验证', async ({ page }) => {
    const results: { variant: string; judgedCorrect: boolean }[] = []

    async function navigateToS1Vars() {
      await page.goto('/')
      await expect(page.locator('text=今天打算修行多久')).toBeVisible({ timeout: 60000 })
      await page.locator('text=确认').click()
      await page.waitForTimeout(500)
      await page.locator('text=开始修行').click()
      await page.waitForTimeout(500)
      await page.locator('text=语法圣殿').click()
      await page.waitForTimeout(400)
      await page.locator('text=符文铭刻').click()
      await page.waitForTimeout(800)
      // 智慧之书：如果存在就翻页点开始试炼，否则已经在答题页
      const hasWisdom = await page.locator('text=目录').isVisible().catch(() => false)
      if (hasWisdom) {
        const startBtn = page.locator('button:has-text("开始试炼")')
        if (!(await startBtn.isVisible().catch(() => false))) {
          for (let i = 0; i < 10; i++) {
            if (await startBtn.isVisible().catch(() => false)) break
            const arrow = page.locator('.arrow-right')
            if (!(await arrow.isVisible().catch(() => false))) break
            if (await arrow.evaluate(el => (el as HTMLButtonElement).disabled).catch(() => true)) break
            await arrow.click()
            await page.waitForTimeout(800)
          }
        }
        await startBtn.click()
      }
      await page.waitForSelector('.cm-content, [data-testid^="choice-option-"]', { timeout: 10000 })
    }

    async function skipToQuestion(targetIndex: number) {
      // Answer questions correctly until we reach the target
      for (let i = 0; i < targetIndex; i++) {
        await expect(page.locator('[data-testid="btn-submit"]')).toBeVisible({ timeout: 15000 })
        // For choice questions (s1_01 has correctIndex=0)
        await page.locator('[data-testid="choice-option-0"]').click()
        await page.waitForTimeout(200)
        await page.locator('[data-testid="btn-submit"]').click()
        await page.waitForSelector('[data-testid="feedback-panel"]', { timeout: 20000 })
        await page.locator('[data-testid="btn-next"]').click()
        await page.waitForTimeout(500)
      }
    }

    await navigateToS1Vars()

    // s1_01 is choice, submit correctly to reach s1_02
    await skipToQuestion(1)

    // Now test s1_02 with each variant
    for (const v of variants) {
      // Reload for each variant
      await navigateToS1Vars()
      await skipToQuestion(1)

      await expect(page.locator('[data-testid="btn-submit"]')).toBeVisible({ timeout: 15000 })
      await page.locator('.cm-content').click()
      await page.keyboard.press('Control+a')
      await page.keyboard.press('Delete')
      await page.keyboard.type(v.code, { delay: 10 })

      await page.locator('[data-testid="btn-submit"]').click()
      await page.waitForSelector('[data-testid="feedback-panel"]', { timeout: 20000 })

      const success = await page.locator('text=魔力共鸣!').isVisible()
      results.push({ variant: v.label, judgedCorrect: success })
      console.log(`[${v.label}] expected=${v.expectCorrect}, judged=${success}, ${success === v.expectCorrect ? '✅' : '❌'}`)
    }

    mkdirSync(RESULTS_DIR, { recursive: true })
    writeFileSync(path.join(RESULTS_DIR, 'scenario_D.json'), JSON.stringify({ results }, null, 2))
    console.table(results)
  })
})
