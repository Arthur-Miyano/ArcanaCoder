<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useGameStore } from '@/stores/gameStore'
import type { ViewState } from '@/types'
import { chapters } from '@/data/questions'
import { getWisdomPoints } from '@/data/wisdom'
import LoadingOverlay from './components/LoadingOverlay.vue'
import ChapterSelect from './components/ChapterSelect.vue'
import WisdomBook from './components/WisdomBook.vue'
import QuizPanel from './components/QuizPanel.vue'
import ChapterComplete from './components/ChapterComplete.vue'
import DailyPlanDialog from './components/DailyPlanDialog.vue'

const store = useGameStore()

const viewState = ref<ViewState>('loading')
const activeChapterId = ref<string | null>(null)
const showDailyPlan = ref(false)

const currentChapter = computed(() =>
  chapters.find((c) => c.id === activeChapterId.value),
)

const chapterPoints = computed(() =>
  activeChapterId.value ? getWisdomPoints(activeChapterId.value) : [],
)

onMounted(async () => {
  await store.load()
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

function onWisdomStart() {
  if (activeChapterId.value) store.markWisdomViewed(activeChapterId.value)
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
  <div class="min-h-screen flex flex-col bg-magic-bg">
    <LoadingOverlay
      v-if="viewState === 'loading'"
      @ready="onPyodideReady"
    />

    <ChapterSelect
      v-else-if="viewState === 'chapterSelect'"
      @select-chapter="onSelectChapter"
    />

    <DailyPlanDialog
      v-if="viewState === 'chapterSelect' && showDailyPlan"
      @start="onDismissPlan"
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
  </div>
</template>
