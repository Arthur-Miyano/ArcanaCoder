<script setup lang="ts">
defineProps<{
  level: number
  exp: number
  expToNext: number
  expPercent: number
}>()
</script>

<template>
  <div class="flex items-center gap-3 px-4 py-2 border-b border-gray-700 bg-magic-card/50">
    <div
      class="w-7 h-7 rounded-full bg-[#4B0082] border-2 border-[#c9a227] shrink-0"
      title="贤者"
    />

    <div class="flex-1 min-w-0">
      <div class="flex items-baseline gap-2">
        <span class="text-magic-gold font-bold text-xs">贤者</span>
        <span class="text-gray-300 text-xs">位阶 {{ level }}</span>
      </div>
      <div class="flex items-center gap-2 mt-0.5">
        <div class="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
          <div
            class="h-full bg-gradient-to-r from-[#4B0082] to-[#c9a227] transition-all duration-500 rounded-full"
            :style="{ width: `${expPercent}%` }"
          />
        </div>
        <span class="text-xs text-gray-400 shrink-0 leading-none">{{ exp }}/{{ expToNext }}</span>
      </div>
    </div>
  </div>
</template>
