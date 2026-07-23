<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useQuiz } from '@/composables/useQuiz'
import { burst } from '@/composables/useParticles'
import { calcExpGained } from '@/constants/progression'
import ChoiceQuestion from './ChoiceQuestion.vue'
import CodeQuestion from './CodeQuestion.vue'
import OutputPredict from './OutputPredict.vue'
import NoxDialog from './NoxDialog.vue'
import FeedbackPanel from './FeedbackPanel.vue'
import FloatingText from './FloatingText.vue'

const props = defineProps<{ chapterId: string }>()
const emit = defineEmits<{ back: []; reviewKnowledge: []; chapterComplete: [] }>()

const {
  questions, currentIndex, currentQuestion, isLastQuestion,
  userAnswer, showFeedback, lastResult, submitting,
  showResults, showSectionComplete, sectionResults,
  noxHint, accuracyInfo,
  submit, nextQuestion, goBack,
  retryAll, retrySingle, retrySectionWrong,
} = useQuiz(props.chapterId, {
  back: () => emit('back'),
  reviewKnowledge: () => emit('reviewKnowledge'),
  chapterComplete: () => emit('chapterComplete'),
})

// 类型适配：子组件 v-model 预期 number|string 而非联合类型
const choiceAnswer = computed({
  get: () => typeof userAnswer.value === 'number' ? userAnswer.value : null,
  set: (v: number | null) => { userAnswer.value = v },
})
const codeAnswer = computed({
  get: () => typeof userAnswer.value === 'string' ? userAnswer.value : '',
  set: (v: string) => { userAnswer.value = v },
})

// ---------- 游戏反馈特效 ----------
const combo = ref(0)
const comboKey = ref(0) // 触发 fx-combo 重新播放
const shaking = ref(false)
const goldFlash = ref(0)
const redFlash = ref(0)
const floaters = ref<{ id: number; text: string; x: number; y: number }[]>([])
let floaterId = 0

watch(showFeedback, (visible) => {
  if (!visible || !lastResult.value || !currentQuestion.value) return

  if (lastResult.value.correct) {
    combo.value++
    const exp = calcExpGained(currentQuestion.value.type, true)
    floaters.value.push({
      id: ++floaterId,
      text: `+${exp} EXP`,
      x: window.innerWidth / 2,
      y: window.innerHeight * 0.72,
    })
    burst(window.innerWidth / 2, window.innerHeight * 0.6)
    goldFlash.value++
    if (combo.value >= 2) comboKey.value++
  } else {
    combo.value = 0
    shaking.value = true
    redFlash.value++
    setTimeout(() => { shaking.value = false }, 500)
  }
})

function removeFloater(id: number) {
  floaters.value = floaters.value.filter((f) => f.id !== id)
}
</script>

<template>
  <div class="flex flex-col flex-1">
    <!-- 游戏反馈特效层 -->
    <div v-if="goldFlash" :key="`g${goldFlash}`" class="fx-edge fx-edge-gold"></div>
    <div v-if="redFlash" :key="`r${redFlash}`" class="fx-edge fx-edge-red"></div>
    <div v-if="comboKey" :key="`c${comboKey}`" class="fx-combo">魔力连击 ×{{ combo }}</div>
    <FloatingText
      v-for="f in floaters"
      :key="f.id"
      :text="f.text"
      :x="f.x"
      :y="f.y"
      @done="removeFloater(f.id)"
    />

    <!-- 结果总览 -->
    <div v-if="showResults" class="flex-1 flex flex-col">
      <div class="flex items-center justify-between px-4 py-2 border-b border-arcane-500/15">
        <button class="text-xs text-mist-400 hover:text-mist-100 transition-colors" @click="goBack">
          ← 返回
        </button>
        <span class="text-xs text-mist-400 tracking-widest">试炼结果</span>
      </div>

      <div class="flex-1 overflow-y-auto px-4 py-6">
        <div class="max-w-md mx-auto">
          <div class="arc-card px-5 py-6 sm:px-8 space-y-4 animate-fade-up">
            <div class="text-center">
              <div
                class="w-14 h-14 mx-auto rounded-full mb-3 flex items-center justify-center
                  bg-gradient-to-br from-arcane-500 to-arcane-700 border-2 border-gold-500/70
                  shadow-glow-gold text-gold-200 text-xl animate-float-slow"
              >
                ⚜
              </div>
              <h2 class="title-display text-xl text-gold-300 text-glow-gold">试炼完成</h2>
              <p class="text-sm text-mist-300 mt-1">
                {{ accuracyInfo.correct }}/{{ accuracyInfo.total }} 魔力共鸣
              </p>
              <div class="mt-4 rune-bar">
                <div
                  class="rune-bar-fill"
                  :class="accuracyInfo.wrongIds.length === 0 ? 'rune-bar-fill-gold' : ''"
                  :style="{ width: `${accuracyInfo.total ? (accuracyInfo.correct / accuracyInfo.total) * 100 : 0}%` }"
                />
              </div>
            </div>

            <template v-if="accuracyInfo.wrongIds.length > 0">
              <div class="arc-divider" />
              <div class="space-y-2">
                <p class="text-xs text-mist-400">需要重新施展的试炼：</p>
                <button
                  v-for="qId in accuracyInfo.wrongIds"
                  :key="qId"
                  class="w-full text-left px-3 py-2 rounded-lg border border-red-500/30 bg-red-500/10
                    text-sm text-red-200 transition-all duration-300
                    hover:border-red-400/50 hover:bg-red-500/15"
                  @click="retrySingle(qId)"
                >
                  ✗ 第{{ questions.findIndex((q) => q.id === qId) + 1 }}题
                </button>

                <div v-if="accuracyInfo.knowledgeTags.length > 0" class="pt-3">
                  <p class="text-xs text-mist-400 mb-1.5">建议复习的知识点：</p>
                  <div class="flex flex-wrap gap-1.5">
                    <span
                      v-for="tag in accuracyInfo.knowledgeTags"
                      :key="tag"
                      class="px-2 py-0.5 rounded-full bg-abyss-700/60 border border-arcane-500/20
                        text-xs text-mist-200"
                    >
                      {{ tag }}
                    </span>
                  </div>
                  <button
                    class="mt-3 text-xs text-gold-300 hover:text-gold-200 transition-colors"
                    @click="emit('reviewKnowledge')"
                  >
                    ← 打开智慧之书复习
                  </button>
                </div>
              </div>
            </template>

            <div class="pt-3 flex gap-3">
              <button
                v-if="accuracyInfo.wrongIds.length > 0"
                class="btn-gold flex-1"
                @click="retryAll"
              >
                重试错题
              </button>
              <button
                class="btn-arc flex-1"
                @click="goBack"
              >
                返回关卡
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 节完成 -->
    <div v-else-if="showSectionComplete && sectionResults" class="flex-1 flex flex-col">
      <div class="flex-1 overflow-y-auto px-4 py-6">
        <div class="max-w-md mx-auto">
          <div class="arc-card px-5 py-6 sm:px-8 text-center space-y-4 animate-fade-up">
            <div
              class="w-14 h-14 mx-auto rounded-full flex items-center justify-center
                bg-gradient-to-br from-arcane-500 to-arcane-700 border-2 border-gold-500/70
                shadow-glow-gold text-gold-200 text-xl animate-float-slow"
            >
              ✦
            </div>
            <h2 class="title-display text-xl text-gold-300 text-glow-gold">节完成</h2>
            <p class="text-sm text-mist-300">
              {{ sectionResults.correct }}/{{ sectionResults.total }} 魔力共鸣
            </p>
            <div class="rune-bar">
              <div
                class="rune-bar-fill rune-bar-fill-gold"
                :style="{ width: `${(sectionResults.correct / sectionResults.total) * 100}%` }"
              />
            </div>
            <div
              v-if="sectionResults.wrongIds.length > 0"
              class="rounded-xl border border-red-500/25 bg-red-500/5 px-4 py-3 text-left"
            >
              <p class="text-xs text-red-300 mb-1">需要重新施展的试炼：{{ sectionResults.wrongIds.length }} 道</p>
              <button
                class="btn-gold mt-2 px-4 py-1.5 text-sm"
                @click="retrySectionWrong"
              >
                重试错题
              </button>
            </div>
            <div
              v-else
              class="rounded-xl border border-gold-500/25 bg-gold-500/5 px-4 py-3"
            >
              <p class="text-xs text-gold-300">全部魔力共鸣，继续前进吧，贤者。</p>
            </div>
            <button
              class="btn-arc px-8"
              @click="emit('back')"
            >
              返回
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 答题面板 -->
    <div v-else-if="currentQuestion" class="flex-1 flex flex-col">
      <div class="border-b border-arcane-500/15 bg-abyss-900/50 backdrop-blur-sm">
        <div class="flex items-center justify-between px-4 py-2">
          <button class="text-xs text-mist-400 hover:text-mist-100 transition-colors" @click="goBack">
            ← 返回
          </button>
          <span class="text-xs text-mist-300 font-mono tracking-wider">
            第 {{ currentIndex + 1 }}/{{ questions.length }} 题
          </span>
          <button
            class="text-xs text-gold-300 hover:text-gold-200 transition-colors"
            @click="emit('reviewKnowledge')"
          >
            知识
          </button>
        </div>
        <div class="rune-bar rounded-none h-1">
          <div
            class="rune-bar-fill"
            :style="{ width: `${questions.length ? ((currentIndex + 1) / questions.length) * 100 : 0}%` }"
          />
        </div>
      </div>

      <div class="flex-1 overflow-y-auto px-4 py-6">
        <div
          class="max-w-2xl mx-auto w-full arc-card px-5 py-6 sm:px-8 space-y-6 animate-fade-up"
          :class="shaking ? 'fx-shake' : ''"
        >
          <h2 class="title-display text-lg sm:text-xl text-mist-100 text-glow-arcane">
            {{ currentQuestion.narrativeTitle || currentQuestion.title }}
          </h2>

          <p
            v-if="currentQuestion.narrativeDesc"
            class="text-mist-200 leading-relaxed whitespace-pre-wrap"
          >
            {{ currentQuestion.narrativeDesc }}
          </p>

          <ChoiceQuestion
            :key="currentQuestion.id"
            v-if="currentQuestion.type === 'choice'"
            :question="currentQuestion"
            v-model="choiceAnswer"
          />

          <CodeQuestion
            :key="currentQuestion.id"
            v-else-if="currentQuestion.type === 'code_fill' || currentQuestion.type === 'code_fix' || currentQuestion.type === 'free_coding'"
            :question="currentQuestion"
            v-model="codeAnswer"
          />

          <OutputPredict
            :key="currentQuestion.id"
            v-else-if="currentQuestion.type === 'output_predict'"
            :question="currentQuestion"
            v-model="choiceAnswer"
          />

          <NoxDialog :message="noxHint" />
        </div>
      </div>

      <FeedbackPanel
        v-if="showFeedback && lastResult && currentQuestion"
        :correct="lastResult.correct"
        :explanation="lastResult.explanation"
        :correct-answer="lastResult.correctAnswer"
        :error-detail="lastResult.errorDetail"
        :diff="lastResult.diff"
        :code-hints="lastResult.codeHints"
        :question="currentQuestion"
        :user-code="typeof userAnswer === 'string' ? userAnswer : undefined"
        @next="nextQuestion"
      />

      <div v-else class="px-4 py-3 border-t border-arcane-500/15 bg-abyss-900/50 backdrop-blur-sm">
        <button
          data-testid="btn-submit"
          :data-executing="submitting ? 'true' : 'false'"
          class="btn-arc btn-charge w-full shine-sweep"
          :disabled="userAnswer === null || userAnswer === '' || submitting"
          @click="submit"
        >
          {{ submitting ? '魔力解析中...' : '注入魔力' }}
        </button>
      </div>
    </div>

    <div v-else class="flex-1 flex items-center justify-center text-mist-400 text-sm">
      试炼尚未就绪
    </div>

  </div>
</template>
