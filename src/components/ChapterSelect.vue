<script setup lang="ts">
import { ref, computed } from 'vue'
import { useGameStore } from '@/stores/gameStore'
import { chapters, questions } from '@/data/questions'
import { vTilt } from '@/directives/tilt'
import GameHeader from './GameHeader.vue'

const emit = defineEmits<{
  selectChapter: [chapterId: string]
}>()

const store = useGameStore()
const expandedChapter = ref<string | null>(null)

const runeSymbols = ['◈', '◇', '◉', '✦']

const allRegions = computed(() => {
  const seen = new Set<string>()
  return chapters
    .filter(ch => {
      if (seen.has(ch.regionName)) return false
      seen.add(ch.regionName)
      return true
    })
    .sort((a, b) => a.regionOrder - b.regionOrder)
    .map(ch => ch.regionName)
})

const regionShortcuts: Record<string, string> = {
  '语法圣殿': 'S', '爬虫山脉': 'S', '后端城': 'B', '数据库森林': 'D', '前端海岸': 'F',
}

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
  return store.isChapterUnlocked(chapterId)
}

const showRestPrompt = ref(false)

function startSection(chapterId: string, sectionId: string) {
  const ch = chapters.find((c) => c.id === chapterId)
  const sec = ch?.sections.find((s) => s.id === sectionId)
  if (!sec || !store.isSectionUnlocked(sectionId, sec.unlockAfter)) return

  if (store.shouldShowRestPrompt()) {
    showRestPrompt.value = true
    return
  }

  enterQuiz(chapterId, sectionId)
}

function enterQuiz(chapterId: string, sectionId: string) {
  store.selectChapter(chapterId)
  emit('selectChapter', chapterId)
  store.selectSection(sectionId)
}

async function dismissRest(): Promise<void> {
  await store.dismissRestPrompt()
  showRestPrompt.value = false
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

    <div class="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-6 max-w-lg mx-auto w-full">
      <!-- 大标题 -->
      <header class="text-center space-y-2 animate-fade-up">
        <div class="text-gold-500/80 text-xs tracking-[0.6em]">✦ ✧ ✦</div>
        <h1 class="title-display text-2xl sm:text-3xl text-glow-gold">
          智慧圣殿编年史
        </h1>
        <div class="arc-divider max-w-40 mx-auto" />
      </header>

      <div
        v-for="(ch, idx) in chapters"
        :key="ch.id"
        class="space-y-3 animate-fade-up"
        :style="{ animationDelay: `${(idx + 1) * 90}ms` }"
      >
        <!-- 章节卡片 -->
        <div
          v-tilt="isUnlocked(ch.id)"
          class="arc-card shine-sweep tilt-glare px-4 py-4 sm:px-5 select-none"
          :class="[
            !isUnlocked(ch.id)
              ? 'opacity-60 saturate-50 cursor-not-allowed'
              : 'cursor-pointer arc-card-hover',
            isUnlocked(ch.id) && store.getChapterProgress(ch.id).total > 0 && store.getChapterProgress(ch.id).done >= store.getChapterProgress(ch.id).total
              ? 'border-gold-500/50 shadow-glow-gold'
              : isUnlocked(ch.id)
                ? 'border-arcane-400/35 shadow-glow-arcane'
                : '',
          ]"
          @click="isUnlocked(ch.id) ? toggleChapter(ch.id) : undefined"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 shrink-0 rounded-xl flex items-center justify-center text-sm font-display font-bold border"
              :class="
                !isUnlocked(ch.id)
                  ? 'bg-abyss-700/60 text-mist-500 border-mist-500/20'
                  : store.getChapterProgress(ch.id).total > 0 && store.getChapterProgress(ch.id).done >= store.getChapterProgress(ch.id).total
                    ? 'bg-gradient-to-br from-gold-300 to-gold-600 text-abyss-950 border-gold-400/60 shadow-glow-gold'
                    : 'bg-arcane-500/20 text-arcane-200 border-arcane-400/40'
              "
            >
              {{ ['I', 'II', 'III', 'IV', 'V'][chapters.indexOf(ch)] || '?' }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-sm font-bold" :class="isUnlocked(ch.id) ? 'text-mist-100' : 'text-mist-500'">
                {{ ch.displayName }}
              </div>
              <div class="text-xs text-mist-400 mt-0.5">{{ ch.description }}</div>
            </div>
            <svg
              v-if="!isUnlocked(ch.id)"
              class="w-4 h-4 shrink-0 text-mist-500"
              viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
            >
              <rect x="4" y="11" width="16" height="10" rx="2" />
              <path d="M8 11V7a4 4 0 0 1 8 0v4" />
            </svg>
            <div class="text-xs font-mono shrink-0" :class="isUnlocked(ch.id) ? 'text-gold-400' : 'text-mist-500'">
              {{ store.getChapterProgress(ch.id).done }}/{{ store.getChapterProgress(ch.id).total }}
            </div>
          </div>
        </div>

        <!-- 展开区域：节 + 符文卡片 -->
        <div v-if="expandedChapter === ch.id" class="pl-2 sm:pl-4 space-y-4 animate-fade-in">
          <div class="border-l border-arcane-500/25 pl-3 sm:pl-4 space-y-2">
            <button
              v-for="sec in ch.sections"
              :key="sec.id"
              class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all duration-300"
              :class="[
                !store.isSectionUnlocked(sec.id, sec.unlockAfter)
                  ? 'border-mist-500/15 bg-abyss-800/40 opacity-50 cursor-not-allowed'
                  : store.getSectionProgress(sec.id).completed
                    ? 'border-gold-500/40 bg-gold-500/5 hover:border-gold-400/60 cursor-pointer'
                    : 'border-arcane-500/25 bg-abyss-800/50 hover:border-arcane-400/50 hover:bg-arcane-500/10 cursor-pointer',
              ]"
              :disabled="!store.isSectionUnlocked(sec.id, sec.unlockAfter)"
              @click="startSection(ch.id, sec.id)"
            >
              <div
                class="w-2.5 h-2.5 shrink-0 rounded-full"
                :class="
                  !store.isSectionUnlocked(sec.id, sec.unlockAfter)
                    ? 'bg-mist-500/30'
                    : store.getSectionProgress(sec.id).completed
                      ? 'bg-gold-400 shadow-glow-gold'
                      : 'bg-arcane-400 shadow-glow-arcane animate-glow-pulse'
                "
              />
              <div class="flex-1 min-w-0">
                <div class="text-xs font-medium" :class="store.isSectionUnlocked(sec.id, sec.unlockAfter) ? 'text-mist-100' : 'text-mist-500'">
                  {{ sec.displayName }}
                   <span class="text-mist-400">（{{ sec.name }}）</span>
                </div>
              </div>
              <span
                v-if="!store.isSectionUnlocked(sec.id, sec.unlockAfter)"
                class="text-mist-500 text-xs shrink-0 font-mono tracking-widest"
              >
                LOCK
              </span>
              <span
                v-else-if="store.getSectionProgress(sec.id).completed"
                class="text-gold-400 text-xs shrink-0 font-mono tracking-widest"
              >
                CLEAR
              </span>
              <span
                v-else
                class="text-arcane-300 text-xs shrink-0 font-mono tracking-widest text-glow-arcane"
              >
                NOW
              </span>
            </button>
          </div>

          <!-- 奥术法典：2x2 符文卡片 -->
          <div>
            <div class="flex items-center gap-2 mb-2">
              <div class="arc-divider flex-1" />
              <span class="text-xs text-gold-400 tracking-[0.3em] font-display">ARCANE CODEX</span>
              <div class="arc-divider flex-1" />
            </div>

            <div class="grid grid-cols-2 gap-2">
              <div
                v-for="k in getTopKnowledge(ch.id)"
                :key="k.tag"
                class="arc-card px-3 py-2.5 relative overflow-hidden"
                :class="
                  masteryVariant(k.mastery) === 'strong' ? 'border-gold-500/50' :
                  masteryVariant(k.mastery) === 'good' ? 'border-arcane-400/40' :
                  'border-mist-500/20'
                "
              >
                <div class="flex items-center justify-between mb-1.5">
                  <span
                    class="text-lg"
                    :class="
                      masteryVariant(k.mastery) === 'strong' ? 'text-gold-400 text-glow-gold' :
                      masteryVariant(k.mastery) === 'good' ? 'text-arcane-300 text-glow-arcane' :
                      'text-mist-500'
                    "
                  >
                    {{ k.symbol }}
                  </span>
                  <span class="text-xs text-mist-300">{{ k.tag }}</span>
                </div>
                <div class="rune-bar">
                  <div
                    class="rune-bar-fill"
                    :class="[
                      masteryVariant(k.mastery) === 'strong' ? 'rune-bar-fill-gold' : '',
                      masteryVariant(k.mastery) === 'weak' ? 'opacity-40 grayscale' : '',
                    ]"
                    :style="{ width: `${Math.max(k.mastery * 100, 5)}%` }"
                  />
                </div>
                <div
                  class="text-xs text-right mt-1 font-mono"
                  :class="
                    masteryVariant(k.mastery) === 'strong' ? 'text-gold-400' :
                    masteryVariant(k.mastery) === 'good' ? 'text-arcane-300' :
                    'text-mist-500'
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
    <div class="border-t border-arcane-500/15 bg-abyss-900/80 backdrop-blur-md px-4 py-3 shrink-0">
      <div class="text-xs text-mist-400 text-center tracking-[0.4em] mb-2 font-display">AETHERIA</div>
      <div class="flex items-center justify-center gap-1 max-w-md mx-auto">
        <div v-for="(region, i) in allRegions" :key="region" class="flex items-center gap-1">
          <div
            class="flex flex-col items-center"
            :class="i <= store.unlockedChapters.length - 1 ? 'opacity-100' : 'opacity-40'"
          >
            <div
              class="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold border"
              :class="i < store.unlockedChapters.length - 1 ? 'bg-gradient-to-br from-gold-300 to-gold-600 text-abyss-950 border-gold-400/60 shadow-glow-gold' : i === store.unlockedChapters.length - 1 ? 'bg-arcane-500/25 text-arcane-200 border-arcane-400/60 shadow-glow-arcane animate-glow-pulse' : 'bg-abyss-800 text-mist-500 border-mist-500/20'"
            >
              {{ regionShortcuts[region] || '?' }}
            </div>
            <span class="text-[9px] mt-0.5 text-center leading-tight" :class="i <= store.unlockedChapters.length - 1 ? 'text-mist-300' : 'text-mist-500'">
              {{ region.replace('圣殿', '').replace('山脉', '').replace('城', '').replace('森林', '').replace('海岸', '') }}
            </span>
          </div>
          <div v-if="i < allRegions.length - 1" class="w-4 h-px" :class="i < store.unlockedChapters.length - 1 ? 'bg-gold-500/60' : 'bg-mist-500/20'" />
        </div>
      </div>
    </div>

    <!-- 休息提示弹窗（在章节选页，非答题时弹） -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition-all duration-300"
        enter-from-class="opacity-0"
        leave-active-class="transition-all duration-200"
        leave-to-class="opacity-0"
      >
        <div
          v-if="showRestPrompt"
          class="fixed inset-0 z-50 flex items-center justify-center bg-abyss-950/70 backdrop-blur-sm px-4"
          @click="dismissRest"
        >
          <div
            class="arc-card px-6 py-6 max-w-sm w-full text-center space-y-3 animate-scale-in"
            @click.stop
          >
            <div class="w-10 h-10 mx-auto rounded-full bg-arcane-500/20 border border-arcane-400/40 shadow-glow-arcane flex items-center justify-center text-lg text-gold-400">
              ☾
            </div>
            <p class="text-mist-100 leading-relaxed font-bold">
              贤者，已经连续研习 45 分钟了，让魔力回流一会吧。
            </p>
            <p class="text-sm text-mist-300 leading-relaxed">
              休息一下再继续，领悟会更深刻。
            </p>
            <button
              class="btn-arc"
              @click="dismissRest"
            >
              知道了
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
