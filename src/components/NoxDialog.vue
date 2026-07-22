<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  message: string
}>()

const expanded = ref(false)

const firstSentence = computed(() => {
  const m = props.message.trim()
  const dot = m.indexOf('。')
  if (dot > 0 && dot < 60) return m.slice(0, dot + 1)
  const ex = m.indexOf('！')
  if (ex > 0 && ex < 60) return m.slice(0, ex + 1)
  return m.slice(0, 40) + '…'
})

const isLong = computed(() => props.message.length > firstSentence.value.length + 5)
</script>

<template>
  <div class="flex items-start gap-3 px-4 py-2 animate-fade-in">
    <div class="relative shrink-0 mt-0.5">
      <img
        src="/assets/characters/nox/nox-reference.png"
        class="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-arcane-500/50 shadow-glow-arcane object-cover"
        title="诺克斯"
      />
      <span class="absolute -bottom-0.5 -right-0.5 text-gold-400 text-[10px] leading-none animate-twinkle select-none">✦</span>
    </div>
    <div class="arc-card relative flex-1 px-3.5 py-2.5 text-mist-200 text-sm leading-relaxed rounded-xl rounded-tl-sm">
      <span class="absolute -top-1.5 left-4 text-gold-500/70 text-[10px] tracking-widest select-none">✧ ☾ ✧</span>
      <p v-if="!isLong || expanded">{{ message }}</p>
      <p v-else>{{ firstSentence }} <button class="text-gold-400 text-xs font-medium hover:text-gold-200 hover:text-glow-gold transition-colors duration-200" @click="expanded = true">…展开</button></p>
    </div>
  </div>
</template>
