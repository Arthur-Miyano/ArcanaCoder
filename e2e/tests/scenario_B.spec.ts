import { test, expect } from '@playwright/test'
import { mkdirSync, writeFileSync, readFileSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const RESULTS_DIR = path.resolve(__dirname, '../results')
const FIXTURES_DIR = path.resolve(__dirname, '../fixtures')

test.describe('Scenario B: all wrong answers', () => {

  test('s1_vars 全部答错验证备用题', async ({ page }) => {
    const fixture: any[] = JSON.parse(readFileSync(path.join(FIXTURES_DIR, 's1_vars.json'), 'utf-8'))
    const results: { id: string; backupTriggered: boolean }[] = []

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

    // 智慧之书
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
    await page.waitForSelector('.cm-content, [data-testid^="choice-option-"]', { timeout: 10000 })

    for (const [idx, q] of fixture.entries()) {
      await expect(page.locator('[data-testid="btn-submit"]')).toBeVisible({ timeout: 15000 })
      await page.waitForTimeout(300)

      if (q.type === 'choice' || q.type === 'output_predict') {
        const wrongIdx = ((q.correctIndex ?? 0) + 1) % 4
        const opt = page.locator(`[data-testid="choice-option-${wrongIdx}"]`)
        if ((await opt.count()) > 0) await opt.click()
      } else {
        await page.locator('.cm-content').click()
        await page.keyboard.press('Control+a')
        await page.keyboard.press('Delete')
        await page.keyboard.type('print("wrong")', { delay: 10 })
      }

      // 提交前记录当前总题数
      const totalBefore = await page.evaluate(() => {
        const m = document.body.innerText.match(/\/(\d+)\s*题/)
        return m ? parseInt(m[1]) : -1
      })

      await page.locator('[data-testid="btn-submit"]').click()
      await page.waitForSelector('[data-testid="feedback-panel"]', { timeout: 20000 })
      const success = await page.locator('text=魔力共鸣!').isVisible()

      // 提交后记录总题数变化
      const totalAfter = await page.evaluate(() => {
        const m = document.body.innerText.match(/\/(\d+)\s*题/)
        return m ? parseInt(m[1]) : -1
      })

      const backupInserted = totalAfter > totalBefore
      results.push({ id: q.id, backupTriggered: backupInserted })
      console.log(`${q.id}: wrong=${!success}, total ${totalBefore}→${totalAfter}, backup=${backupInserted}`)

      await page.locator('[data-testid="btn-next"]').click({ timeout: 10000 }).catch(() => {})
      await page.waitForTimeout(500)
    }

    mkdirSync(RESULTS_DIR, { recursive: true })
    writeFileSync(path.join(RESULTS_DIR, 'scenario_B.json'), JSON.stringify({ results }, null, 2))
    console.table(results)
  })
})
