<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useGameStore } from '@/stores/gameStore'
import type { ViewState } from '@/types'
import LoadingOverlay from './components/LoadingOverlay.vue'
import ChapterSelect from './components/ChapterSelect.vue'
import QuizPanel from './components/QuizPanel.vue'
import ChapterComplete from './components/ChapterComplete.vue'

const store = useGameStore()

const viewState = ref<ViewState>('loading')
const activeChapterId = ref<string | null>(null)

onMounted(async () => {
  await store.load()
})

function onPyodideReady() {
  viewState.value = 'chapterSelect'
}

function onSelectChapter(chapterId: string) {
  activeChapterId.value = chapterId
  viewState.value = 'quiz'
}

function onChapterComplete() {
  viewState.value = 'chapterComplete'
}

function onBackToChapters() {
  activeChapterId.value = null
  viewState.value = 'chapterSelect'
}

function onBack() {
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

    <QuizPanel
      v-else-if="viewState === 'quiz' && activeChapterId"
      :chapter-id="activeChapterId"
      @back="onBack"
      @chapter-complete="onChapterComplete"
    />

    <ChapterComplete
      v-else-if="viewState === 'chapterComplete' && activeChapterId"
      :chapter-id="activeChapterId"
      @back-to-chapters="onBackToChapters"
    />
  </div>
</template>
