import type { QuestionType } from '@/types'

/**
 * 各题型基础经验值。
 * 经验是游戏化进度系统的核心参数，集中管理便于平衡性调整。
 */
export const EXP_TABLE: Record<QuestionType, number> = {
  choice: 10,
  output_predict: 15,
  code_fill: 20,
  code_fix: 20,
  free_coding: 30,
}

/**
 * 答错时获得的经验比例。
 * 当前为 1/3（向下取整），保证即使答错也有少量正反馈。
 */
export const WRONG_ANSWER_EXP_RATIO = 1 / 3

/**
 * 答错时的得分比例（百分制）。
 */
export const WRONG_ANSWER_SCORE_RATIO = 1 / 3

/**
 * 计算升到下一级所需经验。
 * @param level 当前位阶
 */
export function calcExpToNext(level: number): number {
  return 100 * level
}

/**
 * 根据答题结果计算获得的经验。
 * @param questionType 题型
 * @param correct 是否答对
 */
export function calcExpGained(questionType: QuestionType, correct: boolean): number {
  const baseExp = EXP_TABLE[questionType] || 10
  return correct ? baseExp : Math.max(1, Math.floor(baseExp * WRONG_ANSWER_EXP_RATIO))
}

/**
 * 根据答题结果计算得分（0-100）。
 * @param correct 是否答对
 */
export function calcScore(correct: boolean): number {
  return correct ? 100 : Math.floor(100 * WRONG_ANSWER_SCORE_RATIO)
}
