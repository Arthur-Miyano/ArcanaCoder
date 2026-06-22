<script setup lang="ts">
import { ref, computed } from 'vue'
import { Codemirror } from 'vue-codemirror'
import { python } from '@codemirror/lang-python'
import { oneDark } from '@codemirror/theme-one-dark'
import { runPython } from '@/services/pyodide'
import type { Question } from '@/types'

const props = defineProps<{
  question: Question
  modelValue: number | null
}>()

const emit = defineEmits<{
  'update:model-value': [value: number]
}>()

const actualOutput = ref<string | null>(null)
const verifying = ref(false)
const verified = ref(false)

const extensions = computed(() => [python(), oneDark])

async function verify() {
  verifying.value = true
  const code = props.question.initialCode ?? ''
  const { output, error } = await runPython(code)
  actualOutput.value = error || output || '(无输出)'
  verifying.value = false
  verified.value = true
}

function select(index: number) {
  emit('update:model-value', index)
}
</script>

<template>
  <div>
    <p class="text-sm text-gray-300 mb-3">{{ question.description }}</p>

    <div class="border border-gray-600 rounded-lg overflow-hidden mb-4">
      <Codemirror
        :model-value="question.initialCode ?? ''"
        :extensions="extensions"
        :disabled="true"
        :style="{ height: 'auto', minHeight: '80px' }"
      />
    </div>

    <div class="space-y-2 mb-4">
      <p class="text-xs text-gray-400 mb-1">选择你认为正确的输出：</p>
      <button
        v-for="(opt, i) in question.options"
        :key="i"
        class="w-full text-left px-4 py-2 rounded border transition-colors text-sm"
        :class="
          modelValue === i
            ? 'border-[#4B0082] bg-[#4B0082]/20 text-white'
            : 'border-gray-600 text-gray-300 hover:border-gray-500'
        "
        @click="select(i)"
      >
        <span class="mr-2">{{ modelValue === i ? '●' : '○' }}</span>
        {{ opt }}
      </button>
    </div>

    <button
      class="text-xs text-gray-400 hover:text-magic-gold transition-colors"
      :disabled="verifying"
      @click="verify"
    >
      {{ verifying ? '运行中...' : verified ? '再次运行验证' : '▶ 运行验证' }}
    </button>

    <div
      v-if="actualOutput !== null"
      class="mt-2 px-3 py-2 bg-gray-800 border border-gray-600 rounded text-sm font-mono text-green-300"
    >
      {{ actualOutput }}
    </div>
  </div>
</template>
