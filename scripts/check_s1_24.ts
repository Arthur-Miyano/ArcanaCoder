import { readFileSync } from 'fs'

const c = readFileSync('src/data/stage1_questions.ts', 'utf-8')
const idx = c.indexOf("id: 's1_24'")
if (idx < 0) { console.log('NOT FOUND'); process.exit(1) }
const block = c.substring(idx - 10, idx + 500)
console.log(block)
