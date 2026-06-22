<script setup lang="ts">
import { computed } from 'vue'
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
  'update:modelValue': [value: string]
}>()

const extensions = computed(() => [python(), oneDark])
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
        :style="{ height: '200px' }"
        @update:model-value="emit('update:modelValue', $event)"
      />
    </div>
  </div>
</template>
