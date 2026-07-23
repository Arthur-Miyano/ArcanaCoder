<script setup lang="ts">
import { ref, computed } from 'vue'
import { Codemirror } from 'vue-codemirror'
import { pythonExtensions } from '@/composables/useCodeMirror'
import { usePythonRunner } from '@/composables/usePythonRunner'
import type { Question } from '@/types'

const props = defineProps<{
  question: Question
  modelValue: number | null
}>()

const emit = defineEmits<{
  'update:model-value': [value: number]
}>()

const { output, error, running, run } = usePythonRunner()
const verified = ref(false)

const actualOutput = computed(() => error.value || output.value || '(无输出)')

async function verify(): Promise<void> {
  const code = props.question.initialCode ?? ''
  await run(code)
  verified.value = true
}

function select(index: number) {
  emit('update:model-value', index)
}
</script>

<template>
  <div>
    <p class="mb-3 text-mist-100 font-medium whitespace-pre-wrap">{{ question.description }}</p>

    <!-- 符文代码面板：等宽字体深色面板 -->
    <div class="mb-4 overflow-hidden rounded-xl border border-arcane-500/20 bg-abyss-900/80 shadow-card">
      <div class="flex items-center gap-1.5 border-b border-arcane-500/15 bg-abyss-850/80 px-4 py-2">
        <span class="h-2 w-2 rounded-full bg-arcane-500/70"></span>
        <span class="h-2 w-2 rounded-full bg-gold-500/70"></span>
        <span class="h-2 w-2 rounded-full bg-mist-500/50"></span>
        <span class="ml-2 font-mono text-xs text-mist-400">✦ spell.py</span>
      </div>
      <div class="font-mono">
        <Codemirror
          :model-value="question.initialCode ?? ''"
          :extensions="pythonExtensions"
          :disabled="true"
          :style="{ height: 'auto', minHeight: '80px' }"
        />
      </div>
    </div>

    <div class="mb-4 space-y-2">
      <p class="mb-1 text-sm text-mist-300">选择你认为正确的输出：</p>
      <button
        v-for="(opt, i) in question.options"
        :key="i"
        :data-testid="'choice-option-' + i"
        class="w-full rounded-xl border px-4 py-2.5 text-left transition-all duration-300"
        :class="
          modelValue === i
            ? 'border-arcane-400/70 bg-arcane-500/15 text-mist-100 shadow-glow-arcane'
            : 'border-arcane-500/30 bg-abyss-700/50 text-mist-200 hover:border-arcane-400/60 hover:bg-arcane-500/10 hover:text-mist-100'
        "
        @click="select(i)"
      >
        <span
          class="mr-2 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md border font-mono text-[11px] align-middle"
          :class="modelValue === i ? 'border-arcane-300 bg-gradient-to-br from-arcane-400 to-arcane-600 text-white' : 'border-mist-500/40 text-mist-400'"
        >{{ 'ABCD'[i] ?? i + 1 }}</span>
        <span class="whitespace-pre-wrap">{{ opt }}</span>
      </button>
    </div>

    <button
      class="btn-ghost px-4 py-1.5 text-xs"
      :disabled="running"
      @click="verify"
    >
      {{ running ? '运行中...' : verified ? '再次运行验证' : '▶ 运行验证' }}
    </button>

    <div
      v-if="verified"
      class="mt-3 animate-fade-in rounded-xl border border-gold-500/25 bg-abyss-900/80 px-4 py-2.5"
    >
      <p class="mb-1 text-xs text-mist-400">✧ 实际输出</p>
      <p class="whitespace-pre-wrap font-mono text-sm text-gold-300">{{ actualOutput }}</p>
    </div>
  </div>
</template>
