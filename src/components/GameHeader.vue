<script setup lang="ts">
import MageAvatar from './MageAvatar.vue'

defineProps<{
  level: number
  exp: number
  expToNext: number
  expPercent: number
}>()
</script>

<template>
  <div
    class="flex items-center gap-3 px-4 py-2 border-b border-arcane-500/15 bg-abyss-900/60 backdrop-blur-md"
  >
    <div class="relative shrink-0">
      <MageAvatar :size="36" />
      <span
        class="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full border border-gold-500/50 bg-abyss-850 text-[9px] leading-none text-gold-400"
        >✦</span
      >
    </div>

    <div class="flex-1 min-w-0">
      <div class="flex items-baseline gap-2">
        <span class="font-display text-sm font-semibold text-gold-400 text-glow-gold">贤者</span>
        <span class="text-xs text-mist-300">位阶 {{ level }}</span>
      </div>
      <div class="flex items-center gap-2 mt-1">
        <div class="rune-bar h-1.5 flex-1">
          <div class="rune-bar-fill" :style="{ width: `${expPercent}%` }" />
        </div>
        <span class="shrink-0 font-mono text-[11px] leading-none text-mist-400"
          >{{ exp }}/{{ expToNext }}</span
        >
      </div>
    </div>
  </div>
</template>
