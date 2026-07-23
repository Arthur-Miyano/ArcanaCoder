<script setup lang="ts">
/**
 * 位阶提升仪式：全屏光环扩散 + 金色粒子雨 + 位阶数字。
 * 自动播放 2.8s 后结束，也可点击跳过。
 */
import { onMounted, onBeforeUnmount } from 'vue'
import { burst, rain } from '@/composables/useParticles'

const props = defineProps<{ level: number }>()
const emit = defineEmits<{ done: [] }>()

let timer: number | undefined

onMounted(() => {
  rain(130)
  burst(window.innerWidth / 2, window.innerHeight * 0.42, { count: 70, speed: 340 })
  timer = window.setTimeout(() => emit('done'), 2800)
})

onBeforeUnmount(() => window.clearTimeout(timer))
</script>

<template>
  <div
    class="fixed inset-0 z-[90] flex items-center justify-center cursor-pointer
      bg-abyss-950/70 backdrop-blur-sm animate-fade-in"
    @click="emit('done')"
  >
    <!-- 扩散光环 -->
    <div class="fx-ring"></div>
    <div class="fx-ring" style="animation-delay: 0.35s"></div>
    <div class="fx-ring" style="animation-delay: 0.7s"></div>

    <div class="relative text-center space-y-3 animate-scale-in select-none">
      <p class="text-gold-500/80 text-sm tracking-[0.5em]">✦ ⚜ ✦</p>
      <h2 class="title-display text-3xl sm:text-4xl text-mist-100 text-glow-arcane">
        位阶提升
      </h2>
      <p class="font-display font-bold text-7xl sm:text-8xl text-gold-300 text-glow-gold animate-float-slow">
        {{ props.level }}
      </p>
      <p class="text-mist-300 text-sm tracking-widest">法则在你体内沉淀得愈发深厚</p>
    </div>
  </div>
</template>
