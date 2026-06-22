<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useGameStore } from '@/stores/gameStore'
import { getQuestionsByChapter } from '@/data/questions'
import { runPython } from '@/services/pyodide'
import type { Question, TestCase } from '@/types'
import ChoiceQuestion from './ChoiceQuestion.vue'
import CodeQuestion from './CodeQuestion.vue'
import OutputPredict from './OutputPredict.vue'
import NoxDialog from './NoxDialog.vue'

const props = defineProps<{
  chapterId: string
}>()

const emit = defineEmits<{
  'back': []
  'chapterComplete': []
}>()

const store = useGameStore()
const questions = computed(() => getQuestionsByChapter(props.chapterId))

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
} | null>(null)
const submitting = ref(false)

const isLastQuestion = computed(
  () => currentIndex.value >= questions.value.length - 1,
)

const noxHint = ref('看看这一关你能答对几道？')

function isChoiceType(q: Question): boolean {
  return q.type === 'choice' || q.type === 'output_predict'
}

watch(currentQuestion, (q) => {
  if (!q) return
  userAnswer.value = isChoiceType(q) ? null : q.initialCode ?? ''
  showFeedback.value = false
  lastResult.value = null
  noxHint.value = q.hint ?? '加油，你可以的！'
})

async function validateCode(
  q: Question,
  code: string,
): Promise<{ correct: boolean; errorDetail?: string }> {
  if (q.type === 'code_fill' || q.type === 'code_fix') {
    const { output, error } = await runPython(code)
    if (error) return { correct: false, errorDetail: error }
    if (q.expectedOutput !== undefined) {
      return { correct: output.trim() === q.expectedOutput }
    }
    if (q.correctCode) {
      const { output: expectedOut } = await runPython(q.correctCode)
      return { correct: output.trim() === expectedOut.trim() }
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
): Promise<{ correct: boolean; errorDetail?: string }> {
  for (const test of testCases) {
    const fullCode = `${code}\nprint(${test.input})`
    const { output, error } = await runPython(fullCode)
    if (error) return { correct: false, errorDetail: `测试用例输入 ${test.input} 执行失败：${error}` }
    if (output.trim() !== test.expected) {
      return {
        correct: false,
        errorDetail: `输入 radius=${test.input}：期望 ${test.expected}，实际 ${output.trim()}`,
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

  if (q.type === 'choice' || q.type === 'output_predict') {
    correct = userAnswer.value === q.correctOption
  } else {
    const code = userAnswer.value ?? ''
    const result = await validateCode(q, code)
    correct = result.correct
    errorDetail = result.errorDetail
  }

  store.submitAnswer(q.id, correct)
  lastResult.value = {
    correct,
    explanation: errorDetail
      ? `${q.explanation}\n\n执行结果：${errorDetail}`
      : q.explanation,
    correctAnswer: correct ? undefined : getCorrectAnswer(q),
  }
  showFeedback.value = true
  submitting.value = false
}

function nextQuestion() {
  showFeedback.value = false
  if (isLastQuestion.value) {
    emit('chapterComplete')
  } else {
    currentIndex.value++
  }
}
</script>

<template>
  <div class="flex flex-col flex-1">
    <div v-if="currentQuestion" class="flex-1 flex flex-col">
      <div class="flex items-center justify-between px-4 py-2 border-b border-gray-700">
        <button
          class="text-xs text-gray-400 hover:text-white transition-colors"
          @click="emit('back')"
        >
          ← 返回
        </button>
        <span class="text-xs text-gray-500">
          第 {{ currentIndex + 1 }}/{{ questions.length }} 题
        </span>
      </div>

      <div class="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        <h2 class="text-base font-bold text-white">{{ currentQuestion.title }}</h2>

        <ChoiceQuestion
          v-if="currentQuestion.type === 'choice'"
          :question="currentQuestion"
          :model-value="userAnswer"
          @update:model-value="userAnswer = $event"
        />

        <CodeQuestion
          v-else-if="currentQuestion.type === 'code_fill' || currentQuestion.type === 'code_fix' || currentQuestion.type === 'free_coding'"
          :question="currentQuestion"
          :model-value="userAnswer"
          @update:model-value="userAnswer = $event"
        />

        <OutputPredict
          v-else-if="currentQuestion.type === 'output_predict'"
          :question="currentQuestion"
          :model-value="userAnswer"
          @update:model-value="userAnswer = $event"
        />

        <NoxDialog :message="noxHint" />
      </div>

      <FeedbackToast
        v-if="showFeedback"
        :visible="showFeedback"
        :correct="lastResult?.correct ?? false"
        :explanation="lastResult?.explanation ?? ''"
        :correct-answer="lastResult?.correctAnswer"
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
  </div>
</template>
