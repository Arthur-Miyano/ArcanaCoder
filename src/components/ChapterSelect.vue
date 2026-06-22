<script setup lang="ts">
import { ref } from 'vue'
import { useGameStore } from '@/stores/gameStore'
import { chapters } from '@/data/questions'
import GameHeader from './GameHeader.vue'

const emit = defineEmits<{
  selectChapter: [chapterId: string]
}>()

const store = useGameStore()
const expandedChapter = ref<string | null>(null)

function toggleChapter(chapterId: string) {
  if (!isUnlocked(chapterId)) return
  expandedChapter.value = expandedChapter.value === chapterId ? null : chapterId
}

function isUnlocked(chapterId: string): boolean {
  return store.state.unlockedChapters.includes(chapterId)
}

function isSectionUnlocked(sectionId: string, unlockAfter?: string): boolean {
  return store.isSectionUnlocked(sectionId, unlockAfter)
}

function startSection(chapterId: string, sectionId: string) {
  if (!isSectionUnlocked(sectionId, undefined)) return
  store.selectChapter(chapterId)
  store.selectSection(sectionId)
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
        <div v-for="ch in chapters" :key="ch.id" class="space-y-1">
          <button
            class="w-full flex items-center gap-4 px-4 py-3 rounded-lg border transition-colors text-left"
            :class="[
              !isUnlocked(ch.id)
                ? 'border-gray-700 bg-gray-800/30 opacity-50 cursor-not-allowed'
                : store.getChapterProgress(ch.id).completed
                  ? 'border-green-600/50 bg-green-900/10'
                  : 'border-gray-600 hover:border-gray-500 bg-magic-card',
            ]"
            :disabled="!isUnlocked(ch.id)"
            @click="toggleChapter(ch.id)"
          >
            <div
              class="w-4 h-4 shrink-0"
              :class="
                !isUnlocked(ch.id)
                  ? 'bg-gray-700'
                  : store.getChapterProgress(ch.id).completed
                    ? 'bg-green-500'
                    : 'bg-gray-600'
              "
            />

            <div class="flex-1 min-w-0">
              <div class="text-sm font-medium" :class="isUnlocked(ch.id) ? 'text-white' : 'text-gray-500'">
                {{ ch.name }}
              </div>
              <div class="text-xs text-gray-400 mt-0.5">{{ ch.description }}</div>
            </div>

            <span
              v-if="!isUnlocked(ch.id)"
              class="text-gray-600 text-xs shrink-0"
            >
              未解锁
            </span>
            <span
              v-else-if="store.getChapterProgress(ch.id).completed"
              class="text-green-400 text-xs shrink-0"
            >
              ✓ 已完成
            </span>
            <span
              v-else
              class="text-gray-400 text-xs shrink-0"
            >
              {{ expandedChapter === ch.id ? '收起' : '展开' }}
            </span>
          </button>

          <!-- 节卡片 -->
          <div
            v-if="expandedChapter === ch.id"
            class="ml-6 space-y-1 border-l-2 border-gray-600 pl-3"
          >
            <button
              v-for="sec in ch.sections"
              :key="sec.id"
              class="w-full flex items-center gap-3 px-3 py-2 rounded border transition-colors text-left"
              :class="[
                !isSectionUnlocked(sec.id, sec.unlockAfter)
                  ? 'border-gray-700 bg-gray-800/20 opacity-40 cursor-not-allowed'
                  : store.getSectionProgress(sec.id).completed
                    ? 'border-green-600/40 bg-green-900/5'
                    : 'border-gray-600 hover:border-gray-500 bg-magic-card/50',
              ]"
              :disabled="!isSectionUnlocked(sec.id, sec.unlockAfter)"
              @click="startSection(ch.id, sec.id)"
            >
              <div
                class="w-3 h-3 shrink-0 rounded-full"
                :class="
                  !isSectionUnlocked(sec.id, sec.unlockAfter)
                    ? 'bg-gray-700'
                    : store.getSectionProgress(sec.id).completed
                      ? 'bg-green-500'
                      : 'bg-[#4B0082]'
                "
              />

              <div class="flex-1 min-w-0">
                <div class="text-xs font-medium" :class="isSectionUnlocked(sec.id, sec.unlockAfter) ? 'text-white' : 'text-gray-500'">
                  {{ sec.name }}
                </div>
                <div class="text-xs text-gray-500">
                  {{ sec.questionIds.length }} 道试炼
                </div>
              </div>

              <span
                v-if="!isSectionUnlocked(sec.id, sec.unlockAfter)"
                class="text-gray-600 text-xs shrink-0"
              >
                未解锁
              </span>
              <span
                v-else-if="store.getSectionProgress(sec.id).completed"
                class="text-green-400 text-xs shrink-0"
              >
                ✓
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
