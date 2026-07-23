<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useGameStore } from '@/stores/gameStore'
import type { ViewState } from '@/types'
import { chapters } from '@/data/questions'
import { getWisdomPoints } from '@/data/wisdom'
import LoadingOverlay from './components/LoadingOverlay.vue'
import ChapterSelect from './components/ChapterSelect.vue'
import StarfieldCanvas from './components/StarfieldCanvas.vue'
import LevelUpRitual from './components/LevelUpRitual.vue'
import WisdomBook from './components/WisdomBook.vue'
import QuizPanel from './components/QuizPanel.vue'
import ChapterComplete from './components/ChapterComplete.vue'
import DailyPlanDialog from './components/DailyPlanDialog.vue'

const store = useGameStore()

const viewState = ref<ViewState>('loading')
const activeChapterId = ref<string | null>(null)
const showDailyPlan = ref(false)
const ritualLevel = ref<number | null>(null)

const currentChapter = computed(() =>
  chapters.find((c) => c.id === activeChapterId.value),
)

const chapterPoints = computed(() =>
  activeChapterId.value ? getWisdomPoints(activeChapterId.value) : [],
)

onMounted(async () => {
  await store.load()
})

watch(viewState, async (newVal, oldVal) => {
  if (oldVal === 'quiz' && newVal !== 'quiz') await store.onLeaveQuiz()
  if (newVal === 'quiz' && oldVal !== 'quiz') store.onEnterQuiz()
})

// 位阶提升时播放全屏仪式动画
watch(() => store.level, (newLevel, oldLevel) => {
  if (newLevel > oldLevel) ritualLevel.value = newLevel
})

function onPyodideReady() {
  viewState.value = 'chapterSelect'
  showDailyPlan.value = true
}

function onDismissPlan() {
  showDailyPlan.value = false
}

function onSelectChapter(chapterId: string) {
  activeChapterId.value = chapterId
  if (store.isWisdomViewed(chapterId)) {
    viewState.value = 'quiz'
  } else {
    viewState.value = 'wisdom'
  }
}

async function onWisdomStart(): Promise<void> {
  if (activeChapterId.value) await store.markWisdomViewed(activeChapterId.value)
  viewState.value = 'quiz'
}

function onReviewKnowledge() {
  viewState.value = 'wisdom'
}

function onChapterComplete() {
  viewState.value = 'chapterComplete'
}

function onBackToChapters() {
  activeChapterId.value = null
  viewState.value = 'chapterSelect'
}

function onBackFromWisdom() {
  viewState.value = activeChapterId.value ? 'quiz' : 'chapterSelect'
}

function onBackFromQuiz() {
  viewState.value = 'chapterSelect'
}
</script>

<template>
  <div class="min-h-screen flex flex-col text-mist-200">
    <div class="abyss-sky"></div>
    <StarfieldCanvas />

    <Transition name="page" mode="out-in">
      <LoadingOverlay
        v-if="viewState === 'loading'"
        @ready="onPyodideReady"
      />

      <ChapterSelect
        v-else-if="viewState === 'chapterSelect'"
        @select-chapter="onSelectChapter"
      />

      <WisdomBook
        v-else-if="viewState === 'wisdom' && activeChapterId && currentChapter"
        :chapter-id="activeChapterId"
        :chapter-name="currentChapter.name"
        :chapter-number="chapters.findIndex((c) => c.id === activeChapterId) + 1"
        :points="chapterPoints"
        @start="onWisdomStart"
        @back="onBackFromWisdom"
      />

      <QuizPanel
        v-else-if="viewState === 'quiz' && activeChapterId"
        :chapter-id="activeChapterId"
        @back="onBackFromQuiz"
        @review-knowledge="onReviewKnowledge"
        @chapter-complete="onChapterComplete"
      />

      <ChapterComplete
        v-else-if="viewState === 'chapterComplete' && activeChapterId"
        :chapter-id="activeChapterId"
        @back-to-chapters="onBackToChapters"
      />
    </Transition>

    <DailyPlanDialog
      v-if="viewState === 'chapterSelect' && showDailyPlan"
      @start="onDismissPlan"
    />

    <LevelUpRitual
      v-if="ritualLevel !== null"
      :level="ritualLevel"
      @done="ritualLevel = null"
    />
  </div>
</template>

<style>
.page-enter-active,
.page-leave-active {
  transition:
    opacity 0.35s ease,
    transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
}

.page-enter-from {
  opacity: 0;
  transform: translateY(14px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
