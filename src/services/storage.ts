import { openDB, type IDBPDatabase } from 'idb'
import type { GameState } from '@/stores/gameStore'

const DB_NAME = 'ArcanaCoder'
const DB_VERSION = 1
const STORE_NAME = 'gameState'
const STATE_KEY = 'main'

let dbPromise: Promise<IDBPDatabase> | null = null

function getDb(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME)
        }
      },
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
