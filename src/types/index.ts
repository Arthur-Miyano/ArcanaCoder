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

export interface CommonErrorConfig {
  pattern: string
  message: string
  noxHint: string
}

export interface Question {
  id: string
  type: QuestionType
  chapterId: string
  title: string
  description: string
  difficulty: 1 | 2 | 3 | 4 | 5
  knowledgeTags: string[]

  stage?: string
  technicalDesc?: string
  narrativeTitle?: string
  narrativeDesc?: string
  narrativeExplanation?: string

  options?: string[]
  correctOption?: number

  initialCode?: string
  correctCode?: string

  expectedOutput?: string
  validationMode?: 'exact' | 'contains' | 'regex' | 'testcase'
  testCases?: TestCase[]

  commonErrors?: CommonErrorConfig[]

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

export interface ChapterSection {
  id: string
  name: string
  displayName: string
  questionIds: string[]
  unlockAfter?: string
}

export interface Chapter {
  id: string
  name: string
  displayName: string
  description: string
  sections: ChapterSection[]
  regionName: string          // 所属区域（如"语法圣殿"）
  regionOrder: number         // 区域在地图上的顺序
}

export interface SectionProgress {
  completed: boolean
  questionResults: Record<string, {
    correct: boolean
    score: number
    attempts: number
  }>
  consecutiveWrong: number
  fatigueQuestionCount: number
}

export interface KnowledgeState {
  knowledgeTag: string
  totalAttempts: number
  correctAttempts: number
  consecutiveCorrect: number
  lastSeen: number
}
