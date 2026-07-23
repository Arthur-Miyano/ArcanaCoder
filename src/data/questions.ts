import type { Chapter, Question } from '@/types'
import { stage1Questions } from './stage1_questions'
import { stage2Questions } from './stage2_questions'
import { stage3Questions } from './stage3_questions'
import { stage4Questions } from './stage4_questions'
import { stage5Questions } from './stage5_questions'
import { stage6Questions } from './stage6_questions'
import { stage7Questions } from './stage7_questions'
import { stage8Questions } from './stage8_questions'
import { stage9Questions } from './stage9_questions'
import { stage10Questions } from './stage10_questions'
export const chapters: Chapter[] = [
  {
    id: 'ch1_variables',
    name: '第 1 关：变量与类型',
    displayName: '语法圣殿',
    description: 'Python 的基础——变量赋值与数据类型',
    regionName: '语法圣殿',
    regionOrder: 0,
    sections: [
      { id: 's1_vars', name: '变量赋值', displayName: '符文铭刻', questionIds: ['s1_01', 's1_02', 's1_03', 's1_04', 's1_05'] },
      { id: 's1_types', name: '类型系统', displayName: '元素鉴定', questionIds: ['s1_06', 's1_07', 's1_08', 's1_09'], unlockAfter: 's1_vars' },
      { id: 's1_ops', name: '运算符与格式化', displayName: '术式推演', questionIds: ['s1_10', 's1_11', 's1_12', 's1_13', 's1_14', 's1_15', 's1_16', 's1_17', 's1_18', 's1_19'], unlockAfter: 's1_types' },
      { id: 's1_strings', name: '字符串与输出', displayName: '真言编织', questionIds: ['s1_20', 's1_21', 's1_22', 's1_23', 's1_24', 's1_25', 's1_26', 's1_27', 's1_28'], unlockAfter: 's1_ops' },
    ],
  },
  {
    id: 'ch2_strings',
    name: '第 2 关：字符串与输入输出',
    displayName: '爬虫山脉',
    description: '字符串的操作方法与格式化',
    regionName: '爬虫山脉',
    regionOrder: 1,
    sections: [
      { id: 's2_advanced', name: '字符串进阶', displayName: '字符串进阶', questionIds: ['s2_01', 's2_02', 's2_03', 's2_04', 's2_05', 's2_06', 's2_07'] },
      { id: 's2_methods', name: '字符串方法', displayName: '字符串方法', questionIds: ['s2_08', 's2_09', 's2_10', 's2_11', 's2_12', 's2_13', 's2_14'], unlockAfter: 's2_advanced' },
      { id: 's2_format', name: '判断与格式化', displayName: '判断与格式化', questionIds: ['s2_15', 's2_16', 's2_17', 's2_18', 's2_19', 's2_20'], unlockAfter: 's2_methods' },
    ],
  },
  {
    id: 'ch3_lists',
    name: '第 3 关：列表、元组、字典与集合',
    displayName: '数据结构卷宗',
    description: '四种内置数据结构',
    regionName: '爬虫山脉',
    regionOrder: 1,
    sections: [
      { id: 's3_list_basics', name: '列表基础', displayName: '列阵入门', questionIds: ['s3_01', 's3_02', 's3_03', 's3_04', 's3_05', 's3_06', 's3_07'] },
      { id: 's3_list_adv', name: '列表进阶', displayName: '列阵精通', questionIds: ['s3_08', 's3_09', 's3_10', 's3_11', 's3_12'], unlockAfter: 's3_list_basics' },
      { id: 's3_tuple_set', name: '元组与集合', displayName: '封印与熔炼', questionIds: ['s3_13', 's3_14', 's3_15', 's3_16', 's3_17', 's3_18'], unlockAfter: 's3_list_adv' },
      { id: 's3_dict', name: '字典', displayName: '图鉴编纂', questionIds: ['s3_19', 's3_20', 's3_21', 's3_22', 's3_23', 's3_24'], unlockAfter: 's3_tuple_set' },
    ],
  },
  {
    id: 'ch4_control',
    name: '第 4 关：条件判断与循环',
    displayName: '爬虫山脉 · 控制流',
    description: '控制流——条件判断与循环',
    regionName: '爬虫山脉',
    regionOrder: 1,
    sections: [
      { id: 's4_condition', name: '条件判断基础', displayName: '决断之术', questionIds: ['s4_01', 's4_02', 's4_03', 's4_04', 's4_05', 's4_06'] },
      { id: 's4_logic', name: '逻辑运算与嵌套', displayName: '复合判定', questionIds: ['s4_07', 's4_08', 's4_09', 's4_10', 's4_11'], unlockAfter: 's4_condition' },
      { id: 's4_for', name: 'for 循环', displayName: '遍历之法', questionIds: ['s4_12', 's4_13', 's4_14', 's4_15', 's4_16', 's4_17'], unlockAfter: 's4_logic' },
      { id: 's4_while', name: 'while 循环与综合', displayName: '持续之道', questionIds: ['s4_18', 's4_19', 's4_20', 's4_21', 's4_22'], unlockAfter: 's4_for' },
    ],
  },
  {
    id: 'ch5_functions',
    name: '第 5 关：函数与模块',
    displayName: '后端城 · 函数',
    description: '函数定义与模块使用',
    regionName: '后端城',
    regionOrder: 2,
    sections: [
      { id: 's5_basics', name: '函数基础', displayName: '术式封装', questionIds: ['s5_01', 's5_02', 's5_03', 's5_04', 's5_05'] },
      { id: 's5_params', name: '参数进阶', displayName: '精密参数', questionIds: ['s5_06', 's5_07', 's5_08', 's5_09', 's5_10'], unlockAfter: 's5_basics' },
      { id: 's5_apply', name: '函数应用', displayName: '批量操作', questionIds: ['s5_11', 's5_12', 's5_13', 's5_14', 's5_15'], unlockAfter: 's5_params' },
      { id: 's5_modules', name: '模块', displayName: '外援术式', questionIds: ['s5_16', 's5_17', 's5_18', 's5_19', 's5_20'], unlockAfter: 's5_apply' },
    ],
  },
  {
    id: 'ch6_errors',
    name: '第 6 关：异常处理与 pathlib',
    displayName: '后端城 · 异常',
    description: '异常处理与文件路径',
    regionName: '后端城',
    regionOrder: 2,
    sections: [
      { id: 's6_basics', name: '异常基础', displayName: '容错术式', questionIds: ['s6_01', 's6_02', 's6_03', 's6_04', 's6_05'] },
      { id: 's6_adv', name: '异常进阶', displayName: '精密容错', questionIds: ['s6_06', 's6_07', 's6_08', 's6_09', 's6_10'], unlockAfter: 's6_basics' },
      { id: 's6_raise', name: 'raise 与断言', displayName: '主动预警', questionIds: ['s6_11', 's6_12', 's6_13', 's6_14', 's6_15'], unlockAfter: 's6_adv' },
      { id: 's6_pathlib', name: 'pathlib', displayName: '路径术式', questionIds: ['s6_16', 's6_17', 's6_18', 's6_19', 's6_20'], unlockAfter: 's6_raise' },
    ],
  },
  {
    id: 'ch7_oop',
    name: '第 7 关：面向对象',
    displayName: '数据库森林 · 对象',
    description: '类与对象、继承、魔术方法',
    regionName: '数据库森林',
    regionOrder: 3,
    sections: [
      { id: 's7_class', name: '类与对象', displayName: '图纸绘制', questionIds: ['s7_01', 's7_02', 's7_03', 's7_04', 's7_05'] },
      { id: 's7_encap', name: '属性与封装', displayName: '内部封存', questionIds: ['s7_06', 's7_07', 's7_08', 's7_09', 's7_10'], unlockAfter: 's7_class' },
      { id: 's7_inherit', name: '继承', displayName: '血脉传承', questionIds: ['s7_11', 's7_12', 's7_13', 's7_14', 's7_15', 's7_16'], unlockAfter: 's7_encap' },
      { id: 's7_magic', name: '魔术方法与综合', displayName: '魔法之术', questionIds: ['s7_17', 's7_18', 's7_19', 's7_20', 's7_21', 's7_22'], unlockAfter: 's7_inherit' },
    ],
  },
  {
    id: 'ch8_annotations', name: '第 8 关：类型注解、dataclass 与上下文管理器', displayName: '数据库森林 · 类型',
    description: '类型注解、dataclass、上下文管理器', regionName: '数据库森林', regionOrder: 3,
    sections: [
      { id: 's8_annot_basics', name: '类型注解基础', displayName: '类型标注', questionIds: ['s8_01','s8_02','s8_03','s8_04','s8_05'] },
      { id: 's8_annot_adv', name: '类型进阶', displayName: '泛型进阶', questionIds: ['s8_06','s8_07','s8_08','s8_09','s8_10'], unlockAfter: 's8_annot_basics' },
      { id: 's8_dataclass', name: 'dataclass', displayName: '数据类', questionIds: ['s8_11','s8_12','s8_13','s8_14','s8_15'], unlockAfter: 's8_annot_adv' },
      { id: 's8_context', name: '上下文管理器', displayName: '资源管理', questionIds: ['s8_16','s8_17','s8_18','s8_19','s8_20'], unlockAfter: 's8_dataclass' },
    ],
  },
  {
    id: 'ch9_testing', name: '第 9 关：pytest、logging 与 ruff', displayName: '前端海岸 · 质量',
    description: '测试、日志与代码规范', regionName: '前端海岸', regionOrder: 4,
    sections: [
      { id: 's9_pytest', name: 'pytest', displayName: '检验术式', questionIds: ['s9_01','s9_02','s9_03','s9_04','s9_05'] },
      { id: 's9_logging', name: 'logging', displayName: '日志之术', questionIds: ['s9_06','s9_07','s9_08','s9_09','s9_10'], unlockAfter: 's9_pytest' },
      { id: 's9_logadv', name: 'logging 进阶', displayName: '日志精深', questionIds: ['s9_11','s9_12','s9_13','s9_14'], unlockAfter: 's9_logging' },
      { id: 's9_ruff', name: 'ruff 规范', displayName: '代码之尺', questionIds: ['s9_15','s9_16','s9_17','s9_18'], unlockAfter: 's9_logadv' },
    ],
  },
  {
    id: 'ch10_async', name: '第 10 关：async/await、uv 与打包发布', displayName: '前端海岸 · 工程',
    description: '异步编程与现代工程实践', regionName: '前端海岸', regionOrder: 4,
    sections: [
      { id: 's10_async_basics', name: 'async 基础', displayName: '异步术式', questionIds: ['s10_01','s10_02','s10_03','s10_04','s10_05'] },
      { id: 's10_async_adv', name: 'async 进阶', displayName: '并发之术', questionIds: ['s10_06','s10_07','s10_08','s10_09'], unlockAfter: 's10_async_basics' },
      { id: 's10_uv', name: 'uv 与包管理', displayName: '包管理', questionIds: ['s10_10','s10_11','s10_12','s10_13','s10_14'], unlockAfter: 's10_async_adv' },
      { id: 's10_packaging', name: '打包发布', displayName: '发布之旅', questionIds: ['s10_15','s10_16','s10_17','s10_18'], unlockAfter: 's10_uv' },
    ],
  },
]

export const questions: Question[] = [
  ...stage1Questions,
  ...stage2Questions,
  ...stage3Questions,
  ...stage4Questions,
  ...stage5Questions,
  ...stage6Questions,
  ...stage7Questions,
  ...stage8Questions,
  ...stage9Questions,
  ...stage10Questions,
]

export function getQuestionsBySection(sectionId: string): Question[] {
  for (const ch of chapters) {
    const sec = ch.sections.find((s) => s.id === sectionId)
    if (sec) {
      return sec.questionIds
        .map((id) => questions.find((q) => q.id === id))
        .filter((q): q is Question => q !== undefined)
    }
  }
  return []
}
