<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useGameStore } from '@/stores/gameStore'
import { chapters, questions as allQuestions } from '@/data/questions'
import { backupQuestions } from '@/data/backup_questions'
import { runPython } from '@/services/pyodide'
import type { Question, TestCase } from '@/types'
import { compareOutput, type DiffResult } from '@/utils/diff'
import { validateCode as validateCodeStyle, type CodeHint } from '@/utils/codeValidator'
import ChoiceQuestion from './ChoiceQuestion.vue'
import CodeQuestion from './CodeQuestion.vue'
import OutputPredict from './OutputPredict.vue'
import NoxDialog from './NoxDialog.vue'
import FeedbackPanel from './FeedbackPanel.vue'

const props = defineProps<{
  chapterId: string
}>()

const emit = defineEmits<{
  'back': []
  'reviewKnowledge': []
  'chapterComplete': []
}>()

const store = useGameStore()
const currentSection = computed(() => {
  const ch = chapters.find((c) => c.id === props.chapterId)
  if (!ch) return null
  const secId = store.state.currentSectionId
  return ch.sections.find((s) => s.id === secId) ?? null
})
const questions = ref<Question[]>([])

watch(currentSection, (sec) => {
  if (!sec) return
  const qs = sec.questionIds
    .map((id) => allQuestions.find((q) => q.id === id))
    .filter((q): q is Question => q !== undefined)
  questions.value = qs
  currentIndex.value = 0
  backupLimit.value = 0
  usedBackupIds.value = new Set()
  fatigueQuestionCount.value = 0
  fatigueConsecutiveWrong.value = 0
}, { immediate: true })

const currentIndex = ref(0)
const currentQuestion = computed<Question | undefined>(
  () => questions.value[currentIndex.value],
)

const userAnswer = ref<any>(null)
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
const codeHints = ref<CodeHint[]>([])

const isLastQuestion = computed(
  () => currentIndex.value >= questions.value.length - 1,
)

const noxHint = ref('看看这一关你能答对几道？')

const fatigueQuestionCount = ref(0)
const fatigueConsecutiveWrong = ref(0)
const showRestPrompt = ref(false)
const restTimer = ref<ReturnType<typeof setTimeout> | null>(null)

const backupLimit = ref(0)
const usedBackupIds = ref<Set<string>>(new Set())

function isChoiceType(q: Question): boolean {
  return q.type === 'choice' || q.type === 'output_predict'
}

function getHintForQuestion(q: Question): string {
  const result = store.getQuestionResult(props.chapterId, q.id)
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
    const { output, error } = await runPython(code)
    if (error) return { correct: false, errorDetail: error }
    if (q.expectedOutput !== undefined) {
      return { correct: output.trim() === q.expectedOutput, userOutput: output.trim() }
    }
    if (q.correctCode) {
      const { output: expectedOut } = await runPython(q.correctCode)
      return { correct: output.trim() === expectedOut.trim(), userOutput: output.trim() }
    }
    return { correct: !error }
  }
  if (q.type === 'free_coding' && q.testCases) {
    return validateFreeCoding(code, q.testCases)
  }
  return { correct: false }
}

async function validateFreeCoding(
  code: string,
  testCases: TestCase[],
): Promise<{ correct: boolean; errorDetail?: string; userOutput?: string }> {
  for (const test of testCases) {
    const fullCode = `${code}\nprint(${test.input})`
    const { output, error } = await runPython(fullCode)
    if (error) return { correct: false, errorDetail: `测试输入 ${test.input} 失败：${error}` }
    if (output.trim() !== test.expected) {
      return {
        correct: false,
        errorDetail: `输入 ${test.input}：期望 ${test.expected}，实际 ${output.trim()}`,
      }
    }
  }
  return { correct: true }
}

function getCorrectAnswer(q: Question): string | undefined {
  if (q.type === 'choice' || q.type === 'output_predict') {
    return q.options?.[q.correctOption!]
  }
  return q.correctCode ?? q.expectedOutput
}

async function submit() {
  const q = currentQuestion.value
  if (!q || submitting.value) return

  submitting.value = true
  let correct = false
  let errorDetail: string | undefined
  let userOutput: string | undefined
  let diff: DiffResult | undefined

  if (q.type === 'choice' || q.type === 'output_predict') {
    correct = userAnswer.value === q.correctOption
  } else {
    const code = userAnswer.value ?? ''
    const result = await validateCode(q, code)
    correct = result.correct
    errorDetail = result.errorDetail
    if (!correct && q.expectedOutput) {
      userOutput = result.userOutput
      diff = compareOutput(userOutput ?? '', q.expectedOutput)
    }
  }

  store.submitAnswer(q.id, correct)
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
    fatigueConsecutiveWrong.value++
    if (fatigueConsecutiveWrong.value >= 3) {
      noxHint.value = '贤者，你的魔力有些紊乱了。建议回到智慧之书复习一下再继续。'
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
  } else {
    fatigueConsecutiveWrong.value = 0
  }

  fatigueQuestionCount.value++
  checkFatigue()

  showFeedback.value = true
  submitting.value = false
}

function dismissRest() {
  showRestPrompt.value = false
  if (restTimer.value) clearTimeout(restTimer.value)
}

function checkFatigue() {
  if (fatigueQuestionCount.value >= 7 && !showRestPrompt.value) {
    showRestPrompt.value = true
    restTimer.value = setTimeout(() => {
      showRestPrompt.value = false
    }, 5000)
  }
}
function nextQuestion() {
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
      const accuracy = store.getChapterAccuracy(props.chapterId)
      if (accuracy.wrongIds.length === 0) { emit('chapterComplete') }
      else { showResults.value = true }
      return
    }
    return
  }
  if (isLastQuestion.value) {
    const accuracy = store.getChapterAccuracy(props.chapterId)
    if (accuracy.wrongIds.length === 0) {
      emit('chapterComplete')
    } else {
      showResults.value = true
    }
  } else {
    currentIndex.value++
  }
}

function retryAll() {
  showResults.value = false
  const accuracy = store.getChapterAccuracy(props.chapterId)
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

function goBack() {
  if (isRetryMode.value && retryIds.value.length > 0) {
    const msg = `还有 ${retryIds.value.length} 道错题未重试，确定退出吗？`
    if (!confirm(msg)) return
    isRetryMode.value = false
    retryIds.value = []
  }
  showResults.value = false
  emit('back')
}

const accuracyInfo = computed(() => store.getChapterAccuracy(props.chapterId))
</script>

<template>
  <div class="flex flex-col flex-1">
    <!-- 结果总览 -->
    <div v-if="showResults" class="flex-1 flex flex-col">
      <div class="flex items-center justify-between px-4 py-2 border-b border-gray-700">
        <button class="text-xs text-gray-400 hover:text-white transition-colors" @click="goBack">
          ← 返回
        </button>
        <span class="text-xs text-gray-500">答题结果</span>
      </div>

      <div class="flex-1 overflow-y-auto px-4 py-6">
        <div class="max-w-md mx-auto space-y-4">
          <div class="text-center">
            <div class="w-12 h-12 mx-auto rounded-full bg-[#4B0082] border-2 border-[#c9a227] mb-3" />
            <h2 class="text-lg font-bold text-magic-gold">答题完成</h2>
            <p class="text-sm text-gray-400 mt-1">
              {{ accuracyInfo.correct }}/{{ accuracyInfo.total }} 正确
            </p>
            <div class="mt-3 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-500"
                :class="accuracyInfo.wrongIds.length === 0 ? 'bg-green-500' : 'bg-yellow-500'"
                :style="{ width: `${(accuracyInfo.correct / accuracyInfo.total) * 100}%` }"
              />
            </div>
          </div>

          <div v-if="accuracyInfo.wrongIds.length > 0" class="space-y-2">
            <p class="text-xs text-gray-400">需要重试的题目：</p>
            <button
              v-for="qId in accuracyInfo.wrongIds"
              :key="qId"
              class="w-full text-left px-3 py-2 rounded border border-red-800/50 bg-red-900/20 text-sm text-red-200"
              @click="retrySingle(qId)"
            >
              ✗ 第{{ questions.findIndex((q) => q.id === qId) + 1 }}题
            </button>

            <div v-if="accuracyInfo.knowledgeTags.length > 0" class="mt-4">
              <p class="text-xs text-gray-400 mb-1">建议复习的知识点：</p>
              <div class="flex flex-wrap gap-1.5">
                <span
                  v-for="tag in accuracyInfo.knowledgeTags"
                  :key="tag"
                  class="px-2 py-0.5 rounded bg-magic-card border border-gray-600 text-xs text-gray-300"
                >
                  {{ tag }}
                </span>
              </div>
              <button
                class="mt-3 text-xs text-magic-gold hover:text-yellow-300 transition-colors"
                @click="emit('reviewKnowledge')"
              >
                ← 打开智慧之书复习
              </button>
            </div>
          </div>

          <div class="pt-4 flex gap-3">
            <button
              v-if="accuracyInfo.wrongIds.length > 0"
              class="flex-1 py-2.5 rounded font-medium bg-yellow-700 hover:bg-yellow-600 text-white transition-colors"
              @click="retryAll"
            >
              重试错题
            </button>
            <button
              class="flex-1 py-2.5 rounded font-medium bg-[#4B0082] hover:bg-[#5a0099] text-white transition-colors"
              @click="goBack"
            >
              返回关卡
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 答题面板 -->
    <div v-else-if="currentQuestion" class="flex-1 flex flex-col">
      <div class="flex items-center justify-between px-4 py-2 border-b border-gray-700">
        <button class="text-xs text-gray-400 hover:text-white transition-colors" @click="goBack">
          ← 返回
        </button>
        <span class="text-xs text-gray-500">
          第 {{ currentIndex + 1 }}/{{ questions.length }} 题
        </span>
        <button
          class="text-xs text-magic-gold hover:text-yellow-300 transition-colors"
          @click="emit('reviewKnowledge')"
        >
          知识
        </button>
      </div>

      <div class="flex-1 overflow-y-auto px-4 py-6 space-y-6 max-w-2xl mx-auto w-full">
        <h2 class="text-base font-bold text-white">
          {{ currentQuestion.narrativeTitle || currentQuestion.title }}
        </h2>

        <p
          v-if="currentQuestion.narrativeDesc"
          class="text-gray-300 leading-relaxed whitespace-pre-wrap"
        >
          {{ currentQuestion.narrativeDesc }}
        </p>

        <ChoiceQuestion
          v-if="currentQuestion.type === 'choice'"
          :question="currentQuestion"
          v-model="userAnswer"
        />

        <CodeQuestion
          v-else-if="currentQuestion.type === 'code_fill' || currentQuestion.type === 'code_fix' || currentQuestion.type === 'free_coding'"
          :question="currentQuestion"
          v-model="userAnswer"
        />

        <OutputPredict
          v-else-if="currentQuestion.type === 'output_predict'"
          :question="currentQuestion"
          v-model="userAnswer"
        />

        <NoxDialog :message="noxHint" />
      </div>

      <FeedbackPanel
        v-if="showFeedback && lastResult && currentQuestion"
        :correct="lastResult.correct"
        :explanation="lastResult.explanation"
        :correct-answer="lastResult.correctAnswer"
        :error-detail="lastResult.errorDetail"
        :diff="lastResult.diff"
        :code-hints="lastResult.codeHints"
        :question="currentQuestion"
        :user-code="typeof userAnswer === 'string' ? userAnswer : undefined"
        @next="nextQuestion"
      />

      <div v-else class="px-4 py-3 border-t border-gray-700">
        <button
          class="w-full py-2.5 rounded font-medium transition-colors"
          :class="[
            userAnswer === null || userAnswer === '' || submitting
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-[#4B0082] hover:bg-[#5a0099] text-white',
          ]"
          :disabled="userAnswer === null || userAnswer === '' || submitting"
          @click="submit"
        >
          {{ submitting ? '判断中...' : '提交答案' }}
        </button>
      </div>
    </div>

    <div v-else class="flex-1 flex items-center justify-center text-gray-400 text-sm">
      没有题目数据
    </div>

    <!-- 休息提示 -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition-all duration-300"
        enter-from-class="opacity-0"
        leave-active-class="transition-all duration-200"
        leave-to-class="opacity-0"
      >
        <div
          v-if="showRestPrompt"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          @click="dismissRest"
        >
          <div
            class="bg-magic-card border border-gray-600 rounded-lg px-6 py-5 max-w-sm text-center space-y-3"
            @click.stop
          >
            <div class="w-6 h-6 mx-auto rounded-full bg-[#4B0082] border border-[#c9a227]" />
            <p class="text-gray-200 leading-relaxed">
              你已经连续施法 {{ fatigueQuestionCount }} 次了，贤者。休息一下效果更好。
            </p>
            <button
              class="px-4 py-1.5 rounded text-sm font-medium bg-[#4B0082] hover:bg-[#5a0099] text-white transition-colors"
              @click="dismissRest"
            >
              继续答题
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
