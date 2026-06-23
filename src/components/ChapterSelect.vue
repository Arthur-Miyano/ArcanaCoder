<script setup lang="ts">
import { ref, computed } from 'vue'
import { useGameStore } from '@/stores/gameStore'
import { chapters, questions } from '@/data/questions'
import GameHeader from './GameHeader.vue'

const emit = defineEmits<{
  selectChapter: [chapterId: string]
}>()

const store = useGameStore()
const expandedChapter = ref<string | null>(null)

function getChapterKnowledge(chapterId: string): { tag: string; mastery: number }[] {
  const ch = chapters.find((c) => c.id === chapterId)
  if (!ch) return []
  const tags = new Map<string, number>()
  for (const sec of ch.sections) {
    for (const qId of sec.questionIds) {
      const q = questions.find((x) => x.id === qId)
      q?.knowledgeTags?.forEach((t) => {
        const m = store.getMastery(t)
        if (m > 0) tags.set(t, Math.max(tags.get(t) ?? 0, m))
        else if (!tags.has(t)) tags.set(t, 0)
      })
    }
  }
  return Array.from(tags.entries()).map(([tag, mastery]) => ({ tag, mastery }))
}

function masteryClass(m: number): string {
  if (m >= 1.0) return 'text-magic-gold'
  if (m >= 0.7) return 'text-cyan-400'
  return 'text-red-400'
}

function masteryBarClass(m: number): string {
  if (m >= 1.0) return 'bg-magic-gold'
  if (m >= 0.7) return 'bg-cyan-400'
  return 'bg-red-400'
}

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
  const ch = chapters.find((c) => c.id === chapterId)
  const sec = ch?.sections.find((s) => s.id === sectionId)
  if (!sec || !store.isSectionUnlocked(sectionId, sec.unlockAfter)) return
  store.selectChapter(chapterId)
  emit('selectChapter', chapterId)
  store.selectSection(sectionId)
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
                      : 'bg-magic-accent'
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

          <!-- 掌握度 (knowledge mastery) -->
          <div v-if="expandedChapter === ch.id" class="ml-6 mt-3 space-y-1.5">
            <div class="text-xs text-gray-500 mb-1">知识掌握度</div>
            <div
              v-for="k in getChapterKnowledge(ch.id)"
              :key="k.tag"
              class="flex items-center gap-2 text-xs"
            >
              <span class="text-gray-400 w-16 truncate shrink-0">{{ k.tag }}</span>
              <div class="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <div
                  class="h-full rounded-full transition-all"
                  :class="masteryBarClass(k.mastery)"
                  :style="{ width: `${k.mastery * 100}%` }"
                />
              </div>
              <span class="w-8 text-right shrink-0" :class="masteryClass(k.mastery)">
                {{ Math.round(k.mastery * 100) }}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
