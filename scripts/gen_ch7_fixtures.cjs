const fs = require('fs');
const sections = {s7_class:['s7_01','s7_02','s7_03','s7_04','s7_05'],s7_encap:['s7_06','s7_07','s7_08','s7_09','s7_10'],s7_inherit:['s7_11','s7_12','s7_13','s7_14','s7_15','s7_16'],s7_magic:['s7_17','s7_18','s7_19','s7_20','s7_21','s7_22']};
const types = {s7_01:'choice',s7_02:'code_fill',s7_03:'code_fill',s7_04:'code_fill',s7_05:'code_fix',s7_06:'choice',s7_07:'code_fill',s7_08:'code_fill',s7_09:'code_fix',s7_10:'output_predict',s7_11:'choice',s7_12:'code_fill',s7_13:'code_fill',s7_14:'code_fill',s7_15:'code_fix',s7_16:'output_predict',s7_17:'choice',s7_18:'code_fill',s7_19:'code_fill',s7_20:'code_fix',s7_21:'output_predict',s7_22:'free_coding'};
const idx = {s7_01:0,s7_06:0,s7_10:0,s7_11:0,s7_16:1,s7_17:0,s7_21:1};
for (const [secId, ids] of Object.entries(sections)) {
  const fixtures = ids.map(id => ({id,type:types[id],chapterId:'ch7_oop',correctIndex:idx[id]!==undefined?idx[id]:undefined,correctCode:null,validationMode:'exact',sectionId:secId}));
  fs.writeFileSync('e2e/fixtures/'+secId+'.json', JSON.stringify(fixtures, null, 2));
  console.log(secId+'.json');
}
