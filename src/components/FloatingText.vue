<script setup lang="ts">
/**
 * 飘字组件：在视口指定坐标浮现文本，向上漂移并淡出（如 "+20 EXP"）。
 * 动画结束后通过 done 事件通知父组件移除。
 */
defineProps<{ text: string; x: number; y: number }>()
const emit = defineEmits<{ done: [] }>()
</script>

<template>
  <div
    class="fx-float-text"
    :style="{ left: `${x}px`, top: `${y}px` }"
    aria-hidden="true"
    @animationend="emit('done')"
  >
    {{ text }}
  </div>
</template>
