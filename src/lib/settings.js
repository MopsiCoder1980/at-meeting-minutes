import 'server-only'
import { neon } from '@neondatabase/serverless'

function getDb() {
     if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set')
     return neon(process.env.DATABASE_URL)
}

async function ensureSettingsTable() {
     const sql = getDb()
     await sql`
    CREATE TABLE IF NOT EXISTS settings (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `
}

export async function getSetting(key, defaultValue = null) {
     await ensureSettingsTable()
     const sql = getDb()
     const rows = await sql`SELECT value FROM settings WHERE key = ${key}`
     return rows[0]?.value ?? defaultValue
}

export async function setSetting(key, value) {
     await ensureSettingsTable()
     const sql = getDb()
     await sql`
    INSERT INTO settings (key, value) VALUES (${key}, ${String(value)})
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
  `
}

export async function getPageSize() {
     const value = await getSetting('pageSize', '10')
     const n = parseInt(value, 10)
     return Number.isFinite(n) && n > 0 ? n : 10
}
