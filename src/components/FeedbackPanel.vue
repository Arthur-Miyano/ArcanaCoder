<script setup lang="ts">
import { ref, computed } from 'vue'
import { Codemirror } from 'vue-codemirror'
import { python } from '@codemirror/lang-python'
import { oneDark } from '@codemirror/theme-one-dark'
import type { Question } from '@/types'
import {
  parsePythonError,
  findErrorLines,
  getNoxExplanation,
} from '@/utils/errorParser'
import type { DiffResult } from '@/utils/diff'
import type { CodeHint } from '@/utils/codeValidator'

const props = defineProps<{
  correct: boolean
  explanation: string
  correctAnswer: string | undefined
  errorDetail: string | undefined
  diff: DiffResult | undefined
  codeHints: CodeHint[] | undefined
  question: Question
  userCode: string | undefined
}>()

const emit = defineEmits<{ next: [] }>()

const extensions = [python(), oneDark]
const showTraceback = ref(false)

const parsedError = computed(() => {
  if (props.errorDetail) return parsePythonError(props.errorDetail)
  return null
})

const errorLines = computed(() => {
  if (!props.userCode || !props.question.correctCode) return []
  return findErrorLines(
    props.userCode,
    props.question.correctCode,
    parsedError.value?.lineNumber ?? null,
  )
})

const noxMessage = computed(() => {
  if (parsedError.value) return getNoxExplanation(parsedError.value.type)
  return ''
})
</script>

<template>
  <div class="px-4 pb-3 border-t border-gray-700 pt-3">
    <!-- 正确 -->
    <div v-if="correct" class="rounded-lg border px-4 py-3 bg-green-900 border-green-500">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-base font-bold text-green-300">正确!</span>
      </div>

      <div
        v-if="question.correctCode"
        class="border border-gray-600 rounded-lg overflow-hidden mb-2"
      >
        <Codemirror
          :model-value="question.correctCode"
          :extensions="extensions"
          :disabled="true"
          :style="{ minHeight: '3em' }"
        />
      </div>

      <p class="text-gray-200 leading-relaxed whitespace-pre-wrap">{{ explanation }}</p>

      <div
        class="mt-3 px-3 py-2 bg-magic-card border border-gray-600 rounded text-xs text-gray-400 leading-relaxed"
      >
        <span class="text-gray-500 block mb-0.5">诺克斯的笔记：</span>
        <p class="text-gray-300 whitespace-pre-wrap">{{ question.narrativeExplanation || explanation }}</p>
      </div>

      <button
        class="mt-3 px-4 py-1.5 rounded text-sm font-medium bg-gray-600 hover:bg-gray-500 text-white transition-colors"
        @click="emit('next')"
      >
        下一题
      </button>
    </div>

    <!-- 错误：左右分栏 -->
    <div v-else class="space-y-3">
      <div class="flex flex-col md:flex-row gap-3">
        <!-- 左侧：用户代码 -->
        <div class="flex-1 min-w-0">
          <p class="text-xs text-gray-400 mb-1">你的代码</p>
          <div class="border border-gray-600 rounded-lg overflow-hidden">
            <Codemirror
              :model-value="userCode ?? ''"
              :extensions="extensions"
              :disabled="true"
              :style="{ minHeight: '4em' }"
            />
          </div>

          <div
            v-if="parsedError"
            class="mt-2 px-3 py-2 bg-red-900/50 border border-red-500/50 rounded text-sm font-mono"
          >
            <span class="text-red-300 font-bold">{{ parsedError.chineseType }}</span>
            <p class="text-red-200 text-xs mt-0.5">{{ parsedError.message }}</p>
          </div>

          <div
            v-if="diff && diff.matchType !== 'exact'"
            class="mt-2 px-3 py-2 rounded text-sm"
            :class="diff.matchType === 'format' ? 'bg-yellow-900/30 border border-yellow-600/50' : 'bg-red-900/50 border border-red-500/50'"
          >
            <p class="font-medium mb-1" :class="diff.matchType === 'format' ? 'text-yellow-300' : 'text-red-300'">
              {{ diff.detail }}
            </p>
            <div class="space-y-0.5 text-xs font-mono">
              <div class="text-red-300">你的输出：{{ diff.userOutput }}</div>
              <div class="text-green-300">期望输出：{{ diff.expectedOutput }}</div>
              <div v-for="p in diff.points" :key="p.index" class="text-gray-400">
                第{{ p.index + 1 }}个字符："{{ p.userChar || '(空)' }}" → 应为"{{ p.expectedChar || '(空)' }}"
              </div>
            </div>
          </div>

          <div v-if="codeHints && codeHints.length > 0" class="mt-2 space-y-1">
            <p v-for="(h, i) in codeHints" :key="i" class="text-xs text-yellow-400">
              {{ h.message }}
            </p>
          </div>
        </div>

        <!-- 右侧：正确示范 + 解析 -->
        <div class="flex-1 min-w-0 space-y-3">
          <div v-if="question.correctCode">
            <p class="text-xs text-gray-400 mb-1">正确示范</p>
            <div class="border border-green-600/50 rounded-lg overflow-hidden">
              <Codemirror
                :model-value="question.correctCode"
                :extensions="extensions"
                :disabled="true"
                :style="{ minHeight: '4em' }"
              />
            </div>
          </div>

          <div v-if="errorLines.length > 0">
            <p class="text-xs text-gray-400 mb-1">错误点解析</p>
            <div class="space-y-1">
              <div
                v-for="line in errorLines"
                :key="line.lineNumber"
                class="rounded px-3 py-1.5 text-xs font-mono"
              >
                <div class="text-red-300 line-through mb-0.5">
                  <span class="text-gray-500">第{{ line.lineNumber }}行 </span>
                  {{ line.userLine || '(空)' }}
                </div>
                <div class="text-green-300">
                  <span class="text-gray-500">应为 </span>
                  {{ line.correctLine || '(空)' }}
                </div>
              </div>
            </div>
          </div>

          <div
            class="rounded-lg border border-gray-600 bg-magic-card px-3 py-2.5"
          >
            <div class="flex items-start gap-2">
              <div
                class="w-4 h-4 rounded-full bg-[#FFFAFA] border border-blue-300 shrink-0 mt-0.5"
                title="诺克斯"
              />
              <div>
                <p class="text-xs text-gray-400 mb-0.5">诺克斯说：</p>
                <p class="text-sm text-gray-200 leading-relaxed">{{ noxMessage }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <p class="text-gray-300 leading-relaxed whitespace-pre-wrap">{{ explanation }}</p>

      <div
        v-if="question.narrativeExplanation"
        class="px-3 py-2 bg-magic-card border border-gray-600 rounded text-xs text-gray-400 leading-relaxed"
      >
        <span class="text-gray-500 block mb-0.5">诺克斯的笔记：</span>
        <p class="text-gray-300 whitespace-pre-wrap">{{ question.narrativeExplanation }}</p>
      </div>

      <div v-if="errorDetail">
        <button
          class="text-xs text-gray-500 hover:text-gray-300 transition-colors"
          @click="showTraceback = !showTraceback"
        >
          {{ showTraceback ? '收起' : '查看' }}技术详情
        </button>
        <pre
          v-if="showTraceback"
          class="mt-1 px-3 py-2 bg-gray-900 rounded text-xs text-gray-400 overflow-x-auto font-mono leading-relaxed"
        >{{ errorDetail }}</pre>
      </div>

      <button
        class="w-full py-2.5 rounded font-medium transition-colors bg-[#4B0082] hover:bg-[#5a0099] text-white"
        @click="emit('next')"
      >
        下一题
      </button>
    </div>
  </div>
</template>
