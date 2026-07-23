<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import NoxAvatar from './NoxAvatar.vue'

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

// ---------- 打字机效果 ----------
// 当前应展示的完整文本（折叠=首句，展开=全文）
const fullText = computed(() => (!isLong.value || expanded.value ? props.message : firstSentence.value))

const displayed = ref('')
const typing = ref(false)
let timer: number | undefined
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

watch(fullText, (text) => {
  window.clearInterval(timer)
  if (reducedMotion) {
    displayed.value = text
    typing.value = false
    return
  }
  displayed.value = ''
  typing.value = true
  let i = 0
  timer = window.setInterval(() => {
    i += 1
    displayed.value = text.slice(0, i)
    if (i >= text.length) {
      window.clearInterval(timer)
      typing.value = false
    }
  }, 28)
}, { immediate: true })

onBeforeUnmount(() => window.clearInterval(timer))
</script>

<template>
  <div class="flex items-start gap-3 animate-fade-in">
    <NoxAvatar :size="32" class="mt-0.5" />
    <div class="relative flex-1 rounded-xl rounded-tl-sm border border-arcane-500/12 bg-abyss-800/50 px-3.5 py-2.5 text-mist-300 text-sm leading-relaxed">
      <p v-if="!isLong || expanded">
        {{ displayed }}<span v-if="typing" class="text-arcane-300 animate-glow-pulse">▌</span>
      </p>
      <p v-else>
        {{ displayed }}<span v-if="typing" class="text-arcane-300 animate-glow-pulse">▌</span>
        <button
          v-if="!typing"
          class="text-gold-400 text-xs font-medium hover:text-gold-200 hover:text-glow-gold transition-colors duration-200"
          @click="expanded = true"
        >…展开</button>
      </p>
    </div>
  </div>
</template>
