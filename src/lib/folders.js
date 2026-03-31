import 'server-only'
import { neon } from '@neondatabase/serverless'

function getDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set')
  }
  return neon(process.env.DATABASE_URL)
}

async function ensureFoldersTable() {
  const sql = getDb()
  await sql`
    CREATE TABLE IF NOT EXISTS folders (
      id         SERIAL PRIMARY KEY,
      name       TEXT NOT NULL,
      owner_id   TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
  `
}

function rowToFolder(row) {
  return {
    id:        String(row.id),
    name:      row.name,
    ownerId:   row.owner_id,
    createdAt: row.created_at,
  }
}

export async function getFoldersForUser() {
  await ensureFoldersTable()
  const sql = getDb()
  const rows = await sql`SELECT * FROM folders ORDER BY name ASC`
  return rows.map(rowToFolder)
}

export async function createFolder({ name, ownerId }) {
  await ensureFoldersTable()
  const sql = getDb()
  const now = new Date().toISOString()
  const rows = await sql`
    INSERT INTO folders (name, owner_id, created_at)
    VALUES (${name}, ${ownerId}, ${now})
    RETURNING *
  `
  return rowToFolder(rows[0])
}

export async function deleteFolder(id) {
  const sql = getDb()
  // unassign all minutes in this folder first
  await sql`UPDATE minutes SET folder_id = NULL WHERE folder_id = ${id}`
  const rows = await sql`DELETE FROM folders WHERE id = ${id} RETURNING id`
  return rows.length > 0
}

export async function moveMinuteToFolder(minuteId, folderId) {
  const sql = getDb()
  await sql`
    UPDATE minutes SET folder_id = ${folderId ?? null} WHERE id = ${minuteId}
  `
}

export async function getMinutesInFolder(folderId) {
  const sql = getDb()
  const rows = folderId === null
    ? await sql`SELECT * FROM minutes WHERE folder_id IS NULL ORDER BY created_at DESC`
    : await sql`SELECT * FROM minutes WHERE folder_id = ${folderId} ORDER BY created_at DESC`
  return rows
}
