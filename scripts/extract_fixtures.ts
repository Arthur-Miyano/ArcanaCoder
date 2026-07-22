import { writeFileSync, mkdirSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { questions, chapters } from '../src/data/questions'
import { backupQuestions } from '../src/data/backup_questions'

interface FixtureItem {
  id: string
  type: string
  chapterId: string
  sectionId?: string
  correctIndex?: number
  correctCode?: string | null
  validationMode?: string | null
}

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const FIXTURES_DIR = path.resolve(__dirname, '../e2e/fixtures')

// 按 section 分组
function extractBySection() {
  const all: FixtureItem[] = questions.map(q => {
    const item: FixtureItem = {
      id: q.id,
      type: q.type,
      chapterId: q.chapterId,
      correctIndex: (q.type === 'choice' || q.type === 'output_predict') ? q.correctOption : undefined,
      correctCode: (q.type === 'code_fill' || q.type === 'code_fix' || q.type === 'free_coding') ? q.correctCode ?? null : null,
      validationMode: q.validationMode ?? null,
    }
    return item
  })

  // 找到每个 question 对应的 sectionId
  const qToSection = new Map<string, string>()
  for (const ch of chapters) {
    for (const sec of ch.sections) {
      for (const qId of sec.questionIds) {
        qToSection.set(qId, sec.id)
      }
    }
  }

  // 按 section 分组
  const grouped: Record<string, FixtureItem[]> = {}
  for (const q of all) {
    const secId = qToSection.get(q.id)
    if (!secId) continue
    if (!grouped[secId]) grouped[secId] = []
    grouped[secId].push({ ...q, sectionId: secId })
  }

  return grouped
}

function extractAllCorrect() {
  const all: FixtureItem[] = questions.map(q => ({
    id: q.id,
    type: q.type,
    chapterId: q.chapterId,
    correctIndex: (q.type === 'choice' || q.type === 'output_predict') ? q.correctOption : undefined,
    correctCode: (q.type === 'code_fill' || q.type === 'code_fix' || q.type === 'free_coding') ? q.correctCode ?? null : null,
    validationMode: q.validationMode ?? null,
  }))
  return all
}

// main
mkdirSync(FIXTURES_DIR, { recursive: true })

// === 按 section 输出（用于场景 A 按节拆分）===
const bySection = extractBySection()
for (const [secId, items] of Object.entries(bySection)) {
  writeFileSync(
    path.join(FIXTURES_DIR, `${secId}.json`),
    JSON.stringify(items, null, 2),
  )
  console.log(`  ${secId}.json: ${items.length} 题`)
}

// === 全量输出（用于场景 B/C/D）===
const all = extractAllCorrect()
writeFileSync(
  path.join(FIXTURES_DIR, 'all_questions.json'),
  JSON.stringify(all, null, 2),
)
console.log(`  all_questions.json: ${all.length} 题`)

// === ch1 的 section 分组摘要 ===
console.log('\nch1 sections:')
for (const ch of chapters.filter(c => c.id === 'ch1_variables')) {
  for (const sec of ch.sections) {
    console.log(`  ${sec.id}: ${sec.questionIds.length} 题 (${sec.name})`)
  }
}

console.log('\nch2 sections:')
for (const ch of chapters.filter(c => c.id === 'ch2_strings')) {
  for (const sec of ch.sections) {
    console.log(`  ${sec.id}: ${sec.questionIds.length} 题 (${sec.name})`)
  }
}

console.log('\nbackup questions:', backupQuestions.length, '题')
console.log('done')
