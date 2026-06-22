<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useGameStore } from '@/stores/gameStore'
import GameHeader from './GameHeader.vue'

const emit = defineEmits<{ backToChapters: [] }>()

const store = useGameStore()

defineProps<{
  chapterId: string
}>()

const visible = ref(false)

onMounted(() => {
  setTimeout(() => { visible.value = true }, 100)
})
</script>

<template>
  <div class="flex flex-col flex-1">
    <GameHeader
      :level="store.level"
      :exp="store.exp"
      :exp-to-next="store.expToNext"
      :exp-percent="store.expPercent"
    />

    <div class="flex-1 flex flex-col items-center justify-center px-6 text-center">
      <Transition
        enter-active-class="transition-all duration-500"
        enter-from-class="opacity-0 scale-75"
      >
        <div v-if="visible" class="space-y-4">
          <div
            class="w-12 h-12 mx-auto rounded-full bg-[#4B0082] border-2 border-[#c9a227]"
          />

          <h1 class="text-xl font-bold text-magic-gold">关卡通过！</h1>

          <p class="text-sm text-gray-300 leading-relaxed">
            贤者正在研读你留下的魔法印记…
          </p>

          <div class="pt-4">
            <button
              class="px-6 py-2.5 rounded font-medium bg-[#4B0082] hover:bg-[#5a0099] text-white transition-colors"
              @click="emit('backToChapters')"
            >
              返回关卡选择
            </button>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>
