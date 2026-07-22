import { openDB, type IDBPDatabase } from 'idb'
import type { GameState } from '@/stores/gameStore'

const DB_NAME = 'ArcanaCoder'
const DB_VERSION = 2
const STORE_NAME = 'gameState'
const ERROR_STORE_NAME = 'errorLog'
const STATE_KEY = 'main'
const MAX_DB_RETRIES = 3
const MAX_ERROR_LOG = 50

let dbPromise: Promise<IDBPDatabase> | null = null
let dbRetries = 0

function getDb(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME)
        }
        if (!db.objectStoreNames.contains(ERROR_STORE_NAME)) {
          db.createObjectStore(ERROR_STORE_NAME, { keyPath: 'id', autoIncrement: true })
        }
      },
    }).catch(async (err) => {
      dbPromise = null
      dbRetries++
      if (dbRetries <= MAX_DB_RETRIES) {
        return getDb()
      }
      dbRetries = 0
      throw err
    })
  }
  return dbPromise
}

export async function saveGameState(state: GameState): Promise<void> {
  const db = await getDb()
  const plain = JSON.parse(JSON.stringify(state))
  await db.put(STORE_NAME, { id: STATE_KEY, state: plain, updatedAt: Date.now() }, STATE_KEY)
}

export async function loadGameState(): Promise<GameState | null> {
  const db = await getDb()
  const record = await db.get(STORE_NAME, STATE_KEY)
  return record?.state ?? null
}

export interface ErrorLogEntry {
  message: string
  source?: string
  lineno?: number
  colno?: number
  stack?: string
  url: string
  timestamp: number
}

export async function saveErrorLog(entry: ErrorLogEntry): Promise<void> {
  try {
    const db = await getDb()
    await db.add(ERROR_STORE_NAME, entry)
    // 限制错误日志数量，防止无限增长
    const count = await db.count(ERROR_STORE_NAME)
    if (count > MAX_ERROR_LOG) {
      const cursor = await db.transaction(ERROR_STORE_NAME, 'readwrite').store.openCursor()
      let deleted = 0
      while (cursor && deleted < count - MAX_ERROR_LOG) {
        cursor.delete()
        cursor.continue()
        deleted++
      }
    }
  } catch {
    // 错误日志写入失败不抛出（避免递归）
  }
}
