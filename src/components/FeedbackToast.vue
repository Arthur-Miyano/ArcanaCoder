<script setup lang="ts">
defineProps<{
  visible: boolean
  correct: boolean
  explanation: string
  correctAnswer?: string
}>()

const emit = defineEmits<{ next: [] }>()
</script>

<template>
  <div v-if="visible" class="px-4 pb-3">
    <div
      :class="[
        'rounded-lg border px-4 py-3',
        correct
          ? 'bg-green-900/80 border-green-600'
          : 'bg-red-900/80 border-red-600',
      ]"
    >
      <div class="flex items-center gap-2 mb-2">
        <span
          :class="[
            'text-base font-bold',
            correct ? 'text-green-300' : 'text-red-300',
          ]"
        >
          {{ correct ? '✓ 正确!' : '✗ 答错了' }}
        </span>
      </div>

      <div
        v-if="correctAnswer && !correct"
        class="mb-2 p-2 bg-gray-900/60 rounded font-mono text-xs text-green-200 whitespace-pre-wrap"
      >
        <span class="text-gray-400 text-xs block mb-1">正确答案：</span>
        {{ correctAnswer }}
      </div>

      <p class="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">{{ explanation }}</p>
      <button
        class="mt-3 px-4 py-1.5 rounded text-sm font-medium transition-colors bg-gray-600 hover:bg-gray-500 text-white"
        @click="emit('next')"
      >
        下一题
      </button>
    </div>
  </div>
</template>
