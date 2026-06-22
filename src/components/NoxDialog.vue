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
  <div class="flex items-start gap-3 px-4 py-2">
    <div
      class="w-4 h-4 rounded-full bg-[#FFFAFA] border border-blue-300 shrink-0 mt-0.5"
      title="诺克斯"
    />
    <div class="flex-1 bg-magic-card border border-gray-600 rounded-lg px-3 py-2 text-gray-200 leading-relaxed">
      <p v-if="!isLong || expanded">{{ message }}</p>
      <p v-else>{{ firstSentence }} <button class="text-magic-gold text-xs hover:text-yellow-300" @click="expanded = true">…展开</button></p>
    </div>
  </div>
</template>
