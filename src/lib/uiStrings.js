import 'server-only'
import { neon } from '@neondatabase/serverless'
import { unstable_cache } from 'next/cache'
import { DEFAULT_STRINGS, unflatten } from './uiStringsData'
import { getDefaultLocale } from './locales'

export { DEFAULT_STRINGS, STRING_GROUPS } from './uiStringsData'

function getDb() {
     if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set')
     return neon(process.env.DATABASE_URL)
}

async function ensureTable() {
     const sql = getDb()

     // Check existing columns for migration from old single-locale schema
     const cols = await sql`
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'ui_strings'
  `
     if (cols.length === 0) {
          await sql`
      CREATE TABLE ui_strings (
        locale TEXT NOT NULL,
        key    TEXT NOT NULL,
        value  TEXT NOT NULL,
        PRIMARY KEY (locale, key)
      )
    `
     } else if (!cols.find(c => c.column_name === 'locale')) {
          // Migrate old (key, value) schema to new (locale, key, value) schema
          await sql`ALTER TABLE ui_strings ADD COLUMN locale TEXT NOT NULL DEFAULT 'de'`
          await sql`ALTER TABLE ui_strings DROP CONSTRAINT IF EXISTS ui_strings_pkey`
          await sql`ALTER TABLE ui_strings ADD PRIMARY KEY (locale, key)`
     }
}

/** Returns flat key→value map for a locale (for admin editing) */
async function fetchStringsFlat(locale) {
     await ensureTable()
     const sql = getDb()
     const defaultLocale = await getDefaultLocale()

     const rows = await sql`SELECT key, value FROM ui_strings WHERE locale = ${locale}`
     const localeMap = Object.fromEntries(rows.map(r => [r.key, r.value]))

     if (locale !== defaultLocale) {
          const defRows = await sql`SELECT key, value FROM ui_strings WHERE locale = ${defaultLocale}`
          const defMap = Object.fromEntries(defRows.map(r => [r.key, r.value]))
          return { ...DEFAULT_STRINGS, ...defMap, ...localeMap }
     }

     return { ...DEFAULT_STRINGS, ...localeMap }
}

/** Returns nested messages object for next-intl (per locale, with fallback chain) */
async function fetchMessages(locale) {
     const flat = await fetchStringsFlat(locale)
     return unflatten(flat)
}

const makeGetStrings = (locale) =>
     unstable_cache(
          () => fetchStringsFlat(locale),
          [`ui-strings-flat-${locale}`],
          { tags: [`ui-strings-${locale}`, 'ui-strings'] }
     )

const makeGetMessages = (locale) =>
     unstable_cache(
          () => fetchMessages(locale),
          [`ui-strings-messages-${locale}`],
          { tags: [`ui-strings-${locale}`, 'ui-strings'] }
     )

/** Flat strings for admin UI */
export async function getStringsFlat(locale) {
     return makeGetStrings(locale)()
}

/** Nested messages for next-intl */
export async function getMessages(locale) {
     return makeGetMessages(locale)()
}

/** Save strings for a specific locale */
export async function setStrings(locale, updates) {
     await ensureTable()
     const sql = getDb()
     const defaultLocale = await getDefaultLocale()

     // For non-default locales: load default values to compare against
     let defaultValues = DEFAULT_STRINGS
     if (locale !== defaultLocale) {
          const defRows = await sql`SELECT key, value FROM ui_strings WHERE locale = ${defaultLocale}`
          const defMap = Object.fromEntries(defRows.map(r => [r.key, r.value]))
          defaultValues = { ...DEFAULT_STRINGS, ...defMap }
     }

     for (const [key, value] of Object.entries(updates)) {
          if (!(key in DEFAULT_STRINGS)) continue

          if (locale !== defaultLocale && value === defaultValues[key]) {
               // Value is identical to the default — remove any stored override so
               // the fallback chain applies instead of storing redundant German text
               await sql`DELETE FROM ui_strings WHERE locale = ${locale} AND key = ${key}`
          } else {
               await sql`
          INSERT INTO ui_strings (locale, key, value) VALUES (${locale}, ${key}, ${value})
          ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value
        `
          }
     }
}
