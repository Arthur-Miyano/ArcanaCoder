<script setup lang="ts">
import { chapters } from '@/data/questions'
import type { Chapter } from '@/types'

const props = defineProps<{
  chapterId: string
}>()

const emit = defineEmits<{
  start: []
  back: []
}>()

const chapter = chapters.find((c) => c.id === props.chapterId) as Chapter | undefined
</script>

<template>
  <div v-if="chapter" class="flex flex-col flex-1">
    <div class="flex items-center px-4 py-2 border-b border-gray-700">
      <button
        class="text-xs text-gray-400 hover:text-white transition-colors"
        @click="emit('back')"
      >
        ← 返回
      </button>
    </div>

    <div class="flex-1 flex flex-col items-center justify-center px-6 py-8">
      <div
        class="w-10 h-10 rounded-full bg-[#4B0082] border-2 border-[#c9a227] mb-4"
      />

      <p class="text-sm text-gray-400 mb-6">
        贤者从智慧之书中获得了新知识...
      </p>

      <div class="w-full max-w-md bg-magic-card border border-gray-600 rounded-lg p-5">
        <h2 class="text-base font-bold text-magic-gold text-center mb-1">
          📖 智慧之书
        </h2>
        <p class="text-xs text-gray-500 text-center mb-4">{{ chapter.name }}</p>

        <ul class="space-y-3">
          <li
            v-for="(item, i) in chapter.knowledge"
            :key="i"
            class="flex gap-3 text-sm text-gray-200 leading-relaxed"
          >
            <span class="text-magic-gold shrink-0 mt-0.5">✦</span>
            <span>{{ item }}</span>
          </li>
        </ul>

        <button
          class="w-full mt-6 py-2.5 rounded font-medium bg-[#4B0082] hover:bg-[#5a0099] text-white transition-colors"
          @click="emit('start')"
        >
          开始试炼
        </button>
      </div>
    </div>
  </div>
</template>
