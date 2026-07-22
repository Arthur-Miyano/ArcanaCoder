import { ref, computed, watch } from 'vue'
import { useGameStore } from '@/stores/gameStore'
import { chapters, getQuestionsBySection } from '@/data/questions'
import { backupQuestions } from '@/data/backup_questions'
import { runPython } from '@/services/pyodide'
import type { Question } from '@/types'
import { compareOutput, type DiffResult } from '@/utils/diff'
import { validateCode as validateCodeStyle, type CodeHint } from '@/utils/codeValidator'
import { gradeCode, gradeFreeCoding, gradeChoice } from '@/utils/grade'

export function isChoiceType(q: Question): boolean {
  return q.type === 'choice' || q.type === 'output_predict'
}

export function useQuiz(chapterId: string, emit: {
  back: () => void
  reviewKnowledge: () => void
  chapterComplete: () => void
}) {
  const store = useGameStore()

  const currentSection = computed(() => {
    const ch = chapters.find((c) => c.id === chapterId)
    if (!ch || !ch.sections.length) return null
    const secId = store.currentSectionId
    if (!secId) return null
    return ch.sections.find((s) => s.id === secId) ?? null
  })

  const currentSectionId = computed(() => currentSection.value?.id ?? '')

  const questions = ref<Question[]>([])
  const currentIndex = ref(0)
  const backupLimit = ref(0)
  const usedBackupIds = ref<Set<string>>(new Set())
  const showSectionComplete = ref(false)
  const sectionResults = ref<{ correct: number; total: number; wrongIds: string[] } | null>(null)

  watch(currentSection, (sec) => {
    if (!sec) return
    questions.value = getQuestionsBySection(sec.id)
    currentIndex.value = 0
    backupLimit.value = 0
    usedBackupIds.value = new Set()
  }, { immediate: true })

  const currentQuestion = computed<Question | undefined>(
    () => questions.value[currentIndex.value],
  )

  // 联合类型 + 组件适配方案：userAnswer 跨 choice(number)/code(string) 两种类型。
  // 类型安全在 composable 层维持，组件层通过 computed{get/set} 做适配。
  // 详见 已知缺口.md C3。
  type UserAnswer = string | number | null
  const userAnswer = ref<UserAnswer>(null)
  const showFeedback = ref(false)
  const lastResult = ref<{
    correct: boolean
    explanation: string
    correctAnswer?: string
    errorDetail?: string
    diff?: DiffResult
    codeHints?: CodeHint[]
  } | null>(null)
  const submitting = ref(false)
  const showResults = ref(false)
  const retryIds = ref<string[]>([])
  const isRetryMode = ref(false)

  const isLastQuestion = computed(
    () => currentIndex.value >= questions.value.length - 1,
  )

  const noxHint = ref('让我们开始这一层的试炼吧，贤者。')

  const accuracyInfo = computed(() => store.getChapterAccuracy(chapterId))

  function isChoiceType(q: Question): boolean {
    return q.type === 'choice' || q.type === 'output_predict'
  }

  function getHintForQuestion(q: Question): string {
    const result = store.getQuestionResult(q.id)
    const attempts = result?.attempts ?? 0
    if (attempts >= 2 && q.hintDirect) return q.hintDirect
    if (attempts >= 1 && q.hintRoleplay) return q.hintRoleplay
    return q.hint ?? '加油，你可以的！'
  }

  watch(currentQuestion, (q) => {
    if (!q) return
    userAnswer.value = isChoiceType(q) ? null : q.initialCode ?? ''
    showFeedback.value = false
    lastResult.value = null
    noxHint.value = getHintForQuestion(q)
  })

  async function validateCode(
    q: Question,
    code: string,
  ): Promise<{ correct: boolean; errorDetail?: string; userOutput?: string }> {
    if (q.type === 'code_fill' || q.type === 'code_fix') {
      return gradeCode(q, code, runPython)
    }
    if (q.type === 'free_coding' && q.testCases) {
      return gradeFreeCoding(code, q.testCases, runPython)
    }
    return { correct: false }
  }

  function getCorrectAnswer(q: Question): string | undefined {
    if (q.type === 'choice' || q.type === 'output_predict') {
      return q.options?.[q.correctOption!]
    }
    return q.correctCode ?? q.expectedOutput
  }

  async function submit(): Promise<void> {
    const q = currentQuestion.value
    if (!q || submitting.value) return

    submitting.value = true
    let correct = false
    let errorDetail: string | undefined
    let userOutput: string | undefined
    let diff: DiffResult | undefined

    if (q.type === 'choice' || q.type === 'output_predict') {
      correct = gradeChoice(q, userAnswer.value as number | null).correct
    } else {
      const code = typeof userAnswer.value === 'string' ? userAnswer.value : ''
      const result = await validateCode(q, code)
      correct = result.correct
      errorDetail = result.errorDetail
      if (!correct && q.expectedOutput) {
        userOutput = result.userOutput
        diff = compareOutput(userOutput ?? '', q.expectedOutput)
      }
    }

    await store.submitAnswer(q.id, correct)
    const hints: CodeHint[] = !correct && typeof userAnswer.value === 'string'
      ? validateCodeStyle(userAnswer.value, { knowledgeTags: q.knowledgeTags, correctCode: q.correctCode })
      : []
    lastResult.value = {
      correct,
      explanation: q.explanation,
      correctAnswer: correct ? undefined : getCorrectAnswer(q),
      errorDetail,
      diff,
      codeHints: hints,
    }
    if (!correct) {
      noxHint.value = getHintForQuestion(q)
      const secId = currentSectionId.value
      const consecWrong = secId ? store.getFatigueConsecutiveWrong(secId) : 0
      if (consecWrong >= 3) {
        noxHint.value = '别急别急，这个法则确实有点绕。我们先深呼吸一下...要不要回智慧之书翻翻看？'
      }
      if (backupLimit.value < 3 && q.knowledgeTags.length > 0) {
        const bk = backupQuestions.find(
          (b) => b.id !== q.id &&
            b.knowledgeTags.some((t) => q.knowledgeTags.includes(t)) &&
            !usedBackupIds.value.has(b.id) &&
            !questions.value.some((x) => x.id === b.id),
        )
        if (bk) {
          usedBackupIds.value.add(bk.id)
          backupLimit.value++
          const insertAt = currentIndex.value + 1
          questions.value.splice(insertAt, 0, bk)
        }
      }
    }

    showFeedback.value = true
    submitting.value = false
  }

  async function finishSection(correct: number, total: number, wrongIds: string[]): Promise<void> {
    sectionResults.value = { correct, total, wrongIds }
    if (wrongIds.length === 0 && currentSection.value) {
      await store.completeSection(currentSection.value.id)
    }
    showSectionComplete.value = true
  }

  async function nextQuestion(): Promise<void> {
    showFeedback.value = false
    if (isRetryMode.value && currentQuestion.value) {
      const qId = currentQuestion.value.id
      if (lastResult.value?.correct) {
        retryIds.value = retryIds.value.filter((id) => id !== qId)
        if (retryIds.value.length > 0) {
          const nextId = retryIds.value[0]
          const idx = questions.value.findIndex((q) => q.id === nextId)
          if (idx >= 0) { currentIndex.value = idx; return }
        }
        isRetryMode.value = false
        const qWrong = questions.value.filter(
          (q) => !store.getQuestionResult(q.id)?.correct,
        )
        if (qWrong.length === 0 && currentSection.value) {
          await store.completeSection(currentSection.value.id)
          const chAcc = store.getChapterAccuracy(chapterId)
          if (chAcc.wrongIds.length === 0) { emit.chapterComplete(); return }
          await finishSection(questions.value.length, questions.value.length, [])
        } else {
          showResults.value = true
        }
        return
      }
      return
    }
    if (isLastQuestion.value) {
      const correct = questions.value.filter((q) => store.getQuestionResult(q.id)?.correct).length
      const wrongIds = questions.value
        .filter((q) => !store.getQuestionResult(q.id)?.correct)
        .map((q) => q.id)
      await finishSection(correct, questions.value.length, wrongIds)
    } else {
      currentIndex.value++
    }
  }

  function retryAll() {
    showResults.value = false
    const accuracy = store.getChapterAccuracy(chapterId)
    retryIds.value = [...accuracy.wrongIds]
    isRetryMode.value = true
    if (retryIds.value.length > 0) {
      const idx = questions.value.findIndex((q) => q.id === retryIds.value[0])
      if (idx >= 0) currentIndex.value = idx
    }
  }

  function retrySingle(questionId: string) {
    showResults.value = false
    retryIds.value = [questionId]
    isRetryMode.value = true
    const idx = questions.value.findIndex((q) => q.id === questionId)
    if (idx >= 0) currentIndex.value = idx
  }

  function retrySectionWrong() {
    if (!sectionResults.value || sectionResults.value.wrongIds.length === 0) return
    showSectionComplete.value = false
    retryIds.value = [...sectionResults.value.wrongIds]
    isRetryMode.value = true
    const idx = questions.value.findIndex((q) => q.id === retryIds.value[0])
    if (idx >= 0) currentIndex.value = idx
  }

  function goBack() {
    if (isRetryMode.value && retryIds.value.length > 0) {
      const msg = `还有 ${retryIds.value.length} 道错题未重试，确定退出吗？`
      if (typeof window !== 'undefined' && !window.confirm(msg)) return
      isRetryMode.value = false
      retryIds.value = []
    }
    showResults.value = false
    emit.back()
  }

  return {
    questions, currentIndex, currentQuestion, isLastQuestion,
    userAnswer, showFeedback, lastResult, submitting,
    showResults, showSectionComplete, sectionResults,
    retryIds, isRetryMode,
    noxHint, accuracyInfo,
    submit, nextQuestion, goBack,
    retryAll, retrySingle, retrySectionWrong,
  }
}
