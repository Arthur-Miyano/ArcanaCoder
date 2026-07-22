<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { initPyodide, isReady } from '@/services/pyodide'

const emit = defineEmits<{ ready: [] }>()

const progress = ref(0)
const stageText = ref('准备召唤贤者...')
const error = ref<string | null>(null)
const slowWarning = ref(false)

let slowTimer: ReturnType<typeof setTimeout> | null = null

const stages = [
  { at: 0, text: '准备召唤贤者...' },
  { at: 5, text: '连接魔法之源...' },
  { at: 30, text: '加载 Python 圣典...' },
  { at: 60, text: '构建魔法回路...' },
  { at: 80, text: '召唤标准库精灵...' },
  { at: 95, text: '最终调试...' },
]

function getStageText(pct: number): string {
  let text = stages[0].text
  for (let i = stages.length - 1; i >= 0; i--) {
    if (pct >= stages[i].at) {
      text = stages[i].text
      break
    }
  }
  return text
}

async function load(): Promise<void> {
  error.value = null
  progress.value = 0
  stageText.value = '准备召唤贤者...'
  slowWarning.value = false

  if (isReady()) {
    progress.value = 100
    stageText.value = '贤者已就位！'
    emit('ready')
    return
  }

  // 15 秒后显示慢加载提示
  slowTimer = setTimeout(() => {
    slowWarning.value = true
  }, 15000)

  try {
    await initPyodide((pct) => {
      progress.value = pct
      stageText.value = getStageText(pct)
    })
    if (slowTimer) clearTimeout(slowTimer)
    stageText.value = '贤者已就位！'
    setTimeout(() => {
      if (!isReady()) return
      emit('ready')
    }, 400)
  } catch (err: unknown) {
    if (slowTimer) clearTimeout(slowTimer)
    error.value = `加载失败：${err instanceof Error ? err.message : '未知错误'}`
    progress.value = 0
  }
}

function dismissWarning() {
  slowWarning.value = false
}

onMounted(load)
onUnmounted(() => { if (slowTimer) clearTimeout(slowTimer) })
</script>

<template>
  <div class="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden loading-abyss">
    <!-- 星点层 -->
    <div class="absolute inset-0 pointer-events-none">
      <span class="star left-[12%] top-[18%] animate-twinkle" />
      <span class="star left-[78%] top-[14%] animate-twinkle" style="animation-delay: 0.8s;" />
      <span class="star left-[24%] top-[76%] animate-twinkle" style="animation-delay: 1.6s;" />
      <span class="star left-[86%] top-[68%] animate-twinkle" style="animation-delay: 2.2s;" />
      <span class="star star-gold left-[60%] top-[86%] animate-twinkle" style="animation-delay: 0.4s;" />
      <span class="star star-gold left-[8%] top-[52%] animate-twinkle" style="animation-delay: 1.2s;" />
    </div>

    <!-- 加载内容区 -->
    <div class="relative z-10 w-full max-w-md px-6 text-center">
      <template v-if="!error">
        <!-- 发光标题 -->
        <p class="mb-2 text-xs tracking-[0.5em] text-gold-400/80 font-body animate-fade-in">✦ ✧ ✦</p>
        <h1 class="title-display text-4xl sm:text-5xl text-glow-arcane animate-fade-up">
          ArcanaCoder
        </h1>
        <p class="mt-2 mb-8 text-sm tracking-[0.3em] text-mist-400 font-body animate-fade-up" style="animation-delay: 0.15s;">
          星渊秘典
        </p>

        <!-- 奥术符文法阵 -->
        <div class="relative mx-auto mb-8 h-44 w-44 sm:h-52 sm:w-52 animate-scale-in" style="animation-delay: 0.25s;">
          <!-- 外环：虚线光环，顺时针缓转 -->
          <div class="rune-ring-outer absolute inset-0 rounded-full border border-dashed border-arcane-500/40" />
          <!-- 符文环：逆时针旋转 -->
          <div class="rune-ring-runes absolute inset-2">
            <span
              v-for="(rune, i) in ['✦', '☾', '✧', '⚜', '✦', '☾', '✧', '⚜']"
              :key="i"
              class="rune-glyph"
              :class="i % 2 === 0 ? 'text-arcane-300' : 'text-gold-400'"
              :style="{ transform: `rotate(${i * 45}deg) translateY(var(--rune-radius))` }"
            >{{ rune }}</span>
          </div>
          <!-- 内环脉冲光晕 -->
          <div class="absolute inset-8 rounded-full border border-arcane-400/30 animate-glow-pulse" />
          <!-- 中心秘核 -->
          <div class="rune-core absolute inset-0 flex flex-col items-center justify-center">
            <span class="text-2xl text-arcane-300 animate-float-slow">☾</span>
            <span class="mt-1 font-mono text-lg font-semibold text-gold-300 text-glow-gold">
              {{ progress }}%
            </span>
          </div>
        </div>

        <!-- 阶段提示文字 -->
        <p class="mb-4 text-sm sm:text-base tracking-widest text-mist-200 font-body animate-glow-pulse">
          {{ stageText }}
        </p>

        <!-- 流光进度条（秘金版） -->
        <div class="rune-bar mx-auto max-w-xs shadow-card">
          <div
            class="rune-bar-fill rune-bar-fill-gold"
            :style="{ width: `${progress}%` }"
          />
        </div>

        <!-- 慢加载提示 -->
        <p
          v-if="slowWarning"
          class="mt-5 text-xs leading-relaxed text-mist-400 cursor-pointer transition-colors hover:text-mist-200 animate-fade-in"
          @click="dismissWarning"
        >
          ⏳ 首次加载需要下载约 10MB 的魔法编译器，请耐心等待。<br>
          如果超过 30 秒仍未完成，请检查网络连接后刷新页面重试。
        </p>
      </template>

      <template v-else>
        <div class="arc-card px-6 py-6 animate-scale-in" style="border-color: rgba(248, 113, 113, 0.4);">
          <p class="text-red-400 text-lg mb-2">⚠️ {{ error }}</p>
          <p class="text-sm mb-5 text-mist-300">请检查网络连接后重试</p>
          <button class="btn-arc" @click="load">
            重新加载
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
/* 星渊底色：多层径向辉光 + 深渊渐变 */
.loading-abyss {
  background:
    radial-gradient(ellipse 70% 50% at 50% 30%, rgba(84, 66, 196, 0.22), transparent 65%),
    radial-gradient(ellipse 45% 35% at 80% 85%, rgba(212, 175, 55, 0.06), transparent 60%),
    radial-gradient(ellipse 55% 45% at 15% 80%, rgba(46, 38, 110, 0.3), transparent 65%),
    linear-gradient(180deg, #05070f 0%, #0a0e1a 55%, #04060d 100%);
}

/* 星点 */
.star {
  position: absolute;
  width: 3px;
  height: 3px;
  border-radius: 9999px;
  background: rgba(179, 166, 255, 0.9);
  box-shadow: 0 0 8px 2px rgba(124, 106, 255, 0.5);
}

.star-gold {
  background: rgba(236, 210, 122, 0.9);
  box-shadow: 0 0 8px 2px rgba(212, 175, 55, 0.45);
}

/* 外环缓转（顺时针） */
.rune-ring-outer {
  animation: rune-spin 36s linear infinite;
}

/* 符文环整体反转（逆时针） */
.rune-ring-runes {
  animation: rune-spin-reverse 24s linear infinite;
}

/* 单个符文：先转到各自方位再向外推，保持字形朝上 */
.rune-glyph {
  --rune-radius: -5.25rem;
  position: absolute;
  left: 50%;
  top: 50%;
  margin-left: -0.5em;
  margin-top: -0.5em;
  font-size: 1rem;
  line-height: 1;
  text-shadow: 0 0 10px rgba(124, 106, 255, 0.6);
  animation: glow-pulse 3s ease-in-out infinite;
}

/* 中心秘核柔光 */
.rune-core {
  border-radius: 9999px;
  background: radial-gradient(circle, rgba(124, 106, 255, 0.14) 0%, transparent 65%);
}

@keyframes rune-spin {
  to { transform: rotate(360deg); }
}

@keyframes rune-spin-reverse {
  to { transform: rotate(-360deg); }
}

/* 大屏时符文推得更远 */
@media (min-width: 640px) {
  .rune-glyph {
    --rune-radius: -6.25rem;
    font-size: 1.125rem;
  }
}
</style>
