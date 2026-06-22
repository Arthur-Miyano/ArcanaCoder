import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { QuestionType, SectionProgress } from '@/types'
import { saveGameState, loadGameState } from '@/services/storage'
import { questions, chapters } from '@/data/questions'

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
  currentSectionId: string | null
  sectionProgress: Record<string, SectionProgress>
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
    currentSectionId: null,
    sectionProgress: {},
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
  const currentSectionId = computed(() => state.value.currentSectionId)

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
    state.value.currentSectionId = null
  }

  function selectSection(sectionId: string) {
    state.value.currentSectionId = sectionId
    if (!state.value.sectionProgress[sectionId]) {
      state.value.sectionProgress[sectionId] = {
        completed: false,
        questionResults: {},
        consecutiveWrong: 0,
      }
    }
  }

  function isSectionUnlocked(sectionId: string, unlockAfter?: string): boolean {
    if (!unlockAfter) return true
    const prev = state.value.sectionProgress[unlockAfter]
    return prev?.completed ?? false
  }

  function submitAnswer(
    questionId: string,
    correct: boolean,
  ): { leveledUp: boolean; expGained: number } {
    const question = questions.find((q) => q.id === questionId)
    if (!question) return { leveledUp: false, expGained: 0 }

    const baseExp = EXP_TABLE[question.type] || 10
    const expGained = correct ? baseExp : Math.max(1, Math.floor(baseExp / 3))

    const sectionId = state.value.currentSectionId
    if (sectionId) {
      const sp = state.value.sectionProgress[sectionId] || {
        completed: false,
        questionResults: {},
        consecutiveWrong: 0,
      }
      const prev = sp.questionResults[questionId]
      sp.questionResults[questionId] = {
        correct: prev ? prev.correct || correct : correct,
        score: Math.max(prev?.score ?? 0, correct ? 100 : Math.floor(100 / 3)),
        attempts: (prev?.attempts ?? 0) + 1,
      }
      if (correct) sp.consecutiveWrong = 0
      else sp.consecutiveWrong++
      state.value.sectionProgress[sectionId] = sp
    }

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

    save()
    return { leveledUp, expGained }
  }

  function completeSection(sectionId: string) {
    if (state.value.sectionProgress[sectionId]) {
      state.value.sectionProgress[sectionId].completed = true
    }
    save()
  }

  function getSectionProgress(sectionId: string): SectionProgress {
    return state.value.sectionProgress[sectionId] ?? {
      completed: false,
      questionResults: {},
      consecutiveWrong: 0,
    }
  }

  function getChapterProgress(chapterId: string): { completed: boolean; total: number; done: number } {
    const ch = chapters.find((c) => c.id === chapterId)
    if (!ch) return { completed: false, total: 0, done: 0 }
    let completed = true
    let total = 0
    let done = 0
    for (const sec of ch.sections) {
      total++
      const sp = state.value.sectionProgress[sec.id]
      if (sp?.completed) done++
      else completed = false
    }
    return { completed, total, done }
  }

  function getQuestionResult(
    chapterId: string,
    questionId: string,
  ): { correct: boolean; score: number; attempts: number } | null {
    for (const sp of Object.values(state.value.sectionProgress)) {
      const r = sp.questionResults[questionId]
      if (r) return r
    }
    return null
  }

  function getChapterAccuracy(chapterId: string): {
    total: number; correct: number; wrongIds: string[]; knowledgeTags: string[]
  } {
    const ch = chapters.find((c) => c.id === chapterId)
    if (!ch) return { total: 0, correct: 0, wrongIds: [], knowledgeTags: [] }
    const wrongIds: string[] = []
    const tags = new Set<string>()
    let total = 0
    let correct = 0
    for (const sec of ch.sections) {
      const sp = state.value.sectionProgress[sec.id]
      if (!sp) continue
      for (const [qId, r] of Object.entries(sp.questionResults)) {
        total++
        if (r.correct) correct++
        else {
          wrongIds.push(qId)
          const q = questions.find((x) => x.id === qId)
          q?.knowledgeTags.forEach((t) => tags.add(t))
        }
      }
    }
    return { total, correct, wrongIds, knowledgeTags: Array.from(tags) }
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
    currentSectionId,
    isWisdomViewed,
    markWisdomViewed,
    selectChapter,
    selectSection,
    isSectionUnlocked,
    submitAnswer,
    completeSection,
    getSectionProgress,
    getChapterProgress,
    getQuestionResult,
    getChapterAccuracy,
    load,
    save,
    resetProgress,
  }
})
