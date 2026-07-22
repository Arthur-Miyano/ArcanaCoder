const fs = require('fs');
let c = fs.readFileSync('e2e/tests/scenario_all.spec.ts', 'utf-8');

// Add TITLE_MAP entries
c = c.replace("'借阅纠错': 's5_19', '综合统计': 's5_20',",
  "'借阅纠错': 's5_19', '综合统计': 's5_20',\n" +
  "  '容错术式': 's6_01', '除零保护': 's6_02', '万能防护': 's6_03', '容错路径': 's6_04', '捕获纠错': 's6_05',\n" +
  "  '错误分类': 's6_06', '无错分支': 's6_07', '最终执行': 's6_08', '完整流程': 's6_09', '异常纠错': 's6_10',\n" +
  "  '主动预警': 's6_11', '参数验证': 's6_12', '错误上报': 's6_13', '异常传导': 's6_14', '断言矫正': 's6_15',\n" +
  "  '路径术式': 's6_16', '路径组合': 's6_17', '路径信息': 's6_18', '路径纠错': 's6_19', '安全读取': 's6_20',");

// Add SECTION_BTNS
c = c.replace("'s5_modules': '外援术式',", "'s5_modules': '外援术式',\n   's6_basics': '容错术式', 's6_adv': '精密容错', 's6_raise': '主动预警', 's6_pathlib': '路径术式',");

// Add SECTIONS
c = c.replace("['s5_modules', '后端城 · 函数', '外援术式'],", "['s5_modules', '后端城 · 函数', '外援术式'],\n   ['s6_basics', '后端城 · 异常', '容错术式'],\n   ['s6_adv', '后端城 · 异常', '错误分类'],\n   ['s6_raise', '后端城 · 异常', '主动预警'],\n   ['s6_pathlib', '后端城 · 异常', '路径术式'],");

// Update unlockStore to include ch6
c = c.replace("'s5_basics','s5_params','s5_apply','s5_modules'", "'s5_basics','s5_params','s5_apply','s5_modules','s6_basics','s6_adv','s6_raise','s6_pathlib'");
c = c.replace("'ch5_functions'", "'ch5_functions','ch6_errors'");
c = c.replace("'ch5_functions','ch6_errors']", "'ch5_functions','ch6_errors']"); // already handled

fs.writeFileSync('e2e/tests/scenario_all.spec.ts', c, 'utf-8');
console.log('Updated test file');
