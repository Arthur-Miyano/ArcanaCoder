<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { initPyodide, isReady } from '@/services/pyodide'

const emit = defineEmits<{ ready: [] }>()

const progress = ref(0)
const stageText = ref('准备召唤贤者...')

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

onMounted(async () => {
  if (isReady()) {
    progress.value = 100
    stageText.value = '贤者已就位！'
    emit('ready')
    return
  }

  await initPyodide((pct) => {
    progress.value = pct
    stageText.value = getStageText(pct)
  })

  stageText.value = '贤者已就位！'
  setTimeout(() => {
    if (!isReady()) return
    emit('ready')
  }, 400)
})
</script>

<template>
  <div class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-magic-bg">
    <div
      class="w-16 h-16 rounded-full bg-[#4B0082] border-2 border-[#c9a227] mb-6"
    />

    <p class="text-xl text-magic-gold mb-4">{{ stageText }}</p>
    <p class="text-sm text-gray-400 mb-6">{{ progress }}%</p>

    <div class="w-64 h-3 bg-gray-700 rounded-full overflow-hidden">
      <div
        class="h-full bg-gradient-to-r from-[#4B0082] to-[#c9a227] transition-all duration-300 rounded-full"
        :style="{ width: `${progress}%` }"
      />
    </div>
  </div>
</template>
