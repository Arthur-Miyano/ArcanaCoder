const fs = require('fs');
let c = fs.readFileSync('e2e/tests/scenario_all.spec.ts', 'utf-8');

// TITLE_MAP entries
const T8 = "'类型标注': 's8_01', '参数标注': 's8_02', '返回值标注': 's8_03', '泛型标注': 's8_04', '类型纠错': 's8_05',\n  '可选标注': 's8_06', '联合类型': 's8_07', '任意类型': 's8_08', '泛型纠错': 's8_09', '运行验证': 's8_10',\n  '数据类': 's8_11', '定义数据类': 's8_12', '默认属性': 's8_13', '数据类纠错': 's8_14', '自动比较': 's8_15',\n  '资源管理': 's8_16', '文件读取': 's8_17', '自定义管理器': 's8_18', '管理器纠错': 's8_19', '综合应用': 's8_20',\n";
const T9 = "  '检验术式': 's9_01', '验证句式': 's9_02', '运行测试': 's9_03', '失败信息': 's9_04', '测试夹具': 's9_05',\n  '日志等级': 's9_06', '日志配置': 's9_07', '变量日志': 's9_08', '级别输出': 's9_09', 'Logger对象': 's9_10',\n  '格式定制': 's9_11', '日志到文件': 's9_12', '命名规范': 's9_13', '多种输出': 's9_14',\n  '代码检查': 's9_15', '命名规范PEP8': 's9_16', '自动修复': 's9_17', '格式规范': 's9_18',\n";
const T10 = "  '异步术式': 's10_01', '等待结果': 's10_02', '协程概念': 's10_03', '异步纠错': 's10_04', '执行顺序': 's10_05',\n  '入口函数': 's10_06', '异步等待': 's10_07', '并发执行': 's10_08', '并发顺序': 's10_09',\n  '新一代包管理': 's10_10', '隔离环境': 's10_11', '项目配置': 's10_12', '依赖管理': 's10_13', '安装包': 's10_14',\n  '项目字段': 's10_15', '语义化版本': 's10_16', '发布流程': 's10_17', '分发格式': 's10_18',\n";

c = c.replace("'综合建模': 's7_22',", "'综合建模': 's7_22',\n" + T8 + T9 + T10);

// SECTION_BTNS
c = c.replace("'s7_magic': '魔法之术',", "'s7_magic': '魔法之术',\n   's8_annot_basics': '类型标注', 's8_annot_adv': '泛型进阶', 's8_dataclass': '数据类', 's8_context': '资源管理',\n   's9_pytest': '检验术式', 's9_logging': '日志之术', 's9_logadv': '日志精深', 's9_ruff': '代码之尺',\n   's10_async_basics': '异步术式', 's10_async_adv': '并发之术', 's10_uv': '包管理', 's10_packaging': '发布之旅',");

// SECTIONS
const S8 = "   ['s8_annot_basics', '数据库森林 · 类型', '类型标注'],\n   ['s8_annot_adv', '数据库森林 · 类型', '可选标注'],\n   ['s8_dataclass', '数据库森林 · 类型', '数据类'],\n   ['s8_context', '数据库森林 · 类型', '资源管理'],\n";
const S9 = "   ['s9_pytest', '前端海岸 · 质量', '检验术式'],\n   ['s9_logging', '前端海岸 · 质量', '日志等级'],\n   ['s9_logadv', '前端海岸 · 质量', '格式定制'],\n   ['s9_ruff', '前端海岸 · 质量', '代码检查'],\n";
const S10 = "   ['s10_async_basics', '前端海岸 · 工程', '异步术式'],\n   ['s10_async_adv', '前端海岸 · 工程', '入口函数'],\n   ['s10_uv', '前端海岸 · 工程', '新一代包管理'],\n   ['s10_packaging', '前端海岸 · 工程', '项目字段'],\n";

c = c.replace("['s7_magic', '数据库森林 · 对象', '魔法总汇'],", "['s7_magic', '数据库森林 · 对象', '魔法总汇'],\n" + S8 + S9 + S10);

// unlockStore allSecs
c = c.replace("'s7_class','s7_encap','s7_inherit','s7_magic'", "'s7_class','s7_encap','s7_inherit','s7_magic','s8_annot_basics','s8_annot_adv','s8_dataclass','s8_context','s9_pytest','s9_logging','s9_logadv','s9_ruff','s10_async_basics','s10_async_adv','s10_uv','s10_packaging'");
c = c.replace("'ch7_oop'", "'ch7_oop','ch8_annotations','ch9_testing','ch10_async'");

fs.writeFileSync('e2e/tests/scenario_all.spec.ts', c, 'utf-8');
console.log('e2e test updated with ch8-ch10');
