<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { initPyodide, isReady } from '@/services/pyodide'

const emit = defineEmits<{ ready: [] }>()

const progress = ref(0)
const stageText = ref('准备召唤贤者...')
const error = ref<string | null>(null)

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

async function load() {
  error.value = null
  progress.value = 0
  stageText.value = '准备召唤贤者...'

  if (isReady()) {
    progress.value = 100
    stageText.value = '贤者已就位！'
    emit('ready')
    return
  }

  try {
    await initPyodide((pct) => {
      progress.value = pct
      stageText.value = getStageText(pct)
    })
    stageText.value = '贤者已就位！'
    setTimeout(() => {
      if (!isReady()) return
      emit('ready')
    }, 400)
  } catch (err: any) {
    error.value = `加载失败：${err.message ?? '未知错误'}`
    progress.value = 0
  }
}

onMounted(load)
</script>

<template>
  <div class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-magic-bg">
    <div
      class="w-16 h-16 rounded-full bg-magic-accent border-2 border-magic-gold mb-6"
    />

    <template v-if="!error">
      <p class="text-xl text-magic-gold mb-4">{{ stageText }}</p>
      <p class="text-sm text-gray-400 mb-6">{{ progress }}%</p>
      <div class="w-64 h-3 bg-gray-700 rounded-full overflow-hidden">
        <div
          class="h-full bg-gradient-to-r from-magic-accent to-magic-gold transition-all duration-300 rounded-full"
          :style="{ width: `${progress}%` }"
        />
      </div>
    </template>

    <template v-else>
      <p class="text-red-400 text-lg mb-2">⚠️ {{ error }}</p>
      <p class="text-sm text-gray-400 mb-6">请检查网络连接后重试</p>
      <button
        class="px-6 py-2 rounded font-medium bg-magic-accent hover:bg-magic-accent-light text-white transition-colors"
        @click="load"
      >
        重新加载
      </button>
    </template>
  </div>
</template>
