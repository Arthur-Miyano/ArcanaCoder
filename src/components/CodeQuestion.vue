<script setup lang="ts">
import { computed } from 'vue'
import { Codemirror } from 'vue-codemirror'
import { pythonExtensions } from '@/composables/useCodeMirror'
import type { Question } from '@/types'

const props = defineProps<{
  question: Question
  modelValue: string
  readonly?: boolean
}>()

const emit = defineEmits<{
  'update:model-value': [value: string]
}>()

const lineCount = computed(() => {
  if (!props.modelValue) return 3
  return Math.max(3, props.modelValue.split('\n').length)
})
</script>

<template>
  <div class="animate-fade-up">
    <div class="flex items-start gap-2 mb-4">
      <span class="mt-1 text-arcane-400 text-sm leading-none select-none animate-twinkle" aria-hidden="true">✦</span>
      <p class="font-body text-mist-200 leading-relaxed whitespace-pre-wrap">{{ question.description }}</p>
    </div>
    <div
      class="code-frame rounded-xl overflow-hidden transition-all duration-300"
      :class="readonly ? 'opacity-80 saturate-75' : 'hover:shadow-glow-arcane'"
    >
      <Codemirror
        :model-value="modelValue"
        :extensions="pythonExtensions"
        :disabled="readonly"
        :style="{ minHeight: `${Math.min(Math.max(lineCount, 8), 20) * 1.4 + 1}em` }"
        @update:model-value="emit('update:model-value', $event)"
      />
    </div>
  </div>
</template>

<style scoped>
.code-frame {
  /* 编辑器本体的描边/圆角/聚焦发光由 main.css 的 .cm-editor 全局样式负责，
     这里只叠加一层星紫微光氛围 */
  box-shadow: 0 0 0 1px rgba(124, 106, 255, 0.08), 0 12px 32px -16px rgba(0, 0, 0, 0.7);
}
</style>
