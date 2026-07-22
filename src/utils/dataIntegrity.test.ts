import { describe, it, expect } from 'vitest'
import { chapters, questions } from '../data/questions'
import { chapterWisdom } from '../data/wisdom'

describe('dataIntegrity', () => {
  it('所有 chapter 的 questionIds 都能在 questions 中找到', () => {
    for (const ch of chapters) {
      for (const sec of ch.sections) {
        for (const qId of sec.questionIds) {
          const q = questions.find(q => q.id === qId)
          expect(q, `Question ${qId} (section ${sec.id}) not found in questions array`).toBeDefined()
        }
      }
    }
  })

  it('所有 question 的 chapterId 都指向存在的 chapter', () => {
    for (const q of questions) {
      const ch = chapters.find(c => c.id === q.chapterId)
      expect(ch, `Question ${q.id} points to non-existent chapter ${q.chapterId}`).toBeDefined()
    }
  })

  it('所有 question.id 全局唯一', () => {
    const ids = questions.map(q => q.id)
    const duplicates = ids.filter((id, i) => ids.indexOf(id) !== i)
    expect(duplicates, `Duplicate question IDs: ${duplicates.join(', ')}`).toEqual([])
  })

  it('wisdom.ts 的 key 都对应存在的 chapterId', () => {
    const wisKeys = Object.keys(chapterWisdom)
    for (const key of wisKeys) {
      const ch = chapters.find(c => c.id === key)
      expect(ch, `Wisdom key "${key}" does not match any chapter ID`).toBeDefined()
    }
  })

  it('所有 chapter 在 wisdom.ts 中都有对应的条目', () => {
    const wisKeys = Object.keys(chapterWisdom)
    for (const ch of chapters) {
      expect(wisKeys, `Chapter ${ch.id} has no wisdom entries`).toContain(ch.id)
    }
  })

  it('section 的 unlockAfter 都指向存在的 section', () => {
    const allSectionIds = new Set<string>()
    for (const ch of chapters) {
      for (const sec of ch.sections) {
        allSectionIds.add(sec.id)
      }
    }
    for (const ch of chapters) {
      for (const sec of ch.sections) {
        if (sec.unlockAfter) {
          expect(allSectionIds, `Section ${sec.id} unlockAfter=${sec.unlockAfter} targets non-existent section`).toContain(sec.unlockAfter)
        }
      }
    }
  })

  it('每个章节的题量正确', () => {
    const expected: Record<string, number> = {
      ch1_variables: 28,
      ch2_strings: 20,
      ch3_lists: 24,
      ch4_control: 22,
      ch5_functions: 20,
      ch6_errors: 20,
      ch7_oop: 22,
      ch8_annotations: 20,
      ch9_testing: 18,
      ch10_async: 18,
    }
    for (const ch of chapters) {
      const count = ch.sections.reduce((sum, s) => sum + s.questionIds.length, 0)
      expect(count, `Chapter ${ch.id} has ${count} questions, expected ${expected[ch.id] || '?'}`).toBe(expected[ch.id])
    }
  })
})
