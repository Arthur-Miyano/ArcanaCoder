<script setup lang="ts">
defineProps<{
  message: string
}>()
</script>

<template>
  <div class="flex items-start gap-3 px-4 py-3">
    <div
      class="w-4 h-4 rounded-full bg-[#FFFAFA] border border-blue-300 shrink-0 mt-1"
      title="诺克斯"
    />
    <div class="flex-1 bg-magic-card border border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-200">
      {{ message }}
    </div>
  </div>
</template>
