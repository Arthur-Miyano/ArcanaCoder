import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

vi.mock('../services/storage', () => ({
  saveGameState: vi.fn(() => Promise.resolve()),
  loadGameState: vi.fn(() => Promise.resolve(null)),
}))

import { useGameStore } from '../stores/gameStore'

describe('gameStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('initializes with level 1 and 0 exp', async () => {
    const store = useGameStore()
    expect(store.level).toBe(1)
    expect(store.exp).toBe(0)
    expect(store.expToNext).toBe(100)
  })

  it('selectChapter sets currentSectionId to first unlocked section', async () => {
    const store = useGameStore()
    store.selectChapter('ch1_variables')
    expect(store.currentSectionId).toBe('s1_vars')
    expect(store.currentSectionId).not.toBeNull()
  })

  it('second section is locked until first is completed', async () => {
    const store = useGameStore()
    store.selectChapter('ch1_variables')
    expect(store.isSectionUnlocked('s1_types', 's1_vars')).toBe(false)
    await store.completeSection('s1_vars')
    expect(store.isSectionUnlocked('s1_types', 's1_vars')).toBe(true)
  })

  it('selectChapter initializes section progress', async () => {
    const store = useGameStore()
    store.selectChapter('ch1_variables')
    store.selectSection('s1_vars')
    const sp = store.getSectionProgress('s1_vars')
    expect(sp.completed).toBe(false)
    expect(sp.questionResults).toEqual({})
  })

  it('submitAnswer gains correct amount of exp for choice question', async () => {
    const store = useGameStore()
    const result = await store.submitAnswer('s1_01', true)
    expect(result.expGained).toBe(10)
    expect(store.exp).toBe(10)
  })

  it('submitAnswer gains reduced exp for wrong answer', async () => {
    const store = useGameStore()
    const result = await store.submitAnswer('s1_01', false)
    expect(result.expGained).toBe(3) // floor(10/3)
    expect(store.exp).toBe(3)
  })

  it('levels up when exp reaches threshold', async () => {
    const store = useGameStore()
    await store.submitAnswer('s1_01', true)  // +10 exp
    await store.submitAnswer('s1_01', true)  // +10
    await store.submitAnswer('s1_01', true)  // +10
    await store.submitAnswer('s1_01', true)  // +10
    await store.submitAnswer('s1_01', true)  // +10
    await store.submitAnswer('s1_01', true)  // +10
    await store.submitAnswer('s1_01', true)  // +10
    await store.submitAnswer('s1_01', true)  // +10
    await store.submitAnswer('s1_01', true)  // +10
    await store.submitAnswer('s1_01', true)  // +10 (100 exp total)
    expect(store.level).toBe(2)
    expect(store.exp).toBe(0)
    expect(store.expToNext).toBe(200)
  })

  it('submitAnswer updates section progress', async () => {
    const store = useGameStore()
    store.selectChapter('ch1_variables')
    store.selectSection('s1_vars')
    await store.submitAnswer('s1_01', true)
    await store.submitAnswer('s1_02', false)
    const sp = store.getSectionProgress('s1_vars')
    expect(sp.questionResults['s1_01']?.correct).toBe(true)
    expect(sp.questionResults['s1_02']?.correct).toBe(false)
  })

  it('section tracks consecutive wrong', async () => {
    const store = useGameStore()
    store.selectChapter('ch1_variables')
    store.selectSection('s1_vars')
    await store.submitAnswer('s1_01', false)
    await store.submitAnswer('s1_02', false)
    const sp = store.getSectionProgress('s1_vars')
    expect(sp.consecutiveWrong).toBe(2)
  })

  it('section completion clears consecutive wrong', async () => {
    const store = useGameStore()
    store.selectChapter('ch1_variables')
    store.selectSection('s1_vars')
    await store.submitAnswer('s1_01', false)
    await store.submitAnswer('s1_02', true)
    const sp = store.getSectionProgress('s1_vars')
    expect(sp.consecutiveWrong).toBe(0)
  })

  it('completeSection marks section as completed', async () => {
    const store = useGameStore()
    store.selectChapter('ch1_variables')
    store.selectSection('s1_vars')
    await store.completeSection('s1_vars')
    expect(store.getSectionProgress('s1_vars').completed).toBe(true)
  })

  it('getQuestionResult returns result after submit', async () => {
    const store = useGameStore()
    store.selectChapter('ch1_variables')
    store.selectSection('s1_vars')
    await store.submitAnswer('s1_01', true)
    const r = store.getQuestionResult('s1_01')
    expect(r).not.toBeNull()
    expect(r!.correct).toBe(true)
  })

  it('getQuestionResult returns null for unanswered question', async () => {
    const store = useGameStore()
    const r = store.getQuestionResult('nonexistent')
    expect(r).toBeNull()
  })

  it('getChapterProgress returns correct section counts', async () => {
    const store = useGameStore()
    store.selectChapter('ch1_variables')
    store.selectSection('s1_vars')
    const p = store.getChapterProgress('ch1_variables')
    expect(p.total).toBe(4) // 4 sections
    expect(p.done).toBe(0)
  })

  it('resetProgress restores initial state', async () => {
    const store = useGameStore()
    store.selectChapter('ch1_variables')
    await store.submitAnswer('s1_01', true)
    await store.resetProgress()
    expect(store.level).toBe(1)
    expect(store.exp).toBe(0)
    expect(store.currentSectionId).toBeNull()
  })

  it('saveGameState receives serializable data', async () => {
    const store = useGameStore()
    store.selectChapter('ch1_variables')
    store.selectSection('s1_vars')
    await store.submitAnswer('s1_01', true)
    const { saveGameState } = await import('../services/storage')
    const mockFn = saveGameState as ReturnType<typeof vi.fn>
    const calls = mockFn.mock?.calls
    if (calls && calls.length > 0) {
      const state = calls[0][0]
      expect(() => JSON.parse(JSON.stringify(state))).not.toThrow()
    } else {
      throw new Error('saveGameState was not called')
    }
  })

  it('getMastery returns 0 for unseen knowledge tag', async () => {
    const store = useGameStore()
    expect(store.getMastery('nonexistent')).toBe(0)
  })

  it('getMastery increases after correct answer', async () => {
    const store = useGameStore()
    store.selectChapter('ch1_variables')
    store.selectSection('s1_vars')
    await store.submitAnswer('s1_01', true)
    expect(store.getMastery('print')).toBeGreaterThan(0)
  })

  it('consecutive correct 3 times gives full mastery', async () => {
    const store = useGameStore()
    store.selectChapter('ch1_variables')
    store.selectSection('s1_vars')
    await store.submitAnswer('s1_01', true)
    await store.submitAnswer('s1_01', true)
    await store.submitAnswer('s1_01', true)
    expect(store.getMastery('print')).toBe(1.0)
  })
})
