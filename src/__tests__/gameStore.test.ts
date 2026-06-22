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
})
