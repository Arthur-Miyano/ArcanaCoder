<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useGameStore } from '@/stores/gameStore'
import { chapters, questions } from '@/data/questions'
import { backupQuestions } from '@/data/backup_questions'

const emit = defineEmits<{ start: [] }>()

const store = useGameStore()
const step = ref<'time' | 'plan'>('time')
const selectedDuration = ref(60)

const weakPoints = computed(() => {
  const all = Object.values(store.state.knowledgeStates)
  return all
    .filter((ks) => store.getMastery(ks.knowledgeTag) < 0.7)
    .sort((a, b) => a.lastSeen - b.lastSeen)
    .slice(0, 3)
    .map((ks) => ({
      tag: ks.knowledgeTag,
      mastery: store.getMastery(ks.knowledgeTag),
      backupCount: Math.min(2, backupQuestions.filter((bq) => bq.knowledgeTags.includes(ks.knowledgeTag)).length),
    }))
})

const currentSectionName = computed(() => {
  if (!store.state.currentSectionId) return '无'
  for (const ch of chapters) {
    const sec = ch.sections.find((s) => s.id === store.state.currentSectionId)
    if (sec) return sec.name
  }
  return '无'
})

const planText = computed(() => {
  const h = Math.floor(selectedDuration.value / 60)
  const m = selectedDuration.value % 60
  const parts: string[] = []
  if (h > 0) parts.push(`${h} 小时`)
  if (m > 0) parts.push(`${m} 分钟`)
  return parts.join('') || '30 分钟'
})

function generate() {
  step.value = 'plan'
}

function dismiss() {
  emit('start')
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
    <!-- 时长选择 -->
    <div v-if="step === 'time'" class="bg-magic-card border border-gray-600 rounded-lg px-6 py-6 max-w-sm w-full mx-4 space-y-5">
      <div class="flex items-center gap-3 pb-4 border-b border-gray-700">
        <div class="w-5 h-5 rounded-full bg-[#FFFAFA] border border-blue-300 shrink-0" title="诺克斯" />
        <div>
          <p class="text-xs text-cyan-400 font-bold">诺克斯</p>
          <p class="text-xs text-gray-400">源码之灵</p>
        </div>
      </div>

      <div>
        <p class="text-gray-200 leading-relaxed">嘿！贤者，今天打算修行多久？</p>
        <p class="text-xs text-gray-500 mt-1">我会根据时长为你安排今日计划。</p>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <button
          v-for="m in [30, 60, 120, 240]"
          :key="m"
          class="py-3 rounded border text-sm font-medium transition-colors"
          :class="selectedDuration === m ? 'border-magic-gold bg-magic-gold/20 text-magic-gold' : 'border-gray-600 text-gray-400 hover:border-gray-500 bg-gray-800/50'"
          @click="selectedDuration = m"
        >
          {{ m >= 60 ? `${m / 60} 小时` : `${m} 分钟` }}
        </button>
      </div>

      <div class="flex items-center gap-3 px-3 py-2 border border-dashed border-gray-600 rounded">
        <input
          v-model.number="selectedDuration"
          type="number"
          class="flex-1 bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm text-gray-200 outline-none focus:border-magic-gold"
          min="5"
          max="480"
        />
        <span class="text-xs text-gray-500">分钟</span>
      </div>

      <button
        class="w-full py-2.5 rounded font-medium bg-magic-accent hover:bg-magic-accent-light text-white transition-colors"
        @click="generate"
      >
        确认
      </button>
    </div>

    <!-- 每日计划 -->
    <div v-else class="bg-magic-card border border-gray-600 rounded-lg px-6 py-6 max-w-sm w-full mx-4 space-y-4">
      <div class="flex items-center gap-3 pb-4 border-b border-gray-700">
        <div class="w-5 h-5 rounded-full bg-[#FFFAFA] border border-blue-300 shrink-0" title="诺克斯" />
        <div>
          <p class="text-xs text-cyan-400 font-bold">诺克斯</p>
          <p class="text-xs text-gray-400">源码之灵</p>
        </div>
      </div>

      <p class="text-sm text-gray-200 font-bold">今日计划（{{ planText }}）：</p>

      <div v-if="weakPoints.length > 0" class="px-4 py-3 bg-gray-900/50 border-l-4 border-red-500 rounded space-y-1">
        <p class="text-xs text-gray-500 font-bold tracking-wider">薄 弱 巩 固</p>
        <p v-for="wp in weakPoints" :key="wp.tag" class="text-sm text-gray-200">
          {{ wp.tag }} — 掌握度 {{ Math.round(wp.mastery * 100) }}%（{{ wp.backupCount }} 道备用题）
        </p>
        <p class="text-xs text-gray-500 italic pt-1 border-t border-gray-700 mt-1">
          我当年也在这个地方栽过，花括号里放变量名别忘了 f 前缀！
        </p>
      </div>

      <div class="px-4 py-3 bg-gray-900/50 border-l-4 border-cyan-500 rounded space-y-1">
        <p class="text-xs text-gray-500 font-bold tracking-wider">主 线 推 进</p>
        <p class="text-sm text-gray-200">{{ currentSectionName || '无' }}</p>
      </div>

      <div v-if="weakPoints.length === 0" class="px-4 py-3 bg-gray-900/50 border border-green-600/30 rounded">
        <p class="text-xs text-green-400">目前没有薄弱知识点，贤者！可以直接推进主线。</p>
      </div>

      <p class="text-xs text-gray-500 text-center font-bold">
        预计用时：{{ planText }}
      </p>

      <div class="flex gap-3">
        <button
          class="flex-1 py-2.5 rounded font-medium bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors"
          @click="step = 'time'"
        >
          我再看看
        </button>
        <button
          class="flex-1 py-2.5 rounded font-medium bg-magic-accent hover:bg-magic-accent-light text-white transition-colors"
          @click="dismiss"
        >
          开始修行
        </button>
      </div>
    </div>
  </div>
</template>
