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

const demoOutput = ref<string | null>(null)
const demoRunning = ref(false)
const interactiveOutput = ref<string | null>(null)
const interactiveRunning = ref(false)
const interactiveCode = ref('')

const extensions = computed(() => [python(), oneDark])

function prev() {
  if (currentIndex.value > 0) {
    currentIndex.value--
    resetRun()
  }
}

function next() {
  if (!isLast.value) {
    currentIndex.value++
    resetRun()
  }
}

function resetRun() {
  demoOutput.value = null
  interactiveOutput.value = null
  interactiveCode.value = ''
}

async function runDemo() {
  const point = currentPoint.value
  if (!point || demoRunning.value) return
  demoRunning.value = true
  const { output, error } = await runPython(point.code)
  demoOutput.value = error || output || '(无输出)'
  demoRunning.value = false
}

async function runInteractive() {
  const point = currentPoint.value
  if (!point || interactiveRunning.value) return
  interactiveRunning.value = true
  const code = interactiveCode.value || point.interactiveCode || point.code
  const { output, error } = await runPython(code)
  interactiveOutput.value = error || output || '(无输出)'
  interactiveRunning.value = false
}

function initInteractive() {
  const point = currentPoint.value
  if (point && !interactiveCode.value) {
    interactiveCode.value = point.interactiveCode || point.code
  }
}

initInteractive()

watch(currentPoint, () => {
  interactiveCode.value = ''
  initInteractive()
})
</script>

<script lang="ts">
import { watch } from 'vue'
</script>

<template>
  <div class="flex flex-col flex-1">
    <div class="flex items-center justify-between px-4 py-2 border-b border-gray-700">
      <button class="text-xs text-gray-400 hover:text-white transition-colors" @click="emit('back')">
        ← 返回
      </button>
      <span class="text-xs text-gray-500">
        第 {{ chapterNumber }} 章：{{ chapterName }}
      </span>
      <span class="text-xs text-gray-500">{{ currentIndex + 1 }}/{{ points.length }}</span>
    </div>

    <div class="flex-1 overflow-y-auto px-4 py-6">
      <div v-if="currentPoint" class="max-w-2xl mx-auto space-y-6">
        <h2 class="text-base font-bold text-magic-gold">智慧之书 — 卷{{ chapterNumber }}：{{ currentPoint.title }}</h2>

        <!-- 专业定义 -->
        <div class="bg-magic-card border border-gray-600 rounded-lg px-4 py-3">
          <h3 class="text-xs text-gray-500 uppercase tracking-wider mb-2">专业定义</h3>
          <p class="text-gray-200 leading-relaxed">{{ currentPoint.definition }}</p>
        </div>

        <!-- 语法规则 -->
        <div class="bg-magic-card border border-gray-600 rounded-lg px-4 py-3">
          <h3 class="text-xs text-gray-500 uppercase tracking-wider mb-2">语法规则</h3>
          <ol class="list-decimal list-inside space-y-1 text-gray-200 leading-relaxed">
            <li v-for="(rule, i) in currentPoint.syntaxRules" :key="i">{{ rule }}</li>
          </ol>
        </div>

        <!-- 法阵演示 -->
        <div class="bg-magic-card border border-gray-600 rounded-lg px-4 py-3">
          <h3 class="text-xs text-gray-500 uppercase tracking-wider mb-2">法阵演示</h3>
          <div class="border border-gray-600 rounded-lg overflow-hidden mb-3">
            <Codemirror
              :model-value="currentPoint.code"
              :extensions="extensions"
              :disabled="true"
              :style="{ minHeight: `${Math.min(currentPoint.code.split('\n').length, 10) * 1.4 + 1}em` }"
            />
          </div>
          <button
            class="w-full py-2 rounded text-sm font-medium transition-colors"
            :class="demoRunning ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-[#4B0082] hover:bg-[#5a0099] text-white'"
            :disabled="demoRunning"
            @click="runDemo"
          >
            {{ demoRunning ? '运行中...' : '[ 运行看看 ]' }}
          </button>
          <div
            v-if="demoOutput !== null"
            class="mt-2 px-3 py-2 bg-gray-800 border border-gray-600 rounded text-sm font-mono"
            :class="demoOutput === currentPoint.expectedOutput ? 'text-green-300' : 'text-red-300'"
          >
            {{ demoOutput }}
          </div>
        </div>

        <!-- 设计哲学 -->
        <div v-if="currentPoint.designPhilosophy" class="bg-magic-card border border-gray-600 rounded-lg px-4 py-3">
          <h3 class="text-xs text-gray-500 uppercase tracking-wider mb-2">为什么这样设计？</h3>
          <p class="text-gray-200 leading-relaxed">{{ currentPoint.designPhilosophy }}</p>
        </div>

        <!-- 常见错误 -->
        <div v-if="currentPoint.commonErrors && currentPoint.commonErrors.length > 0" class="bg-magic-card border border-red-800/30 rounded-lg px-4 py-3">
          <h3 class="text-xs text-gray-500 uppercase tracking-wider mb-2">常见魔力反噬（错误）</h3>
          <div class="space-y-2">
            <div v-for="(err, i) in currentPoint.commonErrors" :key="i">
              <div class="px-3 py-1.5 bg-gray-900 rounded text-sm font-mono text-red-300 mb-1">{{ err.code }}</div>
              <p class="text-xs text-gray-400"><span class="text-red-400">{{ err.error }}</span> — {{ err.explanation }}</p>
            </div>
          </div>
        </div>

        <!-- 即时验证 -->
        <div class="bg-magic-card border border-magic-gold/30 rounded-lg px-4 py-3">
          <h3 class="text-xs text-gray-500 uppercase tracking-wider mb-2">即时验证</h3>
          <p class="text-xs text-gray-400 mb-3">修改下面的代码，然后运行验证：</p>
          <div class="border border-gray-600 rounded-lg overflow-hidden mb-3">
            <Codemirror
              :model-value="interactiveCode"
              :extensions="extensions"
              :disabled="false"
              :style="{ minHeight: `${Math.min(interactiveCode.split('\n').length, 10) * 1.4 + 1}em` }"
              @update:model-value="interactiveCode = $event"
            />
          </div>
          <button
            class="w-full py-2 rounded text-sm font-medium transition-colors"
            :class="interactiveRunning ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-yellow-700 hover:bg-yellow-600 text-white'"
            :disabled="interactiveRunning"
            @click="runInteractive"
          >
            {{ interactiveRunning ? '运行中...' : '[ 运行验证 ]' }}
          </button>
          <div
            v-if="interactiveOutput !== null"
            class="mt-2 px-3 py-2 bg-gray-800 border border-gray-600 rounded text-sm font-mono text-green-300"
          >
            {{ interactiveOutput }}
          </div>
        </div>

        <!-- 底部提示 -->
        <div class="px-3 py-2 bg-magic-card border border-gray-600 rounded text-sm text-gray-400 italic leading-relaxed">
          {{ currentPoint.tip }}
        </div>

        <!-- 导航 -->
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
