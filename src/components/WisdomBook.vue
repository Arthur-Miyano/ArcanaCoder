<script setup lang="ts">
import { ref, computed, watch } from 'vue'
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

const emit = defineEmits<{ start: []; back: [] }>()

const currentIndex = ref(0)
const isFlipping = ref(false)
const currentPoint = computed(() => props.points[currentIndex.value])
const isLast = computed(() => currentIndex.value >= props.points.length - 1)
const isFirst = computed(() => currentIndex.value <= 0)

const demoOutput = ref<string | null>(null)
const demoRunning = ref(false)
const interactiveOutput = ref<string | null>(null)
const interactiveRunning = ref(false)
const interactiveCode = ref('')

const extensions = [python(), oneDark]

watch(currentPoint, () => {
  interactiveCode.value = props.points[currentIndex.value]?.interactiveCode ?? props.points[currentIndex.value]?.code ?? ''
  demoOutput.value = null
  interactiveOutput.value = null
})

function prev() {
  if (isFlipping.value || isFirst.value) return
  goToPage(currentIndex.value - 1)
}

function next() {
  if (isFlipping.value || isLast.value) return
  goToPage(currentIndex.value + 1)
}

function goToPage(index: number) {
  if (isFlipping.value || index === currentIndex.value) return
  isFlipping.value = true
  setTimeout(() => {
    currentIndex.value = index
    isFlipping.value = false
  }, 600)
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
</script>

<template>
  <div class="flex flex-col flex-1">
    <div class="flex items-center justify-between px-4 py-2 border-b border-gray-700 shrink-0">
      <button class="text-xs text-gray-400 hover:text-white transition-colors" @click="emit('back')">← 返回</button>
      <span class="text-xs text-gray-500">第 {{ chapterNumber }} 章：{{ chapterName }}</span>
      <span class="text-xs text-gray-500">{{ currentIndex + 1 }}/{{ points.length }}</span>
    </div>

    <div class="flex-1 flex items-center justify-center p-4 book-scene">
      <!-- 左箭头 -->
      <button class="arrow arrow-left" :disabled="isFirst || isFlipping" @click="prev">
        <span class="arrow-shape" />
      </button>

      <!-- 书本 -->
      <div class="book-container" :class="{ flipping: isFlipping }">
        <!-- 左页：目录 -->
        <div class="book-page left-page">
          <div class="page-inner">
            <div class="page-header">目录</div>
            <div class="toc-list">
              <button
                v-for="(p, i) in points"
                :key="i"
                class="toc-item"
                :class="{ active: i === currentIndex }"
                :disabled="isFlipping"
                @click="goToPage(i)"
              >
                {{ p.title }}
              </button>
            </div>
            <div class="page-footer">{{ chapterName }}</div>
          </div>
        </div>

        <!-- 书脊 -->
        <div class="book-spine" />

        <!-- 右页：知识点内容 -->
        <div class="book-page right-page" v-if="currentPoint">
          <div class="page-inner">
            <div class="page-header">卷{{ chapterNumber }} · {{ currentPoint.title }}</div>

            <!-- 专业定义 -->
            <section>
              <h4 class="section-title">专业定义</h4>
              <p class="section-body">{{ currentPoint.definition }}</p>
            </section>

            <!-- 语法规则 -->
            <section>
              <h4 class="section-title">语法规则</h4>
              <ol class="rule-list">
                <li v-for="(r, i) in currentPoint.syntaxRules" :key="i">{{ r }}</li>
              </ol>
            </section>

            <!-- 法阵演示 -->
            <section>
              <h4 class="section-title">法阵演示</h4>
              <div class="code-wrap" :class="{ 'code-hidden': isFlipping }">
                <Codemirror :model-value="currentPoint.code" :extensions="extensions" :disabled="true" :style="{ minHeight: '3em' }" />
              </div>
              <button class="run-btn" :disabled="demoRunning || isFlipping" @click="runDemo">
                {{ demoRunning ? '运行中...' : '[ 运行看看 ]' }}
              </button>
              <div v-if="demoOutput !== null" class="output-box">{{ demoOutput }}</div>
            </section>

            <!-- 设计哲学 -->
            <section v-if="currentPoint.designPhilosophy">
              <h4 class="section-title">为什么这样设计？</h4>
              <p class="section-body">{{ currentPoint.designPhilosophy }}</p>
            </section>

            <!-- 常见错误 -->
            <section v-if="currentPoint.commonErrors && currentPoint.commonErrors.length > 0">
              <h4 class="section-title">常见错误</h4>
              <div v-for="(err, i) in currentPoint.commonErrors" :key="i" class="error-block">
                <code>{{ err.code }}</code>
                <p class="text-xs text-gray-600 mt-0.5"><span class="text-red-600">{{ err.error }}</span> — {{ err.explanation }}</p>
              </div>
            </section>

            <!-- 提示 -->
            <section>
              <p class="tip-text">{{ currentPoint.tip }}</p>
            </section>
          </div>

          <!-- 即时验证 -->
          <div class="page-inner interactive-section">
            <h4 class="section-title">即时验证</h4>
            <div class="code-wrap" :class="{ 'code-hidden': isFlipping }">
              <Codemirror :model-value="interactiveCode" :extensions="extensions" :style="{ minHeight: '3em' }"
                @update:model-value="interactiveCode = $event" />
            </div>
            <button class="run-btn run-verify" :disabled="interactiveRunning || isFlipping" @click="runInteractive">
              {{ interactiveRunning ? '运行中...' : '[ 运行验证 ]' }}
            </button>
            <div v-if="interactiveOutput !== null" class="output-box">{{ interactiveOutput }}</div>
          </div>
        </div>
      </div>

      <!-- 右箭头 -->
      <button class="arrow arrow-right" :disabled="isLast || isFlipping" @click="next">
        <span class="arrow-shape" />
      </button>
    </div>

    <!-- 底部：开始试炼 -->
    <div class="px-4 py-3 border-t border-gray-700 shrink-0 flex justify-center gap-4">
      <button v-if="isLast" class="px-6 py-2 rounded text-sm font-medium bg-[#4B0082] hover:bg-[#5a0099] text-white transition-colors" @click="emit('start')">
        开始试炼
      </button>
    </div>
  </div>
</template>

<style scoped>
.book-scene {
  perspective: 1200px;
  gap: 1rem;
}

.book-container {
  display: flex;
  width: 900px;
  max-width: 100%;
  height: 520px;
  max-height: 70vh;
  transform-style: preserve-3d;
}

.book-page {
  width: 50%;
  height: 100%;
  background: linear-gradient(to right, #e8dcc8 0%, #f4e4c1 95%, #d4c4a0 100%);
  overflow-y: auto;
  position: relative;
  box-shadow: inset -8px 0 12px rgba(0,0,0,0.08);
}

.right-page {
  transform-origin: left center;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  backface-visibility: hidden;
  box-shadow: inset 8px 0 12px rgba(0,0,0,0.08);
}

.flipping .right-page {
  transform: rotateY(-180deg);
}

.book-spine {
  width: 14px;
  height: 100%;
  background: linear-gradient(180deg, #8B6914 0%, #c9a227 30%, #8B6914 50%, #c9a227 70%, #8B6914 100%);
  border-radius: 2px;
  flex-shrink: 0;
  box-shadow: -2px 0 4px rgba(0,0,0,0.15), 2px 0 4px rgba(0,0,0,0.15);
}

.page-inner {
  padding: 1.25rem;
  color: #3a2a1a;
  font-size: 0.8125rem;
  line-height: 1.7;
}

.page-header {
  font-size: 0.85rem;
  font-weight: 700;
  color: #4B0082;
  text-align: center;
  padding-bottom: 0.75rem;
  margin-bottom: 0.75rem;
  border-bottom: 1px solid rgba(139, 105, 20, 0.25);
}

.page-footer {
  margin-top: 1rem;
  padding-top: 0.5rem;
  border-top: 1px solid rgba(139, 105, 20, 0.15);
  font-size: 0.7rem;
  color: #8B6914;
  text-align: center;
}

.toc-list {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.toc-item {
  text-align: left;
  background: none;
  border: none;
  padding: 0.35rem 0.5rem;
  font-size: 0.8rem;
  color: #5a4a3a;
  cursor: pointer;
  border-radius: 3px;
  transition: all 0.2s;
}

.toc-item:hover { background: rgba(75, 0, 130, 0.08); }
.toc-item.active { background: rgba(75, 0, 130, 0.15); color: #4B0082; font-weight: 600; }

.section-title {
  font-size: 0.7rem;
  font-weight: 700;
  color: #8B6914;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.35rem;
  margin-top: 0.75rem;
}

.section-title:first-of-type { margin-top: 0; }

.section-body {
  color: #3a2a1a;
  font-size: 0.8125rem;
  line-height: 1.7;
}

.rule-list {
  padding-left: 1.25rem;
  color: #3a2a1a;
  font-size: 0.8125rem;
  line-height: 1.7;
}

.rule-list li { margin-bottom: 0.2rem; }

.code-wrap {
  border: 1px solid rgba(0,0,0,0.12);
  border-radius: 4px;
  overflow: hidden;
  transition: opacity 0.2s;
}

.code-hidden { opacity: 0; }

.run-btn {
  margin-top: 0.5rem;
  padding: 0.35rem 0.8rem;
  font-size: 0.75rem;
  background: #2d6a4f;
  color: #e8dcc8;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

.run-btn:hover { background: #40916c; }
.run-btn:disabled { background: #999; cursor: not-allowed; }

.run-verify { background: #b8860b; }
.run-verify:hover { background: #d4a017; }

.output-box {
  margin-top: 0.4rem;
  padding: 0.4rem 0.6rem;
  background: rgba(0,0,0,0.05);
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.8rem;
  color: #2d6a4f;
}

.error-block {
  padding: 0.4rem 0.6rem;
  background: rgba(220, 38, 38, 0.06);
  border-radius: 4px;
  margin-bottom: 0.4rem;
}

.error-block code {
  font-size: 0.78rem;
  color: #b91c1c;
}

.tip-text {
  font-style: italic;
  color: #8B6914;
  font-size: 0.8rem;
  padding: 0.5rem;
  background: rgba(139, 105, 20, 0.06);
  border-radius: 4px;
  border-left: 2px solid #c9a227;
}

.interactive-section {
  border-top: 1px solid rgba(139, 105, 20, 0.2);
  margin-top: 0.75rem;
  padding-top: 0.75rem;
}

/* 翻页箭头 */
.arrow {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  flex-shrink: 0;
}

.arrow:disabled { opacity: 0.2; cursor: not-allowed; }

.arrow-shape {
  display: block;
  width: 0;
  height: 0;
  border-top: 12px solid transparent;
  border-bottom: 12px solid transparent;
}

.arrow-left .arrow-shape {
  border-right: 16px solid #c9a227;
}

.arrow-right .arrow-shape {
  border-left: 16px solid #c9a227;
}

.arrow:not(:disabled):hover .arrow-shape {
  filter: drop-shadow(0 0 4px rgba(201, 162, 39, 0.6));
}

/* 移动端回退 */
@media (max-width: 768px) {
  .book-container {
    flex-direction: column;
    width: 100%;
    height: auto;
    perspective: none;
  }
  .book-page { width: 100%; transform: none !important; }
  .book-spine { display: none; }
  .arrow { display: none; }
}
</style>
