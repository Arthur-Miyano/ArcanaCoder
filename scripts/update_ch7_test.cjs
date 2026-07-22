const fs = require('fs');
let c = fs.readFileSync('e2e/tests/scenario_all.spec.ts', 'utf-8');

// TITLE_MAP
c = c.replace("'安全读取': 's6_20',", "'安全读取': 's6_20',\n" +
  "  '图纸绘制': 's7_01', '实例化': 's7_02', '初始化': 's7_03', '对象行为': 's7_04', '图纸纠错': 's7_05',\n" +
  "  '公开属性': 's7_06', '内部封存': 's7_07', '优雅访问': 's7_08', '封装纠错': 's7_09', '封装验证': 's7_10',\n" +
  "  '血脉传承': 's7_11', '继承方法': 's7_12', '个性表达': 's7_13', '传承与创新': 's7_14', '传承纠错': 's7_15', '多级继承': 's7_16',\n" +
  "  '字符描述': 's7_17', '自我介绍': 's7_18', '长度魔法': 's7_19', '魔法纠错': 's7_20', '魔法总汇': 's7_21', '综合建模': 's7_22',");

// SECTION_BTNS
c = c.replace("'s6_pathlib': '路径术式',", "'s6_pathlib': '路径术式',\n   's7_class': '图纸绘制', 's7_encap': '内部封存', 's7_inherit': '血脉传承', 's7_magic': '魔法之术',");

// SECTIONS
c = c.replace("['s6_pathlib', '后端城 · 异常', '路径术式'],", "['s6_pathlib', '后端城 · 异常', '路径术式'],\n   ['s7_class', '数据库森林 · 对象', '图纸绘制'],\n   ['s7_encap', '数据库森林 · 对象', '公开属性'],\n   ['s7_inherit', '数据库森林 · 对象', '血脉传承'],\n   ['s7_magic', '数据库森林 · 对象', '字符描述'],");

// unlockStore
c = c.replace("'s6_basics','s6_adv','s6_raise','s6_pathlib'", "'s6_basics','s6_adv','s6_raise','s6_pathlib','s7_class','s7_encap','s7_inherit','s7_magic'");
c = c.replace("'ch6_errors'", "'ch6_errors','ch7_oop'");

// FIXTURE_UNSAFE
c = c.replace("'s6_20','", "'s6_20','s7_02','s7_03','s7_04','s7_05','s7_07','s7_08','s7_09','s7_12','s7_13','s7_14','s7_15','s7_18','s7_19','s7_20','s7_22','");

// wisdomViewed array
c = c.replace("'ch6_errors'", "'ch6_errors','ch7_oop'");

// unlockedChapters array  
c = c.replace("'ch6_errors']", "'ch6_errors','ch7_oop']");

fs.writeFileSync('e2e/tests/scenario_all.spec.ts', c, 'utf-8');
console.log('Updated');
