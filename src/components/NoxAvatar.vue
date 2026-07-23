<script setup lang="ts">
/**
 * 诺克斯（源码之灵）SVG 头像：星紫灵体 + 新月 + 星点 + 虚线星轨。
 * 手工矢量，替代原 nox-reference.png。
 */
import { computed } from 'vue'

withDefaults(defineProps<{ size?: number }>(), { size: 36 })

const uid = Math.random().toString(36).slice(2, 8)
const bgId = computed(() => `nox-bg-${uid}`)
const glowId = computed(() => `nox-glow-${uid}`)
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 64 64"
    fill="none"
    role="img"
    aria-label="诺克斯"
    class="shrink-0 rounded-full"
  >
    <defs>
      <radialGradient :id="bgId" cx="38%" cy="32%" r="75%">
        <stop offset="0%" stop-color="#6a54e8" />
        <stop offset="55%" stop-color="#2a2f6e" />
        <stop offset="100%" stop-color="#0d1226" />
      </radialGradient>
      <radialGradient :id="glowId" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#ecd27a" stop-opacity="0.9" />
        <stop offset="100%" stop-color="#ecd27a" stop-opacity="0" />
      </radialGradient>
    </defs>

    <!-- 底 -->
    <circle cx="32" cy="32" r="30" :fill="`url(#${bgId})`" />
    <circle cx="32" cy="32" r="30" stroke="#9d8cff" stroke-opacity="0.55" stroke-width="1.2" />

    <!-- 星轨 -->
    <ellipse
      cx="32" cy="34" rx="24" ry="9"
      stroke="#b3a6ff" stroke-opacity="0.45" stroke-width="0.8"
      stroke-dasharray="2.5 3.5" transform="rotate(-18 32 34)"
    />

    <!-- 灵体光晕 -->
    <circle cx="26" cy="26" r="12" :fill="`url(#${glowId})`" opacity="0.35" />

    <!-- 新月 -->
    <path
      d="M38 16a11 11 0 1 0 8 18 13 13 0 0 1-8-18z"
      fill="#ecd27a" opacity="0.95"
    />

    <!-- 星点 -->
    <path d="M20 20l1.1 2.6 2.6 1.1-2.6 1.1L20 27.4l-1.1-2.6-2.6-1.1 2.6-1.1L20 20z" fill="#eef0fa" />
    <circle cx="46" cy="42" r="1.6" fill="#b3a6ff" />
    <circle cx="17" cy="42" r="1.2" fill="#9d8cff" opacity="0.8" />

    <!-- 双眼（灵体） -->
    <circle cx="27" cy="36" r="2.2" fill="#eef0fa" />
    <circle cx="37" cy="36" r="2.2" fill="#eef0fa" />
    <circle cx="27.7" cy="35.4" r="0.8" fill="#7c6aff" />
    <circle cx="37.7" cy="35.4" r="0.8" fill="#7c6aff" />
  </svg>
</template>
