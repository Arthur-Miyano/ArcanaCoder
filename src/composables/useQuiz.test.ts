import { describe, it, expect } from 'vitest'
import type { Question } from '@/types'
import { isChoiceType } from './useQuiz'

function makeQ(type: Question['type']): Question {
  return {
    id: 'test', type, chapterId: 'ch1_variables',
    title: 't', description: 'd', difficulty: 1,
    knowledgeTags: ['test'], explanation: 'e',
  }
}

describe('isChoiceType', () => {
  it('choice → true', () => expect(isChoiceType(makeQ('choice'))).toBe(true))
  it('output_predict → true', () => expect(isChoiceType(makeQ('output_predict'))).toBe(true))
  it('code_fill → false', () => expect(isChoiceType(makeQ('code_fill'))).toBe(false))
  it('code_fix → false', () => expect(isChoiceType(makeQ('code_fix'))).toBe(false))
  it('free_coding → false', () => expect(isChoiceType(makeQ('free_coding'))).toBe(false))
})
