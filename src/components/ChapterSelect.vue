<script setup lang="ts">
import { useGameStore } from '@/stores/gameStore'
import { chapters } from '@/data/questions'
import GameHeader from './GameHeader.vue'

const emit = defineEmits<{
  selectChapter: [chapterId: string]
}>()

const store = useGameStore()

function startChapter(chapterId: string) {
  store.selectChapter(chapterId)
  emit('selectChapter', chapterId)
}
</script>

<template>
  <div class="flex flex-col flex-1">
    <GameHeader
      :level="store.level"
      :exp="store.exp"
      :exp-to-next="store.expToNext"
      :exp-percent="store.expPercent"
    />

    <div class="flex-1 overflow-y-auto px-4 py-6">
      <h1 class="text-lg font-bold text-magic-gold text-center mb-6">
        选择关卡
      </h1>

      <div class="space-y-3 max-w-md mx-auto">
        <button
          v-for="ch in chapters"
          :key="ch.id"
          class="w-full flex items-center gap-4 px-4 py-3 rounded-lg border transition-colors text-left"
          :class="[
            store.getChapterProgress(ch.id).completed
              ? 'border-green-600/50 bg-green-900/10'
              : 'border-gray-600 hover:border-gray-500 bg-magic-card',
          ]"
          @click="startChapter(ch.id)"
        >
          <div
            class="w-4 h-4 shrink-0"
            :class="
              store.getChapterProgress(ch.id).completed
                ? 'bg-green-500'
                : 'bg-gray-600'
            "
          />

          <div class="flex-1 min-w-0">
            <div class="text-sm font-medium text-white">{{ ch.name }}</div>
            <div class="text-xs text-gray-400 mt-0.5">{{ ch.description }}</div>
          </div>

          <span
            v-if="store.getChapterProgress(ch.id).completed"
            class="text-green-400 text-xs shrink-0"
          >
            ✓ 已完成
          </span>
        </button>
      </div>
    </div>
  </div>
</template>
