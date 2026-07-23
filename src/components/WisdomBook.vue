<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Codemirror } from 'vue-codemirror'
import { pythonExtensions } from '@/composables/useCodeMirror'
import { usePythonRunner } from '@/composables/usePythonRunner'
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

const demoRunner = usePythonRunner()
const interactiveRunner = usePythonRunner()
const interactiveCode = ref('')

const demoOutput = computed(() => demoRunner.error.value || demoRunner.output.value || '(无输出)')
const interactiveOutput = computed(() => interactiveRunner.error.value || interactiveRunner.output.value || '(无输出)')
const demoRunning = computed(() => demoRunner.running.value)
const interactiveRunning = computed(() => interactiveRunner.running.value)
const hasDemoRun = computed(() => demoRunner.output.value !== null || demoRunner.error.value !== null)
const hasInteractiveRun = computed(() => interactiveRunner.output.value !== null || interactiveRunner.error.value !== null)

watch(currentPoint, () => {
  interactiveCode.value = props.points[currentIndex.value]?.interactiveCode ?? props.points[currentIndex.value]?.code ?? ''
  demoRunner.reset()
  interactiveRunner.reset()
}, { immediate: true })

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

async function runDemo(): Promise<void> {
  const point = currentPoint.value
  if (!point || demoRunner.running.value) return
  await demoRunner.run(point.code)
}

async function runInteractive(): Promise<void> {
  const point = currentPoint.value
  if (!point || interactiveRunner.running.value) return
  const code = interactiveCode.value || point.interactiveCode || point.code
  await interactiveRunner.run(code)
}
</script>

<template>
  <div class="flex flex-col flex-1">
    <div class="flex items-center justify-between px-4 py-2.5 border-b border-arcane-500/15 bg-abyss-900/70 backdrop-blur-sm shrink-0">
      <button class="btn-ghost text-xs px-4 py-1.5" @click="emit('back')">← 返回</button>
      <span class="font-display text-sm text-gold-400 tracking-widest">第 {{ chapterNumber }} 章：{{ chapterName }}</span>
      <span class="text-xs text-mist-400 font-mono">{{ currentIndex + 1 }}/{{ points.length }}</span>
    </div>

    <div class="flex-1 flex items-center justify-center p-4 book-scene">
      <!-- 左箭头 -->
      <button class="arrow arrow-left" :disabled="isFirst || isFlipping" @click="prev">
        <span class="arrow-shape" />
      </button>

      <!-- 书本 -->
      <div class="book-container shadow-glow-arcane-lg animate-fade-in" :class="{ flipping: isFlipping }">
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
            <section class="arc-card knowledge-card">
              <h4 class="section-title">专业定义</h4>
              <p class="section-body">{{ currentPoint.definition }}</p>
            </section>

            <!-- 语法规则 -->
            <section class="arc-card knowledge-card">
              <h4 class="section-title">语法规则</h4>
              <ol class="rule-list">
                <li v-for="(r, i) in currentPoint.syntaxRules" :key="i">{{ r }}</li>
              </ol>
            </section>

            <!-- 法阵演示 -->
            <section class="arc-card knowledge-card">
              <h4 class="section-title">法阵演示</h4>
              <div class="code-wrap" :class="{ 'code-hidden': isFlipping }">
                <Codemirror :model-value="currentPoint.code" :extensions="pythonExtensions" :disabled="true" :style="{ minHeight: '3em' }" />
              </div>
              <button class="run-btn" :disabled="demoRunning || isFlipping" @click="runDemo">
                {{ demoRunning ? '运行中...' : '[ 运行看看 ]' }}
              </button>
              <div v-if="hasDemoRun" class="output-box">{{ demoOutput }}</div>
            </section>

            <!-- 设计哲学 -->
            <section v-if="currentPoint.designPhilosophy" class="arc-card knowledge-card">
              <h4 class="section-title">为什么这样设计？</h4>
              <p class="section-body">{{ currentPoint.designPhilosophy }}</p>
            </section>

            <!-- 常见错误 -->
            <section v-if="currentPoint.commonErrors && currentPoint.commonErrors.length > 0" class="arc-card knowledge-card">
              <h4 class="section-title">常见错误</h4>
              <div v-for="(err, i) in currentPoint.commonErrors" :key="i" class="error-block">
                <code>{{ err.code }}</code>
                <p class="text-xs text-mist-400 mt-0.5"><span class="text-red-400">{{ err.error }}</span> — {{ err.explanation }}</p>
              </div>
            </section>

            <!-- 提示 -->
            <section class="arc-card knowledge-card">
              <p class="tip-text">{{ currentPoint.tip }}</p>
            </section>
          </div>

          <!-- 即时验证 -->
          <div class="page-inner interactive-section">
            <h4 class="section-title">即时验证</h4>
            <div class="code-wrap" :class="{ 'code-hidden': isFlipping }">
              <Codemirror :model-value="interactiveCode" :extensions="pythonExtensions" :style="{ minHeight: '3em' }"
                @update:model-value="interactiveCode = $event" />
            </div>
            <button class="run-btn run-verify" :disabled="interactiveRunning || isFlipping" @click="runInteractive">
              {{ interactiveRunning ? '运行中...' : '[ 运行验证 ]' }}
            </button>
            <div v-if="hasInteractiveRun" class="output-box">{{ interactiveOutput }}</div>
          </div>
        </div>
      </div>

      <!-- 右箭头 -->
      <button class="arrow arrow-right" :disabled="isLast || isFlipping" @click="next">
        <span class="arrow-shape" />
      </button>
    </div>

    <!-- 底部：开始试炼 -->
    <div class="px-4 py-3 border-t border-arcane-500/15 bg-abyss-900/70 backdrop-blur-sm shrink-0 flex justify-center gap-4">
      <button v-if="isLast" class="btn-gold shine-sweep text-sm animate-scale-in" @click="emit('start')">
        开始试炼
      </button>
    </div>
  </div>
</template>

<style scoped>
.book-scene {
  perspective: 1200px;
  gap: 1rem;
  position: relative;
}

.book-container {
  display: flex;
  width: 900px;
  max-width: 100%;
  height: 520px;
  max-height: 70vh;
  transform-style: preserve-3d;
  border-radius: 0.75rem;
}

.book-page {
  width: 50%;
  height: 100%;
  background: linear-gradient(135deg, rgba(13, 18, 36, 0.97) 0%, rgba(17, 23, 48, 0.95) 55%, rgba(10, 14, 26, 0.97) 100%);
  border: 1px solid rgba(124, 106, 255, 0.18);
  overflow-y: auto;
  position: relative;
  box-shadow: inset -12px 0 24px rgba(0, 0, 0, 0.45);
}

.left-page {
  border-radius: 0.75rem 0 0 0.75rem;
  border-right: none;
}

.right-page {
  border-radius: 0 0.75rem 0.75rem 0;
  border-left: none;
  transform-origin: left center;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  backface-visibility: hidden;
  box-shadow: inset 12px 0 24px rgba(0, 0, 0, 0.45);
}

.flipping .right-page {
  transform: rotateY(-180deg);
}

.book-spine {
  width: 12px;
  height: 100%;
  background: linear-gradient(180deg, #5442c4 0%, #7c6aff 30%, #5442c4 50%, #7c6aff 70%, #5442c4 100%);
  flex-shrink: 0;
  box-shadow:
    -2px 0 6px rgba(0, 0, 0, 0.5),
    2px 0 6px rgba(0, 0, 0, 0.5),
    0 0 16px rgba(124, 106, 255, 0.35);
}

.page-inner {
  padding: 1.25rem;
  color: #c9cede;
  font-size: 0.8125rem;
  line-height: 1.7;
}

.page-header {
  font-family: 'Cormorant Garamond', 'Noto Sans SC', serif;
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: #e0be55;
  text-shadow: 0 0 20px rgba(212, 175, 55, 0.35);
  text-align: center;
  padding-bottom: 0.75rem;
  margin-bottom: 0.9rem;
  border-bottom: 1px solid rgba(124, 106, 255, 0.18);
}

.page-header::before,
.page-header::after {
  content: '✦';
  margin: 0 0.6rem;
  font-size: 0.7rem;
  color: rgba(124, 106, 255, 0.6);
  text-shadow: 0 0 10px rgba(124, 106, 255, 0.6);
}

.page-footer {
  margin-top: 1rem;
  padding-top: 0.5rem;
  border-top: 1px solid rgba(124, 106, 255, 0.12);
  font-size: 0.7rem;
  color: #7e8499;
  letter-spacing: 0.1em;
  text-align: center;
}

.toc-list {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.toc-item {
  text-align: left;
  background: rgba(17, 23, 48, 0.5);
  border: 1px solid rgba(124, 106, 255, 0.12);
  padding: 0.45rem 0.65rem;
  font-size: 0.8rem;
  color: #a7adc2;
  cursor: pointer;
  border-radius: 0.5rem;
  transition: all 0.25s;
}

.toc-item:hover {
  border-color: rgba(124, 106, 255, 0.4);
  color: #eef0fa;
  background: rgba(124, 106, 255, 0.08);
  transform: translateX(2px);
}

.toc-item.active {
  border-color: rgba(212, 175, 55, 0.45);
  background: rgba(212, 175, 55, 0.08);
  color: #e0be55;
  font-weight: 600;
  box-shadow: 0 0 12px -2px rgba(212, 175, 55, 0.35);
}

.knowledge-card {
  padding: 0.75rem 0.9rem;
  margin-bottom: 0.75rem;
  border-radius: 0.75rem;
}

.section-title {
  font-family: 'Cormorant Garamond', 'Noto Sans SC', serif;
  font-size: 0.85rem;
  font-weight: 700;
  color: #d4af37;
  letter-spacing: 0.12em;
  margin-bottom: 0.4rem;
}

.section-title::before {
  content: '✧ ';
  color: rgba(124, 106, 255, 0.7);
}

.section-body {
  color: #c9cede;
  font-size: 0.8125rem;
  line-height: 1.7;
}

.rule-list {
  padding-left: 1.25rem;
  color: #c9cede;
  font-size: 0.8125rem;
  line-height: 1.7;
}

.rule-list li {
  margin-bottom: 0.2rem;
}

.rule-list li::marker {
  color: #7c6aff;
}

.code-wrap {
  border: 1px solid rgba(124, 106, 255, 0.2);
  border-radius: 0.5rem;
  overflow: hidden;
  transition: opacity 0.2s;
}

.code-hidden { opacity: 0; }

.run-btn {
  margin-top: 0.5rem;
  padding: 0.4rem 1rem;
  font-size: 0.75rem;
  font-weight: 500;
  background: linear-gradient(135deg, #7c6aff, #5442c4);
  color: #eef0fa;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  box-shadow: 0 0 16px -4px rgba(124, 106, 255, 0.5);
  transition: all 0.25s;
}

.run-btn:hover:not(:disabled) {
  filter: brightness(1.12);
  box-shadow: 0 0 24px -4px rgba(124, 106, 255, 0.65);
  transform: translateY(-1px);
}

.run-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.run-verify {
  background: linear-gradient(135deg, #ecd27a, #b8942a);
  color: #04060d;
  box-shadow: 0 0 16px -4px rgba(212, 175, 55, 0.5);
}

.run-verify:hover:not(:disabled) {
  box-shadow: 0 0 24px -4px rgba(212, 175, 55, 0.65);
}

.output-box {
  margin-top: 0.4rem;
  padding: 0.45rem 0.65rem;
  background: rgba(4, 6, 13, 0.7);
  border: 1px solid rgba(124, 106, 255, 0.15);
  border-radius: 0.5rem;
  font-family: 'JetBrains Mono', Consolas, monospace;
  font-size: 0.8rem;
  color: #b3a6ff;
  white-space: pre-wrap;
  word-break: break-all;
}

.error-block {
  padding: 0.45rem 0.65rem;
  background: rgba(248, 113, 113, 0.06);
  border: 1px solid rgba(248, 113, 113, 0.2);
  border-radius: 0.5rem;
  margin-bottom: 0.4rem;
}

.error-block code {
  font-family: 'JetBrains Mono', Consolas, monospace;
  font-size: 0.78rem;
  color: #f87171;
}

.tip-text {
  font-style: italic;
  color: #ecd27a;
  font-size: 0.8rem;
  padding: 0.5rem 0.65rem;
  background: rgba(212, 175, 55, 0.06);
  border-radius: 0.5rem;
  border-left: 2px solid #d4af37;
}

.interactive-section {
  border-top: 1px solid rgba(124, 106, 255, 0.15);
  margin-top: 0.5rem;
  padding-top: 0.75rem;
}

/* 翻页箭头 */
.arrow {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(17, 23, 48, 0.6);
  border: 1px solid rgba(212, 175, 55, 0.3);
  border-radius: 50%;
  cursor: pointer;
  flex-shrink: 0;
  backdrop-filter: blur(6px);
  transition: all 0.25s;
}

.arrow:not(:disabled):hover {
  border-color: rgba(212, 175, 55, 0.7);
  box-shadow: 0 0 20px -2px rgba(212, 175, 55, 0.5);
  transform: scale(1.08);
}

.arrow:disabled {
  opacity: 0.25;
  cursor: not-allowed;
}

.arrow-shape {
  display: block;
  width: 0;
  height: 0;
  border-top: 9px solid transparent;
  border-bottom: 9px solid transparent;
}

.arrow-left .arrow-shape {
  border-right: 12px solid #d4af37;
  margin-left: -2px;
}

.arrow-right .arrow-shape {
  border-left: 12px solid #d4af37;
  margin-right: -2px;
}

/* 移动端回退 */
@media (max-width: 768px) {
  .book-container {
    flex-direction: column;
    width: 100%;
    height: auto;
    max-height: none;
    perspective: none;
  }
  .book-page {
    width: 100%;
    transform: none !important;
    border-radius: 0.75rem;
    border: 1px solid rgba(124, 106, 255, 0.18);
    box-shadow: none;
  }
  .left-page { margin-bottom: 0.75rem; }
  .book-spine { display: none; }
  .arrow { display: none; }
}
</style>
