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
  <div class="space-y-2.5">
    <p class="text-mist-100 font-medium mb-3 leading-relaxed">{{ question.description }}</p>
    <button
      v-for="(opt, i) in question.options"
      :key="i"
      :data-testid="'choice-option-' + i"
      type="button"
      class="choice-card group flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left transition-all duration-300 ease-out sm:px-5"
      :class="
        modelValue === i
          ? 'border-arcane-400/80 bg-gradient-to-r from-arcane-600/30 via-arcane-500/15 to-transparent text-mist-100 shadow-glow-arcane'
          : 'border-arcane-500/30 bg-abyss-700/50 text-mist-200 backdrop-blur-sm hover:-translate-y-0.5 hover:border-arcane-400/60 hover:bg-abyss-700/70 hover:text-mist-100 hover:shadow-glow-arcane'
      "
      @click="select(i)"
    >
      <span
        class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border font-mono text-[11px] leading-none transition-all duration-300"
        :class="
          modelValue === i
            ? 'border-arcane-300 bg-gradient-to-br from-arcane-400 to-arcane-600 text-white shadow-glow-arcane'
            : 'border-mist-500/40 text-mist-400 group-hover:border-arcane-400/60 group-hover:text-arcane-300'
        "
      >
        {{ 'ABCD'[i] ?? i + 1 }}
      </span>
      <span class="whitespace-pre-wrap leading-relaxed">{{ opt }}</span>
    </button>
  </div>
</template>

<style scoped>
.choice-card {
  position: relative;
  overflow: hidden;
}

/* 选中卡片：星紫渐变描边光晕 */
.choice-card.border-arcane-400\/80::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1px;
  background: linear-gradient(120deg, rgba(124, 106, 255, 0.9), rgba(124, 106, 255, 0.15) 55%, rgba(212, 175, 55, 0.35));
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
}
</style>
