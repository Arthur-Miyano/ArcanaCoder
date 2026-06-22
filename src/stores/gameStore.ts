import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { QuestionType, ChapterProgress } from '@/types'
import { saveGameState, loadGameState } from '@/services/storage'
import { questions } from '@/data/questions'

const EXP_TABLE: Record<QuestionType, number> = {
  choice: 10,
  output_predict: 15,
  code_fill: 20,
  code_fix: 20,
  free_coding: 30,
}

export interface GameState {
  level: number
  exp: number
  expToNext: number
  unlockedChapters: string[]
  wisdomViewed: string[]
  currentChapterId: string | null
  chapterProgress: Record<string, ChapterProgress>
  lastPlayedAt: number | null
  totalQuestionsAnswered: number
  totalCorrect: number
}

function calcExpToNext(level: number): number {
  return 100 * level
}

function createInitialState(): GameState {
  return {
    level: 1,
    exp: 0,
    expToNext: calcExpToNext(1),
    unlockedChapters: ['ch1_variables'],
    wisdomViewed: [],
    currentChapterId: null,
    chapterProgress: {},
    lastPlayedAt: null,
    totalQuestionsAnswered: 0,
    totalCorrect: 0,
  }
}

export const useGameStore = defineStore('game', () => {
  const state = ref<GameState>(createInitialState())

  const level = computed(() => state.value.level)
  const exp = computed(() => state.value.exp)
  const expToNext = computed(() => state.value.expToNext)
  const expPercent = computed(() =>
    Math.min(100, Math.floor((state.value.exp / state.value.expToNext) * 100)),
  )
  const wisdomViewed = computed(() => state.value.wisdomViewed)
  const currentChapterId = computed(() => state.value.currentChapterId)
  const chapterProgress = computed(() => state.value.chapterProgress)
  const totalQuestionsAnswered = computed(() => state.value.totalQuestionsAnswered)
  const totalCorrect = computed(() => state.value.totalCorrect)

  function isWisdomViewed(chapterId: string): boolean {
    return state.value.wisdomViewed.includes(chapterId)
  }

  function markWisdomViewed(chapterId: string) {
    if (!state.value.wisdomViewed.includes(chapterId)) {
      state.value.wisdomViewed.push(chapterId)
    }
    save()
  }

  function selectChapter(chapterId: string) {
    state.value.currentChapterId = chapterId
    if (!state.value.chapterProgress[chapterId]) {
      state.value.chapterProgress[chapterId] = {
        completed: false,
        questionResults: {},
      }
    }
  }

  function submitAnswer(
    questionId: string,
    correct: boolean,
  ): { leveledUp: boolean; expGained: number } {
    const question = questions.find((q) => q.id === questionId)
    if (!question) return { leveledUp: false, expGained: 0 }

    const baseExp = EXP_TABLE[question.type] || 10
    const expGained = correct ? baseExp : Math.max(1, Math.floor(baseExp / 3))

    const cp = state.value.chapterProgress[question.chapterId] || {
      completed: false,
      questionResults: {},
    }
    const prev = cp.questionResults[questionId]
    cp.questionResults[questionId] = {
      correct: prev ? prev.correct || correct : correct,
      score: Math.max(prev?.score ?? 0, correct ? 100 : Math.floor(100 / 3)),
      attempts: (prev?.attempts ?? 0) + 1,
    }
    state.value.chapterProgress[question.chapterId] = cp

    state.value.exp += expGained
    state.value.totalQuestionsAnswered += 1
    if (correct) state.value.totalCorrect += 1
    state.value.lastPlayedAt = Date.now()

    let leveledUp = false
    while (state.value.exp >= state.value.expToNext) {
      state.value.exp -= state.value.expToNext
      state.value.level += 1
      state.value.expToNext = calcExpToNext(state.value.level)
      leveledUp = true
    }

    const chapterQuestions = questions.filter(
      (q) => q.chapterId === question.chapterId,
    )
    const results = cp.questionResults
    const allCorrect = chapterQuestions.every(
      (q) => results[q.id] && results[q.id].correct,
    )
    if (allCorrect) {
      cp.completed = true
      if (question.chapterId === 'ch1_variables' &&
          !state.value.unlockedChapters.includes('ch2_lists')) {
        state.value.unlockedChapters.push('ch2_lists')
      }
    }

    save()

    return { leveledUp, expGained }
  }

  function getChapterProgress(chapterId: string): ChapterProgress {
    return (
      state.value.chapterProgress[chapterId] ?? {
        completed: false,
        questionResults: {},
      }
    )
  }

  function getChapterAccuracy(chapterId: string): {
    total: number
    correct: number
    wrongIds: string[]
    knowledgeTags: string[]
  } {
    const cp = state.value.chapterProgress[chapterId]
    if (!cp) return { total: 0, correct: 0, wrongIds: [], knowledgeTags: [] }

    const chapterQuestions = questions.filter((q) => q.chapterId === chapterId)
    const total = chapterQuestions.length
    const wrongIds: string[] = []
    const tags = new Set<string>()

    for (const q of chapterQuestions) {
      const result = cp.questionResults[q.id]
      if (!result || !result.correct) {
        wrongIds.push(q.id)
        q.knowledgeTags.forEach((t) => tags.add(t))
      }
    }

    return {
      total,
      correct: total - wrongIds.length,
      wrongIds,
      knowledgeTags: Array.from(tags),
    }
  }

  function getQuestionResult(
    chapterId: string,
    questionId: string,
  ): { correct: boolean; score: number; attempts: number } | null {
    return (
      state.value.chapterProgress[chapterId]?.questionResults[questionId] ?? null
    )
  }

  async function load() {
    const saved = await loadGameState()
    if (saved) {
      state.value = saved
    }
  }

  async function save() {
    await saveGameState(state.value)
  }

  function resetProgress() {
    state.value = createInitialState()
    save()
  }

  return {
    state,
    level,
    exp,
    expToNext,
    expPercent,
    wisdomViewed,
    currentChapterId,
    chapterProgress,
    totalQuestionsAnswered,
    totalCorrect,
    isWisdomViewed,
    markWisdomViewed,
    selectChapter,
    submitAnswer,
    getChapterProgress,
    getChapterAccuracy,
    getQuestionResult,
    load,
    save,
    resetProgress,
  }
})
