<script setup lang="ts">
defineProps<{
  visible: boolean
  correct: boolean
  explanation: string
}>()

const emit = defineEmits<{ next: [] }>()
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 translate-y-4"
      leave-active-class="transition-all duration-200 ease-in"
      leave-to-class="opacity-0 translate-y-4"
    >
      <div
        v-if="visible"
        class="fixed inset-x-0 bottom-0 z-40 p-4"
      >
        <div
          :class="[
            'max-w-lg mx-auto rounded-lg border px-4 py-3 shadow-lg',
            correct
              ? 'bg-green-900/80 border-green-600'
              : 'bg-red-900/80 border-red-600',
          ]"
        >
          <div class="flex items-center gap-2 mb-2">
            <span
              :class="[
                'text-lg font-bold',
                correct ? 'text-green-300' : 'text-red-300',
              ]"
            >
              {{ correct ? '✓ 正确!' : '✗ 答错了' }}
            </span>
            <div
              :class="[
                'ml-auto w-6 h-6 rounded-full border',
                correct ? 'bg-green-600 border-green-400' : 'bg-red-600 border-red-400',
              ]"
              :title="correct ? '贤者开心' : '贤者困惑'"
            />
          </div>
          <p class="text-sm text-gray-200 leading-relaxed">{{ explanation }}</p>
          <button
            class="mt-3 px-4 py-1.5 rounded text-sm font-medium transition-colors bg-gray-600 hover:bg-gray-500 text-white"
            @click="emit('next')"
          >
            下一题
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
