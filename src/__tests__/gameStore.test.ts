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

  it('initializes with level 1 and 0 exp', () => {
    const store = useGameStore()
    expect(store.level).toBe(1)
    expect(store.exp).toBe(0)
    expect(store.expToNext).toBe(100)
  })

  it('selectChapter sets currentSectionId to first unlocked section', () => {
    const store = useGameStore()
    store.selectChapter('ch1_variables')
    expect(store.state.currentSectionId).toBe('s1_vars')
    expect(store.state.currentSectionId).not.toBeNull()
  })

  it('second section is locked until first is completed', () => {
    const store = useGameStore()
    store.selectChapter('ch1_variables')
    expect(store.isSectionUnlocked('s1_types', 's1_vars')).toBe(false)
    store.completeSection('s1_vars')
    expect(store.isSectionUnlocked('s1_types', 's1_vars')).toBe(true)
  })

  it('selectChapter initializes section progress', () => {
    const store = useGameStore()
    store.selectChapter('ch1_variables')
    store.selectSection('s1_vars')
    const sp = store.getSectionProgress('s1_vars')
    expect(sp.completed).toBe(false)
    expect(sp.questionResults).toEqual({})
  })

  it('submitAnswer gains correct amount of exp for choice question', () => {
    const store = useGameStore()
    const result = store.submitAnswer('s1_01', true)
    expect(result.expGained).toBe(10)
    expect(store.exp).toBe(10)
  })

  it('submitAnswer gains reduced exp for wrong answer', () => {
    const store = useGameStore()
    const result = store.submitAnswer('s1_01', false)
    expect(result.expGained).toBe(3) // floor(10/3)
    expect(store.exp).toBe(3)
  })

  it('levels up when exp reaches threshold', () => {
    const store = useGameStore()
    store.submitAnswer('s1_01', true)  // +10 exp
    store.submitAnswer('s1_01', true)  // +10
    store.submitAnswer('s1_01', true)  // +10
    store.submitAnswer('s1_01', true)  // +10
    store.submitAnswer('s1_01', true)  // +10
    store.submitAnswer('s1_01', true)  // +10
    store.submitAnswer('s1_01', true)  // +10
    store.submitAnswer('s1_01', true)  // +10
    store.submitAnswer('s1_01', true)  // +10
    store.submitAnswer('s1_01', true)  // +10 (100 exp total)
    expect(store.level).toBe(2)
    expect(store.exp).toBe(0)
    expect(store.expToNext).toBe(200)
  })

  it('submitAnswer updates section progress', () => {
    const store = useGameStore()
    store.selectChapter('ch1_variables')
    store.selectSection('s1_vars')
    store.submitAnswer('s1_01', true)
    store.submitAnswer('s1_02', false)
    const sp = store.getSectionProgress('s1_vars')
    expect(sp.questionResults['s1_01']?.correct).toBe(true)
    expect(sp.questionResults['s1_02']?.correct).toBe(false)
  })

  it('section tracks consecutive wrong', () => {
    const store = useGameStore()
    store.selectChapter('ch1_variables')
    store.selectSection('s1_vars')
    store.submitAnswer('s1_01', false)
    store.submitAnswer('s1_02', false)
    const sp = store.getSectionProgress('s1_vars')
    expect(sp.consecutiveWrong).toBe(2)
  })

  it('section completion clears consecutive wrong', () => {
    const store = useGameStore()
    store.selectChapter('ch1_variables')
    store.selectSection('s1_vars')
    store.submitAnswer('s1_01', false)
    store.submitAnswer('s1_02', true)
    const sp = store.getSectionProgress('s1_vars')
    expect(sp.consecutiveWrong).toBe(0)
  })

  it('completeSection marks section as completed', () => {
    const store = useGameStore()
    store.selectChapter('ch1_variables')
    store.selectSection('s1_vars')
    store.completeSection('s1_vars')
    expect(store.getSectionProgress('s1_vars').completed).toBe(true)
  })

  it('getQuestionResult returns result after submit', () => {
    const store = useGameStore()
    store.selectChapter('ch1_variables')
    store.selectSection('s1_vars')
    store.submitAnswer('s1_01', true)
    const r = store.getQuestionResult('s1_01')
    expect(r).not.toBeNull()
    expect(r!.correct).toBe(true)
  })

  it('getQuestionResult returns null for unanswered question', () => {
    const store = useGameStore()
    const r = store.getQuestionResult('nonexistent')
    expect(r).toBeNull()
  })

  it('getChapterProgress returns correct section counts', () => {
    const store = useGameStore()
    store.selectChapter('ch1_variables')
    store.selectSection('s1_vars')
    const p = store.getChapterProgress('ch1_variables')
    expect(p.total).toBe(4) // 4 sections
    expect(p.done).toBe(0)
  })

  it('resetProgress restores initial state', () => {
    const store = useGameStore()
    store.selectChapter('ch1_variables')
    store.submitAnswer('s1_01', true)
    store.resetProgress()
    expect(store.level).toBe(1)
    expect(store.exp).toBe(0)
    expect(store.state.currentChapterId).toBeNull()
  })

  it('saveGameState receives serializable data', async () => {
    const store = useGameStore()
    store.selectChapter('ch1_variables')
    store.selectSection('s1_vars')
    store.submitAnswer('s1_01', true)
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

  it('getMastery returns 0 for unseen knowledge tag', () => {
    const store = useGameStore()
    expect(store.getMastery('nonexistent')).toBe(0)
  })

  it('getMastery increases after correct answer', () => {
    const store = useGameStore()
    store.selectChapter('ch1_variables')
    store.selectSection('s1_vars')
    store.submitAnswer('s1_01', true)
    expect(store.getMastery('print')).toBeGreaterThan(0)
  })

  it('consecutive correct 3 times gives full mastery', () => {
    const store = useGameStore()
    store.selectChapter('ch1_variables')
    store.selectSection('s1_vars')
    store.submitAnswer('s1_01', true)
    store.submitAnswer('s1_01', true)
    store.submitAnswer('s1_01', true)
    expect(store.getMastery('print')).toBe(1.0)
  })
})
