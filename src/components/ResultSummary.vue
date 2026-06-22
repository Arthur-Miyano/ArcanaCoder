<script setup lang="ts">
defineProps<{
  title: string
  correct: number
  total: number
  wrongIds: string[]
  knowledgeTags?: string[]
}>()

defineEmits<{
  retry: [questionId: string]
  review: []
  done: []
}>()
</script>

<template>
  <div class="text-center">
    <div class="w-12 h-12 mx-auto rounded-full bg-magic-accent border-2 border-magic-gold mb-3" />
    <h2 class="text-lg font-bold text-magic-gold">{{ title }}</h2>
    <p class="text-sm text-gray-400 mt-1">{{ correct }}/{{ total }} 魔力共鸣</p>
    <div class="mt-3 h-2 bg-gray-700 rounded-full overflow-hidden">
      <div
        class="h-full rounded-full transition-all duration-500"
        :class="wrongIds.length === 0 ? 'bg-green-500' : 'bg-yellow-500'"
        :style="{ width: `${(correct / total) * 100}%` }"
      />
    </div>
  </div>

  <div v-if="wrongIds.length > 0" class="space-y-2">
    <p class="text-xs text-gray-400">需要重新施展的试炼：</p>
    <button
      v-for="(qId, i) in wrongIds"
      :key="qId"
      class="w-full text-left px-3 py-2 rounded border border-red-800/50 bg-red-900/20 text-sm text-red-200"
      @click="$emit('retry', qId)"
    >
      ✗ 第{{ i + 1 }}题
    </button>
  </div>

  <div v-if="wrongIds.length === 0">
    <p class="text-xs text-green-400">全部魔力共鸣，继续前进吧，贤者。</p>
  </div>

  <div v-if="knowledgeTags && knowledgeTags.length > 0" class="mt-4">
    <p class="text-xs text-gray-400 mb-1">建议复习的知识点：</p>
    <div class="flex flex-wrap gap-1.5">
      <span
        v-for="tag in knowledgeTags"
        :key="tag"
        class="px-2 py-0.5 rounded bg-magic-card border border-gray-600 text-xs text-gray-300"
      >
        {{ tag }}
      </span>
    </div>
    <button
      class="mt-3 text-xs text-magic-gold hover:text-yellow-300 transition-colors"
      @click="$emit('review')"
    >
      ← 打开智慧之书复习
    </button>
  </div>
</template>
