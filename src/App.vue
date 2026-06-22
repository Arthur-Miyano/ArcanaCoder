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

const store = useGameStore()

const viewState = ref<ViewState>('loading')
const activeChapterId = ref<string | null>(null)

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
}

function onSelectChapter(chapterId: string) {
  activeChapterId.value = chapterId
  viewState.value = 'wisdom'
}

function onStartQuiz() {
  viewState.value = 'quiz'
}

function onChapterComplete() {
  viewState.value = 'chapterComplete'
}

function onBackToChapters() {
  activeChapterId.value = null
  viewState.value = 'chapterSelect'
}

function onBackFromWisdom() {
  viewState.value = 'chapterSelect'
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

    <WisdomBook
      v-else-if="viewState === 'wisdom' && activeChapterId && currentChapter"
      :chapter-id="activeChapterId"
      :chapter-name="currentChapter.name"
      :chapter-number="1"
      :points="chapterPoints"
      @start="onStartQuiz"
      @back="onBackFromWisdom"
    />

    <QuizPanel
      v-else-if="viewState === 'quiz' && activeChapterId"
      :chapter-id="activeChapterId"
      @back="onBackFromQuiz"
      @chapter-complete="onChapterComplete"
    />

    <ChapterComplete
      v-else-if="viewState === 'chapterComplete' && activeChapterId"
      :chapter-id="activeChapterId"
      @back-to-chapters="onBackToChapters"
    />
  </div>
</template>
