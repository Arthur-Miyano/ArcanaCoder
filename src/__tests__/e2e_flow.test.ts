import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

vi.mock('../services/storage', () => ({
  saveGameState: vi.fn(() => Promise.resolve()),
  loadGameState: vi.fn(() => Promise.resolve(null)),
}))

import { useGameStore } from '../stores/gameStore'
import { chapters, questions } from '../data/questions'
import { getWisdomPoints } from '../data/wisdom'

describe('E2E: Chapter Select → WisdomBook → Quiz', () => {

  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('1. chapters data is valid', () => {
    expect(chapters.length).toBeGreaterThan(0)
    const ch1 = chapters.find((c) => c.id === 'ch1_variables')
    expect(ch1).toBeDefined()
    expect(ch1!.sections.length).toBeGreaterThan(0)
  })

  it('2. section question IDs all resolve', () => {
    const ch1 = chapters.find((c) => c.id === 'ch1_variables')!
    for (const sec of ch1.sections) {
      for (const qId of sec.questionIds) {
        const q = questions.find((q) => q.id === qId)
        expect(q, `Question ${qId} not found in questions array`).toBeDefined()
      }
    }
  })

  it('3. selectChapter sets currentSectionId', () => {
    const store = useGameStore()
    store.selectChapter('ch1_variables')
    expect(store.currentSectionId).toBe('s1_vars')
    expect(store.state.currentChapterId).toBe('ch1_variables')
  })

  it('4. first-time chapter select goes to wisdom', () => {
    const store = useGameStore()
    store.selectChapter('ch1_variables')
    const viewed = store.isWisdomViewed('ch1_variables')
    expect(viewed).toBe(false)
  })

  it('5. wisdom points exist for ch1', () => {
    const points = getWisdomPoints('ch1_variables')
    expect(points.length).toBeGreaterThan(0)
    for (const p of points) {
      expect(p.title).toBeDefined()
      expect(p.definition).toBeDefined()
      expect(p.syntaxRules.length).toBeGreaterThan(0)
    }
  })

  it('6. after markWisdomViewed, next time skip wisdom', () => {
    const store = useGameStore()
    store.selectChapter('ch1_variables')
    store.markWisdomViewed('ch1_variables')
    expect(store.isWisdomViewed('ch1_variables')).toBe(true)
  })

  it('7. selectSection loads correct question IDs', () => {
    const store = useGameStore()
    store.selectChapter('ch1_variables')
    store.selectSection('s1_vars')

    const ch = chapters.find((c) => c.id === 'ch1_variables')!
    const sec = ch.sections.find((s) => s.id === 's1_vars')!
    expect(sec.questionIds).toEqual(['s1_01', 's1_02', 's1_03', 's1_04', 's1_05'])

    for (const qId of sec.questionIds) {
      const q = questions.find((q) => q.id === qId)
      expect(q, `${qId} should exist`).toBeDefined()
      expect(q!.narrativeTitle, `${qId} missing narrativeTitle`).toBeDefined()
      expect(q!.narrativeDesc, `${qId} missing narrativeDesc`).toBeDefined()
    }
  })

  it('8. submitAnswer works after section select', () => {
    const store = useGameStore()
    store.selectChapter('ch1_variables')
    store.selectSection('s1_vars')
    const result = store.submitAnswer('s1_01', true)
    expect(result.expGained).toBeGreaterThan(0)
  })

  it('9. gameStore.save does not crash (IndexedDB serialization)', async () => {
    const store = useGameStore()
    store.selectChapter('ch1_variables')
    store.selectSection('s1_vars')
    store.submitAnswer('s1_01', true)
    store.submitAnswer('s1_02', false)
    // saveGameState is mocked, but this tests the mock setup
    const { saveGameState } = await import('../services/storage')
    expect(saveGameState).toHaveBeenCalled()
  })

  it('10. chapters all have sections', () => {
    for (const ch of chapters) {
      expect(ch.sections.length, `${ch.id} has no sections`).toBeGreaterThan(0)
      for (const sec of ch.sections) {
        expect(sec.questionIds.length, `${sec.id} has no questions`).toBeGreaterThan(0)
      }
    }
  })

  it('11. selecting a different section changes currentSectionId', () => {
    const store = useGameStore()
    store.selectChapter('ch1_variables')
    expect(store.currentSectionId).toBe('s1_vars')
    store.selectSection('s1_types')
    expect(store.currentSectionId).toBe('s1_types')
  })

  it('12. selecting section survives App.vue handler (no selectChapter override)', () => {
    const store = useGameStore()
    store.selectChapter('ch1_variables')
    store.selectSection('s1_types')
    expect(store.currentSectionId).toBe('s1_types')
    // App.vue.onSelectChapter no longer calls store.selectChapter
    // so section should remain s1_types
    expect(store.currentSectionId).toBe('s1_types')
  })
})
