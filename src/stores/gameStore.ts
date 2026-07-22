import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { SectionProgress, KnowledgeState } from '@/types'
import { saveGameState, loadGameState } from '@/services/storage'
import { questions, chapters } from '@/data/questions'
import { calcExpToNext, calcExpGained, calcScore } from '@/constants/progression'
import { calcMastery } from '@/utils/mastery'

export interface GameState {
  version: number
  level: number
  exp: number
  expToNext: number
  unlockedChapters: string[]
  wisdomViewed: string[]
  currentChapterId: string | null
  currentSectionId: string | null
  sectionProgress: Record<string, SectionProgress>
  knowledgeStates: Record<string, KnowledgeState>
  lastPlayedAt: number | null
  totalQuestionsAnswered: number
  totalCorrect: number
  accumulatedLearningMs: number
  lastLearningEntryTime: number | null
}

function createInitialState(): GameState {
  return {
    version: 1,
    level: 1,
    exp: 0,
    expToNext: calcExpToNext(1),
    unlockedChapters: ['ch1_variables'],
    wisdomViewed: [],
    currentChapterId: null,
    currentSectionId: null,
    sectionProgress: {},
    knowledgeStates: {},
    lastPlayedAt: null,
    totalQuestionsAnswered: 0,
    totalCorrect: 0,
    accumulatedLearningMs: 0,
    lastLearningEntryTime: null,
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
  const unlockedChapters = computed(() => state.value.unlockedChapters)
  const knowledgeStates = computed(() => state.value.knowledgeStates)

  function isWisdomViewed(chapterId: string): boolean {
    return state.value.wisdomViewed.includes(chapterId)
  }

  function isChapterUnlocked(chapterId: string): boolean {
    return state.value.unlockedChapters.includes(chapterId)
  }

  async function markWisdomViewed(chapterId: string): Promise<void> {
    if (!state.value.wisdomViewed.includes(chapterId)) {
      state.value.wisdomViewed.push(chapterId)
    }
    await save()
  }

  function selectChapter(chapterId: string) {
    state.value.currentChapterId = chapterId
    const ch = chapters.find((c) => c.id === chapterId)
    if (ch && ch.sections.length > 0) {
      const firstUnlocked = ch.sections.find(
        (s) => isSectionUnlocked(s.id, s.unlockAfter),
      )
      const secId = firstUnlocked?.id ?? ch.sections[0].id
      state.value.currentSectionId = secId
      getSectionProgress(secId)
    } else {
      state.value.currentSectionId = null
    }
  }

  function selectSection(sectionId: string) {
    state.value.currentSectionId = sectionId
    getSectionProgress(sectionId)
  }

  function isSectionUnlocked(sectionId: string, unlockAfter?: string): boolean {
    if (!unlockAfter) return true
    const prev = state.value.sectionProgress[unlockAfter]
    return prev?.completed ?? false
  }

  async function submitAnswer(
    questionId: string,
    correct: boolean,
  ): Promise<{ leveledUp: boolean; expGained: number }> {
    const question = questions.find((q) => q.id === questionId)
    if (!question) return { leveledUp: false, expGained: 0 }

    const expGained = calcExpGained(question.type, correct)

    const sectionId = state.value.currentSectionId
    if (sectionId) {
      const sp = state.value.sectionProgress[sectionId] || {
        completed: false,
        questionResults: {},
        consecutiveWrong: 0,
        fatigueQuestionCount: 0,
      }
      const prev = sp.questionResults[questionId]
      sp.questionResults[questionId] = {
        correct: prev ? prev.correct || correct : correct,
        score: Math.max(prev?.score ?? 0, calcScore(correct)),
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

    // Update knowledge states from question tags
    if (question.knowledgeTags) {
      for (const tag of question.knowledgeTags) {
        const ks = state.value.knowledgeStates[tag] || {
          knowledgeTag: tag, totalAttempts: 0, correctAttempts: 0,
          consecutiveCorrect: 0, lastSeen: 0,
        }
        ks.totalAttempts++
        if (correct) {
          ks.correctAttempts++
          ks.consecutiveCorrect++
        } else {
          ks.consecutiveCorrect = 0
        }
        ks.lastSeen = Date.now()
        state.value.knowledgeStates[tag] = ks
      }
    }

    let leveledUp = false
    while (state.value.exp >= state.value.expToNext) {
      state.value.exp -= state.value.expToNext
      state.value.level += 1
      state.value.expToNext = calcExpToNext(state.value.level)
      leveledUp = true
    }

    await save()
    return { leveledUp, expGained }
  }

  async function completeSection(sectionId: string): Promise<void> {
    if (!state.value.sectionProgress[sectionId]) return
    state.value.sectionProgress[sectionId].completed = true
    const parent = chapters.find((ch) => ch.sections.some((s) => s.id === sectionId))
    if (parent) {
      const allDone = parent.sections.every(
        (s) => state.value.sectionProgress[s.id]?.completed,
      )
      if (allDone) {
        const idx = chapters.findIndex((ch) => ch.id === parent.id)
        const nextCh = chapters[idx + 1]
        if (nextCh && !state.value.unlockedChapters.includes(nextCh.id)) {
          state.value.unlockedChapters.push(nextCh.id)
        }
      }
    }
    await save()
  }

  function getSectionProgress(sectionId: string): SectionProgress {
    if (!state.value.sectionProgress[sectionId]) {
      state.value.sectionProgress[sectionId] = {
        completed: false,
        questionResults: {},
        consecutiveWrong: 0,
        fatigueQuestionCount: 0,
      }
    }
    return state.value.sectionProgress[sectionId] as SectionProgress
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
    questionId: string,
  ): { correct: boolean; score: number; attempts: number } | null {
    for (const sp of Object.values(state.value.sectionProgress)) {
      const r = sp.questionResults[questionId]
      if (r) return r
    }
    return null
  }

  function getMastery(tag: string): number {
    return calcMastery(state.value.knowledgeStates[tag])
  }

  function getKnowledgeState(tag: string): KnowledgeState | null {
    return state.value.knowledgeStates[tag] ?? null
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

  function migrate(raw: unknown): GameState {
    const defaults = createInitialState()
    if (typeof raw !== 'object' || raw === null) return defaults

    const saved = raw as Record<string, unknown>
    const version = typeof saved.version === 'number' ? saved.version : 0

    if (version >= 1) {
      return {
        ...defaults,
        ...saved,
        version: 1,
        accumulatedLearningMs: typeof saved.accumulatedLearningMs === 'number' ? saved.accumulatedLearningMs : 0,
        lastLearningEntryTime: typeof saved.lastLearningEntryTime === 'number' ? saved.lastLearningEntryTime : null,
        knowledgeStates: saved.knowledgeStates ?? {},
        sectionProgress: saved.sectionProgress ?? {},
        unlockedChapters: Array.isArray(saved.unlockedChapters) ? saved.unlockedChapters : defaults.unlockedChapters,
        wisdomViewed: Array.isArray(saved.wisdomViewed) ? saved.wisdomViewed : [],
      } as GameState
    }

    return {
      ...defaults,
      ...saved,
      version: 1,
      knowledgeStates: saved.knowledgeStates ?? {},
      sectionProgress: saved.sectionProgress ?? {},
      unlockedChapters: Array.isArray(saved.unlockedChapters) ? saved.unlockedChapters : defaults.unlockedChapters,
      wisdomViewed: Array.isArray(saved.wisdomViewed) ? saved.wisdomViewed : [],
    } as GameState
  }

  async function load(): Promise<void> {
    const saved = await loadGameState()
    if (saved) {
      state.value = migrate(saved)
    }
  }

  async function save(): Promise<void> {
    try {
      await saveGameState(state.value)
    } catch (err) {
      console.error('[gameStore] 保存失败:', err)
    }
  }

  async function resetProgress(): Promise<void> {
    state.value = createInitialState()
    await save()
  }

  function getFatigueQuestionCount(sectionId: string): number {
    const sp = state.value.sectionProgress[sectionId]
    return sp?.fatigueQuestionCount ?? 0
  }

  function incrementFatigueQuestionCount(sectionId: string): number {
    const sp = getSectionProgress(sectionId)
    sp.fatigueQuestionCount = (sp.fatigueQuestionCount || 0) + 1
    return sp.fatigueQuestionCount
  }

  function getFatigueConsecutiveWrong(sectionId: string): number {
    const sp = state.value.sectionProgress[sectionId]
    return sp?.consecutiveWrong ?? 0
  }

  const ACCUMULATED_THRESHOLD_MS = 45 * 60 * 1000

  function getAccumulatedLearningMs(): number {
    let total = state.value.accumulatedLearningMs
    if (state.value.lastLearningEntryTime) {
      total += Date.now() - state.value.lastLearningEntryTime
    }
    return total
  }

  function onEnterQuiz() {
    state.value.lastLearningEntryTime = Date.now()
  }

  async function onLeaveQuiz(): Promise<void> {
    if (state.value.lastLearningEntryTime) {
      state.value.accumulatedLearningMs += Date.now() - state.value.lastLearningEntryTime
      state.value.lastLearningEntryTime = null
    }
    await save()
  }

  function shouldShowRestPrompt(): boolean {
    return getAccumulatedLearningMs() >= ACCUMULATED_THRESHOLD_MS
  }

  async function dismissRestPrompt(): Promise<void> {
    state.value.accumulatedLearningMs = 0
    state.value.lastLearningEntryTime = null
    await save()
  }

  return {
    // ⚠️ E2E 测试注入专用，组件请勿直接访问（用 getter / action 替代）
    state,
    level,
    exp,
    expToNext,
    expPercent,
    wisdomViewed,
    currentSectionId,
    unlockedChapters,
    knowledgeStates,
    isWisdomViewed,
    isChapterUnlocked,
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
    getMastery,
    getFatigueConsecutiveWrong,
    onEnterQuiz,
    onLeaveQuiz,
    shouldShowRestPrompt,
    dismissRestPrompt,
    load,
    save,
    resetProgress,
  }
})
