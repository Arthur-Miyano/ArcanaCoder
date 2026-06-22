<script setup lang="ts">
import type { Question } from '@/types'

const props = defineProps<{
  question: Question
  modelValue: number | null
}>()

const emit = defineEmits<{
  'update:model-value': [value: number]
}>()

function select(index: number) {
  emit('update:model-value', index)
}
</script>

<template>
  <div class="space-y-2">
    <p class="text-sm text-gray-300 mb-3">{{ question.description }}</p>
    <button
      v-for="(opt, i) in question.options"
      :key="i"
      class="w-full text-left px-4 py-2.5 rounded border transition-colors text-sm"
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
</template>
