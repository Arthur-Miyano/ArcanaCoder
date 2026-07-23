<script setup lang="ts">
/**
 * 贤者（玩家法师）SVG 头像：几何剪影风——尖顶法帽 + 长袍 + 法杖光球。
 * 手工矢量，替代原 mage-portrait.png / mage-fullbody.png。
 * full=true 时显示全身（带法杖与袍摆），用于章节完成页。
 */
import { computed } from 'vue'

withDefaults(
  defineProps<{ size?: number; full?: boolean }>(),
  { size: 40, full: false },
)

const uid = Math.random().toString(36).slice(2, 8)
const bgId = computed(() => `mage-bg-${uid}`)
const robeId = computed(() => `mage-robe-${uid}`)
const orbId = computed(() => `mage-orb-${uid}`)
</script>

<template>
  <svg
    :width="size"
    :height="full ? size * 1.4 : size"
    :viewBox="full ? '0 0 64 90' : '0 0 64 64'"
    fill="none"
    role="img"
    aria-label="贤者"
    :class="full ? '' : 'shrink-0 rounded-full'"
  >
    <defs>
      <radialGradient :id="bgId" cx="42%" cy="30%" r="80%">
        <stop offset="0%" stop-color="#3a3f8f" />
        <stop offset="60%" stop-color="#1a1f4a" />
        <stop offset="100%" stop-color="#0b0f22" />
      </radialGradient>
      <linearGradient :id="robeId" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#5442c4" />
        <stop offset="100%" stop-color="#2a2a72" />
      </linearGradient>
      <radialGradient :id="orbId" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#f4e3a1" />
        <stop offset="45%" stop-color="#d4af37" stop-opacity="0.85" />
        <stop offset="100%" stop-color="#d4af37" stop-opacity="0" />
      </radialGradient>
    </defs>

    <!-- 头像底（全身版无边框圆底） -->
    <circle v-if="!full" cx="32" cy="32" r="30" :fill="`url(#${bgId})`" />
    <circle v-if="!full" cx="32" cy="32" r="30" stroke="#d4af37" stroke-opacity="0.55" stroke-width="1.2" />
    <ellipse v-else cx="32" cy="86" rx="18" ry="3" fill="#04060d" opacity="0.55" />

    <!-- 尖顶法帽 -->
    <path
      d="M32 6c-2.2 4.5-6.8 12.6-11 17.4-1.3 1.5-.6 2.6 1.2 2.6h19.6c1.8 0 2.5-1.1 1.2-2.6C38.8 18.6 34.2 10.5 32 6z"
      :fill="`url(#${robeId})`"
    />
    <!-- 帽尖弯钩 -->
    <path d="M32 6c1.8 1.2 4.4 1.6 6 1" stroke="#7c6aff" stroke-width="1.6" stroke-linecap="round" />
    <!-- 帽檐金带 -->
    <path d="M22.6 21.4h18.8l1 2.2c.4 1-.2 2.4-1.6 2.4H23.2c-1.4 0-2-1.4-1.6-2.4l1-2.2z" fill="#d4af37" opacity="0.9" />
    <!-- 帽檐 -->
    <ellipse cx="32" cy="26" rx="15" ry="3.2" fill="#2a2a72" stroke="#7c6aff" stroke-opacity="0.5" stroke-width="0.8" />

    <!-- 面部阴影 -->
    <ellipse cx="32" cy="30" rx="7" ry="4" fill="#0b0f22" opacity="0.85" />
    <!-- 眼中微光 -->
    <circle cx="29.5" cy="30" r="1.1" fill="#ecd27a" />
    <circle cx="34.5" cy="30" r="1.1" fill="#ecd27a" />

    <!-- 长袍肩部 -->
    <path
      d="M18 44c2.5-6.5 7.5-9.5 14-9.5s11.5 3 14 9.5l2 8H16l2-8z"
      :fill="`url(#${robeId})`"
    />
    <!-- 胸前金纹 -->
    <path d="M32 36v14" stroke="#d4af37" stroke-opacity="0.7" stroke-width="1.2" stroke-dasharray="3 2.5" />

    <template v-if="full">
      <!-- 袍摆 -->
      <path d="M16 52h32l3.5 26c.3 2-1 4-3.2 4H15.7c-2.2 0-3.5-2-3.2-4L16 52z" :fill="`url(#${robeId})`" opacity="0.95" />
      <path d="M32 52v28" stroke="#d4af37" stroke-opacity="0.5" stroke-width="1" stroke-dasharray="3 3" />
      <!-- 法杖 -->
      <rect x="47" y="34" width="2.4" ry="1.2" height="48" fill="#4a3a22" />
      <!-- 杖顶光球 -->
      <circle cx="48.2" cy="30" r="8" :fill="`url(#${orbId})`" opacity="0.75" />
      <circle cx="48.2" cy="30" r="3.4" fill="#ecd27a" />
      <path d="M48.2 24l.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9.9-2.1z" fill="#fff7dd" />
    </template>
  </svg>
</template>
