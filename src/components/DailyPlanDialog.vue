<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useGameStore } from '@/stores/gameStore'
import { chapters } from '@/data/questions'
import { backupQuestions } from '@/data/backup_questions'

const emit = defineEmits<{ start: [] }>()

const store = useGameStore()
const step = ref<'time' | 'plan'>('time')
const selectedDuration = ref(60)

const weakPoints = computed(() => {
  const all = Object.values(store.knowledgeStates ?? {})
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
  if (!store.currentSectionId) return '无'
  for (const ch of chapters) {
    const sec = ch.sections.find((s) => s.id === store.currentSectionId)
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
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-abyss-950/80 backdrop-blur-md px-4">
    <!-- 时长选择 -->
    <div v-if="step === 'time'" class="arc-card animate-scale-in px-6 py-6 max-w-sm w-full space-y-5">
      <div class="flex items-center gap-3 pb-4">
        <div class="relative w-9 h-9 rounded-full bg-gradient-to-br from-arcane-400 to-arcane-700 shadow-glow-arcane shrink-0 flex items-center justify-center animate-glow-pulse" title="诺克斯">
          <span class="text-sm text-mist-100">✧</span>
        </div>
        <div>
          <p class="text-sm font-display font-bold text-arcane-200 text-glow-arcane">诺克斯</p>
          <p class="text-xs text-mist-400">源码之灵</p>
        </div>
      </div>
      <div class="arc-divider -mt-2"></div>

      <div>
        <p class="text-mist-200 leading-relaxed">嘿！贤者，今天打算修行多久？</p>
        <p class="text-xs text-mist-400 mt-1">我会根据时长为你安排今日计划。</p>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <button
          v-for="m in [30, 60, 120, 240]"
          :key="m"
          class="py-3 rounded-lg border text-sm font-medium transition-all duration-300"
          :class="selectedDuration === m
            ? 'border-gold-500/70 bg-gold-500/15 text-gold-300 shadow-glow-gold'
            : 'border-arcane-500/25 text-mist-300 bg-abyss-800/40 hover:border-arcane-400/60 hover:text-mist-100 hover:shadow-glow-arcane'"
          @click="selectedDuration = m"
        >
          {{ m >= 60 ? `${m / 60} 小时` : `${m} 分钟` }}
        </button>
      </div>

      <div class="flex items-center gap-3 px-3 py-2 border border-dashed border-arcane-500/30 rounded-lg bg-abyss-900/40">
        <input
          v-model.number="selectedDuration"
          type="number"
          class="arc-input flex-1 px-3 py-2 text-sm"
          min="5"
          max="480"
        />
        <span class="text-xs text-mist-400">分钟</span>
      </div>

      <button
        class="btn-arc w-full py-2.5 font-medium"
        @click="generate"
      >
        确认
      </button>
    </div>

    <!-- 每日计划 -->
    <div v-else class="arc-card animate-scale-in px-6 py-6 max-w-sm w-full space-y-4">
      <div class="flex items-center gap-3 pb-4">
        <div class="relative w-9 h-9 rounded-full bg-gradient-to-br from-arcane-400 to-arcane-700 shadow-glow-arcane shrink-0 flex items-center justify-center animate-glow-pulse" title="诺克斯">
          <span class="text-sm text-mist-100">✧</span>
        </div>
        <div>
          <p class="text-sm font-display font-bold text-arcane-200 text-glow-arcane">诺克斯</p>
          <p class="text-xs text-mist-400">源码之灵</p>
        </div>
      </div>
      <div class="arc-divider -mt-1"></div>

      <p class="text-sm font-display font-bold text-gold-300 text-glow-gold">今日计划（{{ planText }}）：</p>

      <div v-if="weakPoints.length > 0" class="px-4 py-3 bg-abyss-900/50 border-l-2 border-gold-500 rounded-lg space-y-1">
        <p class="text-xs text-gold-400 font-bold tracking-widest">薄 弱 巩 固</p>
        <p v-for="wp in weakPoints" :key="wp.tag" class="text-sm text-mist-200">
          {{ wp.tag }} — 掌握度 {{ Math.round(wp.mastery * 100) }}%（{{ wp.backupCount }} 道备用题）
        </p>
        <p class="text-xs text-mist-400 italic pt-1 border-t border-arcane-500/20 mt-1">
          我当年也在这个地方栽过，花括号里放变量名别忘了 f 前缀！
        </p>
      </div>

      <div class="px-4 py-3 bg-abyss-900/50 border-l-2 border-arcane-500 rounded-lg space-y-1">
        <p class="text-xs text-arcane-300 font-bold tracking-widest">主 线 推 进</p>
        <p class="text-sm text-mist-200">{{ currentSectionName || '无' }}</p>
      </div>

      <div v-if="weakPoints.length === 0" class="px-4 py-3 bg-abyss-900/50 border border-arcane-500/25 rounded-lg">
        <p class="text-xs text-arcane-300">目前没有薄弱知识点，贤者！可以直接推进主线。</p>
      </div>

      <p class="text-xs text-mist-400 text-center font-bold tracking-wider">
        预计用时：{{ planText }}
      </p>

      <div class="flex gap-3">
        <button
          class="btn-ghost flex-1 py-2.5 font-medium"
          @click="step = 'time'"
        >
          我再看看
        </button>
        <button
          class="btn-arc flex-1 py-2.5 font-medium"
          @click="dismiss"
        >
          开始修行
        </button>
      </div>
    </div>
  </div>
</template>
