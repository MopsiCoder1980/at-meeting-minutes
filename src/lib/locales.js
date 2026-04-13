import 'server-only'
import { neon } from '@neondatabase/serverless'

function getDb() {
     if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set')
     return neon(process.env.DATABASE_URL)
}

async function ensureLocalesTable() {
     const sql = getDb()
     await sql`
    CREATE TABLE IF NOT EXISTS locales (
      code       TEXT PRIMARY KEY,
      label      TEXT NOT NULL,
      is_default BOOLEAN NOT NULL DEFAULT FALSE
    )
  `
     // Seed German as default if table is empty
     const existing = await sql`SELECT code FROM locales`
     if (existing.length === 0) {
          await sql`INSERT INTO locales (code, label, is_default) VALUES ('de', 'Deutsch', TRUE)`
     }
}

export async function getAllLocales() {
     await ensureLocalesTable()
     const sql = getDb()
     return sql`SELECT code, label, is_default FROM locales ORDER BY is_default DESC, code ASC`
}

export async function getDefaultLocale() {
     await ensureLocalesTable()
     const sql = getDb()
     const rows = await sql`SELECT code FROM locales WHERE is_default = TRUE LIMIT 1`
     return rows[0]?.code ?? 'de'
}

export async function createLocale({ code, label }) {
     await ensureLocalesTable()
     const sql = getDb()
     await sql`
    INSERT INTO locales (code, label, is_default) VALUES (${code}, ${label}, FALSE)
  `
}

export async function deleteLocale(code) {
     const sql = getDb()
     // Don't delete the last/default locale
     await sql`DELETE FROM locales WHERE code = ${code} AND is_default = FALSE`
     // Also remove its strings
     await sql`DELETE FROM ui_strings WHERE locale = ${code}`
}

export async function setDefaultLocale(code) {
     const sql = getDb()
     await sql`UPDATE locales SET is_default = FALSE`
     await sql`UPDATE locales SET is_default = TRUE WHERE code = ${code}`
}
