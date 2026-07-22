import { test, expect } from '@playwright/test'
import { readFileSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

interface Variant { label: string; code: string; expectPass: boolean }

// 每个目标题：变体集（覆盖空格、等价实现、空答案、错误答案）
const SCENARIOS: Record<string, Variant[]> = {
  's1_02': [
    { label: '正确答案', code: 'message = "Hello, World!"\nprint(message)', expectPass: true },
    { label: '不同变量名', code: 'msg = "Hello, World!"\nprint(msg)', expectPass: true },
    { label: '单引号', code: "message = 'Hello, World!'\nprint(message)", expectPass: true },
    { label: '括号内空格', code: 'message = "Hello, World!"\nprint( message )', expectPass: true },
    { label: '空答案', code: '', expectPass: false },
    { label: '语法错误', code: 'message = "Hello World!" print(message)', expectPass: false },
  ],
  's2_03': [
    { label: '正确答案', code: 's = "Hello"\nprint(s[1:3])', expectPass: true },
    { label: '硬编码', code: 'print("el")', expectPass: true },
    { label: '括号内空格', code: 's = "Hello"\nprint( s[1:3] )', expectPass: true },
      { label: '空答案', code: '', expectPass: false },
  ],
  's2_09': [
    { label: '正确答案', code: 'words = ["Hello", "World"]\nprint(" ".join(words))', expectPass: true },
    { label: 'f-string同效果', code: 'words = ["Hello", "World"]\nprint(f"{words[0]} {words[1]}")', expectPass: true },
    { label: '手动拼接', code: 'words = ["Hello", "World"]\nprint(words[0] + " " + words[1])', expectPass: true },
    { label: '空答案', code: '', expectPass: false },
  ],
}

test.describe('判题变体验证', () => {
  for (const [qId, variants] of Object.entries(SCENARIOS)) {
    for (const [vi, variant] of variants.entries()) {
      test(`${qId} #${vi + 1}: ${variant.label}`, async ({ page }) => {
        // 导航到目标题
        await page.goto('/')
        await expect(page.locator('text=今天打算修行多久')).toBeVisible({ timeout: 90000 })
        await page.locator('text=确认').click()
        await page.waitForTimeout(300)
        await page.locator('text=开始修行').click()
        await page.waitForTimeout(300)

        // 注入全解锁状态
        await page.evaluate(() => {
          const r = indexedDB.open('ArcanaCoder', 1)
          r.onsuccess = () => {
            const tx = r.result.transaction('gameState', 'readwrite')
            tx.objectStore('gameState').put({
              id: 'main', state: {
                version: 1, level: 1, exp: 0, expToNext: 100,
                unlockedChapters: ['ch1_variables', 'ch2_strings'],
                wisdomViewed: ['ch1_variables', 'ch2_strings'],
                currentChapterId: null, currentSectionId: null,
                sectionProgress: {
                  s1_vars: { completed: true, questionResults: {}, consecutiveWrong: 0, fatigueQuestionCount: 0 },
                  s1_types: { completed: true, questionResults: {}, consecutiveWrong: 0, fatigueQuestionCount: 0 },
                  s1_ops: { completed: true, questionResults: {}, consecutiveWrong: 0, fatigueQuestionCount: 0 },
                  s1_strings: { completed: true, questionResults: {}, consecutiveWrong: 0, fatigueQuestionCount: 0 },
                  s2_advanced: { completed: true, questionResults: {}, consecutiveWrong: 0, fatigueQuestionCount: 0 },
                  s2_methods: { completed: true, questionResults: {}, consecutiveWrong: 0, fatigueQuestionCount: 0 },
                  s2_format: { completed: true, questionResults: {}, consecutiveWrong: 0, fatigueQuestionCount: 0 },
                },
                knowledgeStates: {}, lastPlayedAt: Date.now(),
                totalQuestionsAnswered: 0, totalCorrect: 0,
                accumulatedLearningMs: 0, lastLearningEntryTime: null,
              }, updatedAt: Date.now(),
            }, 'main')
          }
        })
        await page.waitForTimeout(300)
        await page.reload()
        await page.waitForTimeout(4000)

        // 关每日计划
        if (await page.locator('text=今天打算修行多久').isVisible().catch(() => false)) {
          await page.locator('text=确认').click()
          await page.waitForTimeout(300)
          await page.locator('text=开始修行').click()
          await page.waitForTimeout(300)
        }

        // 确定章节和节
        const chMap: Record<string, [string, string]> = {
          's1_02': ['语法圣殿', '符文铭刻'],
          's1_11': ['语法圣殿', '术式推演'],
          's2_03': ['爬虫山脉', '字符串进阶'],
          's2_09': ['爬虫山脉', '字符串方法'],
        }
        const [chBtn, secBtn] = chMap[qId]

        await page.locator(`text=${chBtn}`).click()
        await page.waitForTimeout(400)
        await page.locator(`button:has-text("${secBtn}")`).click()
        await page.waitForTimeout(800)

        // 智慧之书
        const startBtn = page.locator('text=开始试炼')
        if (await startBtn.isVisible().catch(() => false)) {
          await startBtn.click()
          await page.waitForSelector('.cm-content, [data-testid^="choice-option-"]', { timeout: 10000 })
        }

        // 跳转到目标题
        const sec = qId.startsWith('s1_') ? 's1_vars' : qId === 's2_03' ? 's2_advanced' : 's2_methods'
        const fix = JSON.parse(readFileSync(path.resolve(__dirname, `../fixtures/${sec}.json`), 'utf-8'))
        const tgtIdx = fix.findIndex((f: any) => f.id === qId)
        for (let i = 0; i < tgtIdx; i++) {
          const q = fix[i]
          await expect(page.locator('[data-testid="btn-submit"]')).toBeVisible({ timeout: 15000 })
          await page.waitForTimeout(300)
          if (q.type === 'choice' || q.type === 'output_predict') {
            await page.locator(`[data-testid="choice-option-${q.correctIndex}"]`).click()
          } else if ((q.type === 'code_fill' || q.type === 'code_fix') && q.correctCode) {
            await page.locator('.cm-content').first().click()
            await page.keyboard.press('Control+a')
            await page.keyboard.press('Delete')
            await page.keyboard.type(q.correctCode, { delay: 5 })
          }
          await page.locator('[data-testid="btn-submit"]').click()
          await page.waitForSelector('[data-testid="feedback-panel"]', { timeout: 60000 }).catch(() => {})
          await page.locator('[data-testid="btn-next"]').click({ timeout: 30000 })
          await page.waitForTimeout(500)
        }

        // 提交变体
        await expect(page.locator('[data-testid="btn-submit"]')).toBeVisible({ timeout: 15000 })
        await page.waitForTimeout(500)

        await page.locator('.cm-content').first().click()
        await page.keyboard.press('Control+a')
        await page.keyboard.press('Delete')
        if (variant.code) await page.keyboard.type(variant.code, { delay: 3 })

        const btn = page.locator('[data-testid="btn-submit"]')
        const btnDisabled = await btn.isDisabled()
        if (btnDisabled) {
          // 按钮禁用（空答案/未输入）→ 无法提交，判为不 correct
          expect(variant.expectPass).toBe(false)
          return
        }

        await btn.click()
        await page.waitForSelector('[data-testid="feedback-panel"]', { timeout: 60000 })
        const actual = await page.locator('text=魔力共鸣!').isVisible()

        expect(actual).toBe(variant.expectPass)
      })
    }
  }
})
