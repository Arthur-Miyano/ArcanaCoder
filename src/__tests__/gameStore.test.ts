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

  it('selectChapter initializes progress', () => {
    const store = useGameStore()
    store.selectChapter('ch1_variables')
    const progress = store.getChapterProgress('ch1_variables')
    expect(progress.completed).toBe(false)
    expect(progress.questionResults).toEqual({})
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

  it('chapter not completed when only some questions correct', () => {
    const store = useGameStore()
    store.selectChapter('ch1_variables')
    // Answer some questions correctly but not all
    store.submitAnswer('s1_01', true)
    store.submitAnswer('s1_02', false)
    const progress = store.getChapterProgress('ch1_variables')
    expect(progress.completed).toBe(false)
  })

  it('gameStore tracks accuracy', () => {
    const store = useGameStore()
    store.selectChapter('ch1_variables')
    store.submitAnswer('s1_01', true)
    store.submitAnswer('s1_02', false)
    const accuracy = store.getChapterAccuracy('ch1_variables')
    expect(accuracy.total).toBe(28) // stage 1 has 28 questions
    expect(accuracy.correct).toBe(1)
    expect(accuracy.wrongIds.length).toBeGreaterThan(0)
  })

  it('submitAnswer updates question result', () => {
    const store = useGameStore()
    store.selectChapter('ch1_variables')
    store.submitAnswer('s1_01', true)
    const result = store.getQuestionResult('ch1_variables', 's1_01')
    expect(result).not.toBeNull()
    expect(result!.correct).toBe(true)
    expect(result!.attempts).toBe(1)
  })
})
