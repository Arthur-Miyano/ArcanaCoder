<script setup lang="ts">
import { computed, ref, onMounted, nextTick } from 'vue'
import { Codemirror } from 'vue-codemirror'
import { python } from '@codemirror/lang-python'
import { oneDark } from '@codemirror/theme-one-dark'
import type { Question } from '@/types'

const props = defineProps<{
  question: Question
  modelValue: string
  readonly?: boolean
}>()

const emit = defineEmits<{
  'update:model-value': [value: string]
}>()

const extensions = computed(() => [python(), oneDark])

const lineCount = computed(() => {
  if (!props.modelValue) return 3
  return Math.max(3, props.modelValue.split('\n').length)
})
</script>

<template>
  <div>
    <p class="text-sm text-gray-300 mb-3 whitespace-pre-wrap">{{ question.description }}</p>
    <div
      class="border border-gray-600 rounded-lg overflow-hidden"
      :class="readonly ? 'opacity-80' : ''"
    >
      <Codemirror
        :model-value="modelValue"
        :extensions="extensions"
        :disabled="readonly"
        :style="{ minHeight: `${Math.min(lineCount, 16) * 1.4 + 1}em` }"
        @update:model-value="emit('update:model-value', $event)"
      />
    </div>
  </div>
</template>
