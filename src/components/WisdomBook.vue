<script setup lang="ts">
import { ref, computed } from 'vue'
import { Codemirror } from 'vue-codemirror'
import { python } from '@codemirror/lang-python'
import { oneDark } from '@codemirror/theme-one-dark'
import { runPython } from '@/services/pyodide'
import type { WisdomPoint } from '@/types'

const props = defineProps<{
  chapterId: string
  chapterName: string
  chapterNumber: number
  points: WisdomPoint[]
}>()

const emit = defineEmits<{
  start: []
  back: []
}>()

const currentIndex = ref(0)
const currentPoint = computed(() => props.points[currentIndex.value])
const isLast = computed(() => currentIndex.value >= props.points.length - 1)

const output = ref<string | null>(null)
const running = ref(false)
const hasRun = ref(false)

const extensions = computed(() => [python(), oneDark])

function prev() {
  if (currentIndex.value > 0) {
    currentIndex.value--
    output.value = null
    hasRun.value = false
  }
}

function next() {
  if (!isLast.value) {
    currentIndex.value++
    output.value = null
    hasRun.value = false
  }
}

async function run() {
  const point = currentPoint.value
  if (!point || running.value) return

  running.value = true
  const result = await runPython(point.code)
  output.value = result.error || result.output || '(无输出)'
  running.value = false
  hasRun.value = true
}
</script>

<template>
  <div class="flex flex-col flex-1">
    <div class="flex items-center justify-between px-4 py-2 border-b border-gray-700">
      <button
        class="text-xs text-gray-400 hover:text-white transition-colors"
        @click="emit('back')"
      >
        ← 返回
      </button>
      <span class="text-xs text-gray-500">
        第 {{ chapterNumber }} 章：{{ chapterName }}
      </span>
      <span class="text-xs text-gray-500">{{ currentIndex + 1 }}/{{ points.length }}</span>
    </div>

    <div class="flex-1 overflow-y-auto px-4 py-6">
      <div class="max-w-lg mx-auto space-y-5">
        <p class="text-xs text-gray-500">智慧之书</p>

        <div
          class="bg-magic-card border border-gray-600 rounded-lg px-5 py-5 space-y-5"
        >
          <h2 class="text-base font-bold text-magic-gold">
            {{ currentPoint.title }}
          </h2>

          <p class="text-sm text-gray-300 leading-relaxed">
            {{ currentPoint.metaphor }}
          </p>

          <div class="border border-gray-600 rounded-lg overflow-hidden">
            <Codemirror
              :model-value="currentPoint.code"
              :extensions="extensions"
              :disabled="true"
              :style="{ minHeight: `${Math.min(currentPoint.code.split('\n').length, 10) * 1.4 + 1}em` }"
            />
          </div>

          <button
            class="w-full py-2 rounded text-sm font-medium transition-colors"
            :class="
              running
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-[#4B0082] hover:bg-[#5a0099] text-white'
            "
            :disabled="running"
            @click="run"
          >
            {{ running ? '运行中...' : '[ 运行看看 ]' }}
          </button>

          <div
            v-if="hasRun"
            class="px-3 py-2 bg-gray-800 border border-gray-600 rounded text-sm font-mono"
            :class="
              output === currentPoint.expectedOutput
                ? 'text-green-300'
                : 'text-red-300'
            "
          >
            {{ output }}
          </div>

          <div
            v-if="hasRun && output !== currentPoint.expectedOutput"
            class="text-xs text-gray-500"
          >
            期望输出：{{ currentPoint.expectedOutput }}
          </div>

          <div class="pt-1">
            <p class="text-xs text-gray-400 italic">
              {{ currentPoint.tip }}
            </p>
          </div>
        </div>

        <div class="flex items-center justify-between pt-2">
          <button
            v-if="currentIndex > 0"
            class="text-xs text-gray-400 hover:text-white transition-colors"
            @click="prev"
          >
            ← 上一个知识点
          </button>
          <div v-else />

          <button
            v-if="isLast"
            class="px-6 py-2 rounded text-sm font-medium bg-[#4B0082] hover:bg-[#5a0099] text-white transition-colors"
            @click="emit('start')"
          >
            开始试炼
          </button>
          <button
            v-else
            class="px-6 py-2 rounded text-sm font-medium bg-[#4B0082] hover:bg-[#5a0099] text-white transition-colors"
            @click="next"
          >
            下一个知识点
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
