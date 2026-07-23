<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { mountStarfield } from '@/composables/useParticles'

const el = ref<HTMLCanvasElement | null>(null)
let unmount: (() => void) | null = null

onMounted(() => {
  if (el.value) unmount = mountStarfield(el.value)
})

onBeforeUnmount(() => {
  unmount?.()
})
</script>

<template>
  <canvas
    ref="el"
    class="fixed inset-0 z-[-1] pointer-events-none"
    aria-hidden="true"
  ></canvas>
</template>
