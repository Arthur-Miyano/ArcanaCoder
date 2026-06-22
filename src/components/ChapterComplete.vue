<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useGameStore } from '@/stores/gameStore'
import { getQuestionsByChapter } from '@/data/questions'
import GameHeader from './GameHeader.vue'

const props = defineProps<{
  chapterId: string
}>()

const emit = defineEmits<{ backToChapters: [] }>()

const store = useGameStore()
const visible = ref(false)

const questions = computed(() => getQuestionsByChapter(props.chapterId))
const accuracy = computed(() => store.getChapterAccuracy(props.chapterId))

const passed = computed(() => accuracy.value.wrongIds.length === 0)

onMounted(() => {
  setTimeout(() => { visible.value = true }, 100)
})
</script>

<template>
  <div class="flex flex-col flex-1">
    <GameHeader
      :level="store.level"
      :exp="store.exp"
      :exp-to-next="store.expToNext"
      :exp-percent="store.expPercent"
    />

    <div class="flex-1 flex flex-col items-center justify-center px-6 text-center">
      <Transition
        enter-active-class="transition-all duration-500"
        enter-from-class="opacity-0 scale-75"
      >
        <div v-if="visible" class="space-y-4 w-full max-w-sm">
          <div
            class="w-12 h-12 mx-auto rounded-full bg-[#4B0082] border-2 border-[#c9a227]"
          />

          <h1 class="text-xl font-bold" :class="passed ? 'text-magic-gold' : 'text-gray-300'">
            {{ passed ? '关卡通过！' : '关卡完成' }}
          </h1>

          <div class="bg-magic-card border border-gray-600 rounded-lg px-4 py-4 text-left space-y-2">
            <div>
              <span class="text-xs text-gray-400">试炼结果</span>
              <div class="mt-1 flex items-center gap-2">
                <div class="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    class="h-full rounded-full transition-all duration-500"
                    :class="passed ? 'bg-green-500' : 'bg-yellow-500'"
                    :style="{ width: `${(accuracy.correct / accuracy.total) * 100}%` }"
                  />
                </div>
                <span class="text-sm text-gray-300 shrink-0">
                  {{ accuracy.correct }}/{{ accuracy.total }}
                </span>
              </div>
            </div>

            <div v-if="accuracy.wrongIds.length > 0" class="pt-1">
              <p class="text-xs text-red-400 mb-1">波动不稳的试炼：{{ accuracy.wrongIds.length }} 道</p>
              <div v-if="accuracy.knowledgeTags.length > 0" class="flex flex-wrap gap-1">
                <span
                  v-for="tag in accuracy.knowledgeTags"
                  :key="tag"
                  class="px-2 py-0.5 rounded bg-red-900/20 border border-red-800/30 text-xs text-red-300"
                >
                  {{ tag }}
                </span>
              </div>
            </div>

            <div v-else>
              <p class="text-xs text-green-400">全部魔力共鸣，法则已刻入灵魂！</p>
            </div>
          </div>

          <div class="pt-4">
            <button
              class="px-6 py-2.5 rounded font-medium bg-[#4B0082] hover:bg-[#5a0099] text-white transition-colors"
              @click="emit('backToChapters')"
            >
              返回关卡选择
            </button>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>
