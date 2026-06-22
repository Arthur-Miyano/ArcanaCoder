<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useGameStore } from '@/stores/gameStore'
import type { ViewState } from '@/types'
import LoadingOverlay from './components/LoadingOverlay.vue'
import ChapterSelect from './components/ChapterSelect.vue'
import KnowledgeBook from './components/KnowledgeBook.vue'
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
  viewState.value = 'knowledgeBook'
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

function onBackFromKnowledge() {
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

    <KnowledgeBook
      v-else-if="viewState === 'knowledgeBook' && activeChapterId"
      :chapter-id="activeChapterId"
      @start="onStartQuiz"
      @back="onBackFromKnowledge"
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
