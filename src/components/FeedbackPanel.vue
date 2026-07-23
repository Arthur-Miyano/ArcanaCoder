<script setup lang="ts">
import { ref, computed } from 'vue'
import { Codemirror } from 'vue-codemirror'
import { pythonExtensions as extensions } from '@/composables/useCodeMirror'
import type { Question } from '@/types'
import { parsePythonError, findErrorLines, getNoxExplanation } from '@/utils/errorParser'
import type { DiffResult } from '@/utils/diff'
import type { CodeHint } from '@/utils/codeValidator'
import NoxDialog from './NoxDialog.vue'

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
  <div class="fixed inset-0 z-[65] flex items-end justify-center">
    <!-- 遮罩：聚焦反馈，不遮挡关闭（必须点下一题） -->
    <div class="absolute inset-0 bg-abyss-950/60 backdrop-blur-[2px] animate-fade-in"></div>

    <div
      data-testid="feedback-panel"
      class="fx-sheet relative w-full sm:max-w-3xl max-h-[62vh] overflow-y-auto
        rounded-t-2xl border border-b-0 border-arcane-500/25 bg-abyss-900/95 backdrop-blur-md
        shadow-card-hover px-4 pb-4 pt-4 sm:px-5"
    >
    <!-- 魔力共鸣 -->
    <div
      v-if="correct"
      class="animate-scale-in rounded-2xl border border-gold-500/30 bg-gradient-to-br from-gold-500/10 via-abyss-850/80 to-abyss-900/70 px-4 py-4 shadow-glow-gold"
    >
      <div class="flex items-center gap-2 mb-2">
        <span class="text-gold-400 text-sm">✦</span>
        <span class="text-base font-bold font-display text-gold-300 text-glow-gold">魔力共鸣!</span>
        <span class="text-gold-400 text-sm">✦</span>
      </div>

      <div
        v-if="question.correctCode"
        class="border border-gold-500/25 rounded-xl overflow-hidden mb-2 shadow-card"
      >
        <Codemirror
          :model-value="question.correctCode"
          :extensions="extensions"
          :disabled="true"
          :style="{ minHeight: '3em' }"
        />
      </div>

      <p class="text-mist-200 leading-relaxed whitespace-pre-wrap">{{ explanation }}</p>

      <div class="mt-3 arc-card px-3 py-2 text-xs text-mist-400 leading-relaxed">
        <span class="text-gold-400/90 block mb-0.5">✧ 诺克斯的笔记：</span>
        <p class="text-mist-300 whitespace-pre-wrap">{{ question.narrativeExplanation || explanation }}</p>
      </div>

      <button
        data-testid="btn-next"
        class="btn-gold shine-sweep mt-4 text-sm"
        @click="emit('next')"
      >
        下一道试炼
      </button>
    </div>

    <!-- 咒语波动不稳 -->
    <div v-else class="space-y-3 animate-fade-up">
      <div class="flex flex-col md:flex-row gap-3">
        <!-- 左侧：用户的源语 -->
        <div class="flex-1 min-w-0">
          <p class="text-xs text-mist-400 mb-1">你的源语</p>
          <div class="border border-red-500/25 rounded-xl overflow-hidden">
            <Codemirror
              :model-value="userCode ?? ''"
              :extensions="extensions"
              :disabled="true"
              :style="{ minHeight: '4em' }"
            />
          </div>

          <div
            v-if="parsedError"
            class="mt-2 px-3 py-2 rounded-xl bg-red-950/40 border border-red-500/30 backdrop-blur-sm text-sm font-mono"
          >
            <span class="text-red-300 font-bold">{{ parsedError.chineseType }}</span>
            <p class="text-red-200/80 text-xs mt-0.5">{{ parsedError.message }}</p>
          </div>

          <div
            v-if="diff && diff.matchType !== 'exact'"
            class="mt-2 px-3 py-2 rounded-xl text-sm border"
            :class="diff.matchType === 'format' ? 'bg-gold-500/10 border-gold-500/30' : 'bg-red-950/40 border-red-500/30'"
          >
            <p class="font-medium mb-1" :class="diff.matchType === 'format' ? 'text-gold-300' : 'text-red-300'">
              {{ diff.detail }}
            </p>
            <div class="space-y-0.5 text-xs font-mono">
              <div class="text-red-300">你的输出：{{ diff.userOutput }}</div>
              <div class="text-green-300">期望输出：{{ diff.expectedOutput }}</div>
              <div v-for="p in diff.points" :key="p.index" class="text-mist-400">
                第{{ p.index + 1 }}个字符："{{ p.userChar || '(空)' }}" → 应为"{{ p.expectedChar || '(空)' }}"
              </div>
            </div>
          </div>

          <div v-if="codeHints && codeHints.length > 0" class="mt-2 space-y-1">
            <p v-for="(h, i) in codeHints" :key="i" class="text-xs text-gold-300/90">
              {{ h.message }}
            </p>
          </div>
        </div>

        <!-- 右侧：法阵参考 + 解析 -->
        <div class="flex-1 min-w-0 space-y-3">
          <div v-if="question.correctCode">
            <p class="text-xs text-mist-400 mb-1">法阵参考</p>
            <div class="border border-arcane-400/30 rounded-xl overflow-hidden shadow-card">
              <Codemirror
                :model-value="question.correctCode"
                :extensions="extensions"
                :disabled="true"
                :style="{ minHeight: '4em' }"
              />
            </div>
          </div>

          <div v-if="errorLines.length > 0">
            <p class="text-xs text-mist-400 mb-1">波动溯源</p>
            <div class="space-y-1">
              <div
                v-for="line in errorLines"
                :key="line.lineNumber"
                class="rounded-lg bg-abyss-800/60 border border-red-500/15 px-3 py-1.5 text-xs font-mono"
              >
                <div class="text-red-300 line-through mb-0.5">
                  <span class="text-mist-500">第{{ line.lineNumber }}行 </span>
                  {{ line.userLine || '(空)' }}
                </div>
                <div class="text-green-300">
                  <span class="text-mist-500">应为 </span>
                  {{ line.correctLine || '(空)' }}
                </div>
              </div>
            </div>
          </div>

          <NoxDialog :message="noxMessage" />
        </div>
      </div>

      <p class="text-mist-300 leading-relaxed whitespace-pre-wrap">{{ explanation }}</p>

      <div
        v-if="question.narrativeExplanation"
        class="arc-card px-3 py-2 text-xs text-mist-400 leading-relaxed"
      >
        <span class="text-gold-400/90 block mb-0.5">✧ 诺克斯的笔记：</span>
        <p class="text-mist-300 whitespace-pre-wrap">{{ question.narrativeExplanation }}</p>
      </div>

      <div v-if="errorDetail">
        <button
          class="text-xs text-mist-500 hover:text-arcane-300 transition-colors"
          @click="showTraceback = !showTraceback"
        >
          {{ showTraceback ? '收起' : '查看' }}技术详情
        </button>
        <pre
          v-if="showTraceback"
          class="mt-1 px-3 py-2 bg-abyss-900/80 border border-arcane-500/15 rounded-lg text-xs text-mist-400 overflow-x-auto font-mono leading-relaxed"
        >{{ errorDetail }}</pre>
      </div>

      <button
        data-testid="btn-next"
        class="btn-arc shine-sweep w-full"
        @click="emit('next')"
      >
        下一道试炼
      </button>
    </div>
    </div>
  </div>
</template>
