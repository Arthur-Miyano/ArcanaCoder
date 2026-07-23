<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useGameStore } from '@/stores/gameStore'
import { getQuestionsByChapter } from '@/data/questions'
import { burst, rain } from '@/composables/useParticles'
import GameHeader from './GameHeader.vue'

const props = defineProps<{
  chapterId: string
}>()

const emit = defineEmits<{ backToChapters: [] }>()

const store = useGameStore()
const visible = ref(false)

const questions = computed(() => getQuestionsByChapter(props.chapterId))
const accuracy = computed(() => store.getChapterAccuracy(props.chapterId))

const passed = computed(() => accuracy.value.wrongIds.length === 0)

onMounted(() => {
  setTimeout(() => { visible.value = true }, 100)
  if (passed.value) {
    // 通关仪式：粒子雨 + 中心迸发
    rain(140)
    burst(window.innerWidth / 2, window.innerHeight * 0.35, { count: 60, speed: 320 })
  }
})
</script>

<template>
  <div class="flex flex-col flex-1">
    <GameHeader
      :level="store.level"
      :exp="store.exp"
      :exp-to-next="store.expToNext"
      :exp-percent="store.expPercent"
    />

    <div class="relative flex-1 flex flex-col items-center justify-center px-6 text-center overflow-hidden">
      <!-- 仪式金色光晕 -->
      <div
        class="pointer-events-none absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 w-[26rem] h-[26rem] rounded-full halo-gold"
        :class="passed ? 'animate-glow-pulse' : 'opacity-40'"
      />
      <!-- 通关仪式：扩散光环 -->
      <template v-if="passed">
        <div class="fx-ring" style="top: 33%"></div>
        <div class="fx-ring" style="top: 33%; animation-delay: 0.4s"></div>
        <div class="fx-ring" style="top: 33%; animation-delay: 0.8s"></div>
      </template>
      <span class="pointer-events-none absolute left-[18%] top-[22%] text-gold-500/50 text-sm animate-twinkle">✦</span>
      <span class="pointer-events-none absolute right-[16%] top-[30%] text-arcane-400/50 text-xs animate-twinkle" style="animation-delay: 1.2s">✧</span>
      <span class="pointer-events-none absolute left-[24%] bottom-[24%] text-arcane-300/40 text-xs animate-twinkle" style="animation-delay: 2s">✧</span>
      <span class="pointer-events-none absolute right-[22%] bottom-[30%] text-gold-400/40 text-sm animate-twinkle" style="animation-delay: 0.6s">✦</span>

      <Transition
        enter-active-class="transition-opacity duration-500"
        enter-from-class="opacity-0"
      >
        <div v-if="visible" class="relative space-y-6 w-full max-w-md animate-scale-in">
          <img
            src="/assets/characters/mage/mage-fullbody.png"
            class="w-20 md:w-24 h-auto mx-auto animate-float-slow drop-shadow-[0_0_24px_rgba(212,175,55,0.35)]"
            :class="passed ? '' : 'opacity-70'"
          />

          <div class="space-y-2">
            <p class="font-display text-sm tracking-[0.4em] text-gold-500/80">✦ ⚜ ✦</p>
            <h1
              class="title-display text-4xl md:text-5xl"
              :class="passed ? 'text-gold-300 text-glow-gold' : 'text-mist-200 text-glow-arcane'"
            >
              {{ passed ? '关卡通过！' : '关卡完成' }}
            </h1>
            <div class="arc-divider w-32 mx-auto" />
          </div>

          <div class="arc-card px-5 py-5 md:px-6 text-left space-y-4">
            <div>
              <span class="text-xs tracking-widest text-mist-400">试炼结果</span>
              <div class="mt-2 flex items-center gap-3">
                <div class="rune-bar flex-1">
                  <div
                    class="rune-bar-fill transition-all duration-700"
                    :class="passed ? 'rune-bar-fill-gold' : ''"
                    :style="{ width: `${accuracy.total ? (accuracy.correct / accuracy.total) * 100 : 0}%` }"
                  />
                </div>
                <span class="font-display text-2xl md:text-3xl text-gold-200 shrink-0 leading-none">
                  {{ accuracy.correct }}<span class="text-mist-400 text-lg md:text-xl">/{{ accuracy.total }}</span>
                </span>
              </div>
            </div>

            <div v-if="accuracy.wrongIds.length > 0" class="pt-1 border-t border-arcane-700/30">
              <p class="text-xs text-red-300/90 mb-2 pt-2">波动不稳的试炼：{{ accuracy.wrongIds.length }} 道</p>
              <div v-if="accuracy.knowledgeTags.length > 0" class="flex flex-wrap gap-1.5">
                <span
                  v-for="tag in accuracy.knowledgeTags"
                  :key="tag"
                  class="px-2 py-0.5 rounded-full bg-red-950/40 border border-red-500/30 text-xs text-red-200"
                >
                  {{ tag }}
                </span>
              </div>
            </div>

            <div v-else class="pt-1 border-t border-gold-500/20">
              <p class="text-xs text-gold-300 pt-2">✦ 全部魔力共鸣，法则已刻入灵魂！ ✦</p>
            </div>
          </div>

          <div class="pt-2">
            <button
              class="btn-gold shine-sweep px-8 py-3 text-base"
              @click="emit('backToChapters')"
            >
              返回关卡选择
            </button>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.halo-gold {
  background: radial-gradient(
    circle,
    rgba(212, 175, 55, 0.22) 0%,
    rgba(124, 106, 255, 0.12) 42%,
    transparent 70%
  );
  filter: blur(8px);
}
</style>
