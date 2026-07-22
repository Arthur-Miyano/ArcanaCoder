import type { KnowledgeState } from '@/types'

/**
 * 连续答对多少次视为完全掌握。
 */
export const MASTERY_CONSECUTIVE_THRESHOLD = 3

/**
 * 掌握度计算中的尝试次数奖励上限。
 * 达到此尝试次数后，volumeBonus 不再增加。
 */
export const MASTERY_VOLUME_BONUS_CAP = 5

/**
 * 计算某个知识点的掌握度（0-1）。
 *
 * 算法：
 * 1. 如果连续答对达到阈值，直接视为 1.0（完全掌握）。
 * 2. 否则，掌握度 = 正确率 × (0.5 + 0.5 × 体积奖励)。
 *    体积奖励基于总尝试次数，上限为 MASTERY_VOLUME_BONUS_CAP。
 *
 * @param ks 知识点状态
 */
export function calcMastery(ks: KnowledgeState | null | undefined): number {
  if (!ks || ks.totalAttempts === 0) return 0
  if (ks.consecutiveCorrect >= MASTERY_CONSECUTIVE_THRESHOLD) return 1.0

  const baseRate = ks.correctAttempts / ks.totalAttempts
  const volumeBonus = Math.min(ks.totalAttempts / MASTERY_VOLUME_BONUS_CAP, 1)
  return baseRate * (0.5 + 0.5 * volumeBonus)
}
