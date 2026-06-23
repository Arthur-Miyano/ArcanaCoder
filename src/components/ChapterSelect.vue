<script setup lang="ts">
import { ref } from 'vue'
import { useGameStore } from '@/stores/gameStore'
import { chapters, questions } from '@/data/questions'
import GameHeader from './GameHeader.vue'

const emit = defineEmits<{
  selectChapter: [chapterId: string]
}>()

const store = useGameStore()
const expandedChapter = ref<string | null>(null)

const chapterNames: Record<string, string> = {
  ch1_variables: '语法圣殿',
  ch2_lists: '爬虫山脉',
}

const sectionNames: Record<string, string> = {
  s1_vars: '符文铭刻',
  s1_types: '元素鉴定',
  s1_ops: '术式推演',
  s1_strings: '真言编织',
  s2_lists: '文献采集',
}

const sectionSubs: Record<string, string> = {
  s1_vars: '变量赋值',
  s1_types: '数据类型',
  s1_ops: '运算符与格式化',
  s1_strings: '字符串与输出',
  s2_lists: '列表基础',
}

const runeSymbols = ['◈', '◇', '◉', '✦']

function getTopKnowledge(chapterId: string): { tag: string; mastery: number; symbol: string }[] {
  const ch = chapters.find((c) => c.id === chapterId)
  if (!ch) return []
  const tags = new Map<string, number>()
  for (const sec of ch.sections) {
    for (const qId of sec.questionIds) {
      const q = questions.find((x) => x.id === qId)
      q?.knowledgeTags?.forEach((t) => {
        const m = store.getMastery(t)
        tags.set(t, Math.max(tags.get(t) ?? 0, m))
      })
    }
  }
  return Array.from(tags.entries())
    .map(([tag, mastery], i) => ({ tag, mastery, symbol: runeSymbols[i % runeSymbols.length] }))
    .sort((a, b) => b.mastery - a.mastery)
    .slice(0, 4)
}

function masteryVariant(m: number): string {
  if (m >= 1.0) return 'strong'
  if (m >= 0.7) return 'good'
  return 'weak'
}

function toggleChapter(chapterId: string) {
  if (!isUnlocked(chapterId)) return
  expandedChapter.value = expandedChapter.value === chapterId ? null : chapterId
}

function isUnlocked(chapterId: string): boolean {
  return store.state.unlockedChapters.includes(chapterId)
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
  <div class="flex flex-col flex-1 overflow-hidden">
    <GameHeader
      :level="store.level"
      :exp="store.exp"
      :exp-to-next="store.expToNext"
      :exp-percent="store.expPercent"
    />

    <div class="flex-1 overflow-y-auto px-4 py-6 space-y-6 max-w-lg mx-auto w-full">
      <h1 class="text-lg font-bold text-magic-gold text-center tracking-widest">
        智慧圣殿编年史
      </h1>

      <div v-for="ch in chapters" :key="ch.id" class="space-y-1">
        <!-- 章节卡片 -->
        <div
          class="relative"
          :class="!isUnlocked(ch.id) ? 'opacity-40' : ''"
        >
          <!-- 上卷轴 -->
          <div class="flex items-center justify-center h-6 bg-magic-card border-x-4 border-t-4 border-gray-600 relative">
            <span class="text-xs text-magic-gold tracking-[8px]">✦ ✦ ✦</span>
          </div>

          <!-- 内容区 -->
          <div
            class="border-x-4 border-gray-600 bg-magic-card px-4 py-4 cursor-pointer select-none"
            :class="isUnlocked(ch.id) ? 'hover:bg-magic-card/80' : ''"
            @click="isUnlocked(ch.id) ? toggleChapter(ch.id) : undefined"
          >
            <div class="flex items-center gap-3">
              <div
                class="w-8 h-8 flex items-center justify-center bg-magic-gold border-2 border-magic-gold/60 text-xs font-bold text-black"
              >
                {{ ['I', 'II', 'III', 'IV', 'V'][chapters.indexOf(ch)] || '?' }}
              </div>
              <div class="flex-1">
                <div class="text-sm font-bold" :class="isUnlocked(ch.id) ? 'text-white' : 'text-gray-500'">
                  {{ chapterNames[ch.id] || ch.name }}
                </div>
                <div class="text-xs text-gray-500 mt-0.5">{{ ch.description }}</div>
              </div>
              <div class="text-xs font-mono" :class="isUnlocked(ch.id) ? 'text-magic-gold' : 'text-gray-600'">
                {{ store.getChapterProgress(ch.id).done }}/{{ store.getChapterProgress(ch.id).total }}
              </div>
            </div>
          </div>

          <!-- 下卷轴 -->
          <div class="flex items-center justify-center h-6 bg-magic-card border-x-4 border-b-4 border-gray-600 relative">
            <span class="text-xs text-magic-gold tracking-[8px]">✦ ✦ ✦</span>
          </div>
        </div>

        <!-- 展开区域：节 + 符文卡片 -->
        <div v-if="expandedChapter === ch.id" class="pl-4 space-y-4">
          <div class="border-l-4 border-gray-600 pl-4 space-y-1">
            <button
              v-for="sec in ch.sections"
              :key="sec.id"
              class="w-full flex items-center gap-3 px-3 py-2 border-4 text-left"
              :class="[
                !store.isSectionUnlocked(sec.id, sec.unlockAfter)
                  ? 'border-gray-700 bg-gray-800/20 opacity-40 cursor-not-allowed'
                  : store.getSectionProgress(sec.id).completed
                    ? 'border-green-600/40 bg-green-900/5'
                    : 'border-gray-600 hover:border-gray-500 bg-magic-card/50 cursor-pointer',
              ]"
              :disabled="!store.isSectionUnlocked(sec.id, sec.unlockAfter)"
              @click="startSection(ch.id, sec.id)"
            >
              <div
                class="w-3 h-3 shrink-0"
                :class="
                  !store.isSectionUnlocked(sec.id, sec.unlockAfter)
                    ? 'bg-gray-700'
                    : store.getSectionProgress(sec.id).completed
                      ? 'bg-magic-gold'
                      : 'bg-magic-accent'
                "
              />
              <div class="flex-1 min-w-0">
                <div class="text-xs font-medium" :class="store.isSectionUnlocked(sec.id, sec.unlockAfter) ? 'text-white' : 'text-gray-500'">
                  {{ sectionNames[sec.id] || sec.name }}
                  <span class="text-gray-500">（{{ sectionSubs[sec.id] || '' }}）</span>
                </div>
              </div>
              <span
                v-if="!store.isSectionUnlocked(sec.id, sec.unlockAfter)"
                class="text-gray-600 text-xs shrink-0"
              >
                LOCK
              </span>
              <span
                v-else-if="store.getSectionProgress(sec.id).completed"
                class="text-magic-gold text-xs shrink-0"
              >
                CLEAR
              </span>
              <span
                v-else
                class="text-cyan-400 text-xs shrink-0"
              >
                NOW
              </span>
            </button>
          </div>

          <!-- 奥术法典：2x2 符文卡片 -->
          <div>
            <div class="flex items-center gap-2 mb-2">
              <div class="flex-1 h-px bg-gradient-to-r from-transparent via-magic-gold to-transparent" />
              <span class="text-xs text-magic-gold tracking-widest">ARCANE CODEX</span>
              <div class="flex-1 h-px bg-gradient-to-r from-transparent via-magic-gold to-transparent" />
            </div>

            <div class="grid grid-cols-2 gap-2">
              <div
                v-for="k in getTopKnowledge(ch.id)"
                :key="k.tag"
                class="border-4 px-3 py-2 relative overflow-hidden"
                :class="
                  masteryVariant(k.mastery) === 'strong' ? 'border-magic-gold/60' :
                  masteryVariant(k.mastery) === 'good' ? 'border-cyan-500/60' :
                  'border-gray-500/40'
                "
              >
                <div class="flex items-center justify-between mb-1">
                  <span
                    class="text-lg"
                    :class="
                      masteryVariant(k.mastery) === 'strong' ? 'text-magic-gold' :
                      masteryVariant(k.mastery) === 'good' ? 'text-cyan-400' :
                      'text-gray-500'
                    "
                  >
                    {{ k.symbol }}
                  </span>
                  <span class="text-xs text-gray-400">{{ k.tag }}</span>
                </div>
                <div class="h-2 bg-gray-800 border-2 border-gray-700">
                  <div
                    class="h-full transition-all"
                    :class="
                      masteryVariant(k.mastery) === 'strong' ? 'bg-magic-gold shadow-[0_0_6px_rgba(255,215,0,0.5)]' :
                      masteryVariant(k.mastery) === 'good' ? 'bg-cyan-400 shadow-[0_0_6px_rgba(77,238,234,0.3)]' :
                      'bg-gray-500'
                    "
                    :style="{ width: `${Math.max(k.mastery * 100, 5)}%` }"
                  />
                </div>
                <div
                  class="text-xs text-right mt-0.5 font-mono"
                  :class="
                    masteryVariant(k.mastery) === 'strong' ? 'text-magic-gold' :
                    masteryVariant(k.mastery) === 'good' ? 'text-cyan-400' :
                    'text-gray-500'
                  "
                >
                  {{ Math.round(k.mastery * 100) }}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 世界地图（底部） -->
    <div class="border-t-4 border-gray-600 bg-magic-card/90 px-4 py-3 shrink-0">
      <div class="text-xs text-gray-500 text-center tracking-widest mb-2 font-mono">AETHERIA</div>
      <div class="flex items-center justify-center gap-1 max-w-md mx-auto">
        <div v-for="(region, i) in ['语法圣殿', '爬虫山脉', '后端城', '数据库森林', '前端海岸']" :key="region" class="flex items-center gap-1">
          <div
            class="flex flex-col items-center"
            :class="i <= store.state.unlockedChapters.length - 1 ? 'opacity-100' : 'opacity-30'"
          >
            <div
              class="w-8 h-8 flex items-center justify-center text-xs font-bold"
              :class="i < store.state.unlockedChapters.length - 1 ? 'bg-magic-gold text-black border-2 border-magic-gold/60' : i === store.state.unlockedChapters.length - 1 ? 'bg-cyan-400/30 text-cyan-400 border-2 border-cyan-500/60' : 'bg-gray-800 text-gray-600 border-2 border-gray-700'"
            >
              {{ ['S', 'S', 'B', 'D', 'F'][i] || '?' }}
            </div>
            <span class="text-[9px] mt-0.5 text-center leading-tight" :class="i <= store.state.unlockedChapters.length - 1 ? 'text-gray-400' : 'text-gray-600'">
              {{ region.replace('圣殿', '').replace('山脉', '').replace('城', '').replace('森林', '').replace('海岸', '') }}
            </span>
          </div>
          <div v-if="i < 4" class="w-4 h-px" :class="i < store.state.unlockedChapters.length - 1 ? 'bg-magic-gold' : 'bg-gray-700'" />
        </div>
      </div>
    </div>
  </div>
</template>
