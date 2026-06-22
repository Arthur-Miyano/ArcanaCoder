export type QuestionType =
  | 'choice'
  | 'code_fill'
  | 'code_fix'
  | 'output_predict'
  | 'free_coding'

export type ViewState = 'loading' | 'chapterSelect' | 'wisdom' | 'quiz' | 'chapterComplete'

export interface TestCase {
  input: string
  expected: string
}

export interface Question {
  id: string
  type: QuestionType
  chapterId: string
  title: string
  description: string
  difficulty: 1 | 2 | 3
  knowledgeTags: string[]

  narrativeTitle?: string
  narrativeDesc?: string
  narrativeExplanation?: string

  options?: string[]
  correctOption?: number

  initialCode?: string
  correctCode?: string

  expectedOutput?: string
  testCases?: TestCase[]

  explanation: string
  hint?: string
  hintRoleplay?: string
  hintDirect?: string
}

export interface WisdomPoint {
  title: string
  definition: string
  syntaxRules: string[]
  code: string
  expectedOutput: string
  designPhilosophy?: string
  commonErrors?: { code: string; error: string; explanation: string }[]
  interactiveCode?: string
  interactiveExpected?: string
  tip: string
}

export interface Chapter {
  id: string
  name: string
  description: string
  questionIds: string[]
}

export interface AnswerRecord {
  questionId: string
  correct: boolean
  answer: string
  score: number
  timestamp: number
  attemptCount: number
}

export interface ChapterProgress {
  completed: boolean
  questionResults: Record<string, {
    correct: boolean
    score: number
    attempts: number
  }>
}
