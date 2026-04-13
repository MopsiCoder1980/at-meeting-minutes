import 'server-only'
import { neon } from '@neondatabase/serverless'

function getDb() {
     if (!process.env.DATABASE_URL) {
          throw new Error('DATABASE_URL environment variable is not set')
     }
     return neon(process.env.DATABASE_URL)
}

async function ensureTable() {
     const sql = getDb()
     await sql`
    CREATE TABLE IF NOT EXISTS minutes (
      id          SERIAL PRIMARY KEY,
      title       TEXT    NOT NULL,
      content     TEXT    NOT NULL,
      owner_id    TEXT    NOT NULL,
      owner_name  TEXT    NOT NULL,
      visibility  TEXT    NOT NULL DEFAULT 'private',
      meeting_date TEXT,
      tags        TEXT    NOT NULL DEFAULT '[]',
      created_at  TEXT    NOT NULL,
      updated_at  TEXT    NOT NULL
    )
  `
     await sql`ALTER TABLE minutes ADD COLUMN IF NOT EXISTS folder_id INTEGER`
     await sql`ALTER TABLE minutes ADD COLUMN IF NOT EXISTS project_title TEXT`
     await sql`ALTER TABLE minutes ADD COLUMN IF NOT EXISTS structure TEXT`
     await sql`ALTER TABLE minutes ADD COLUMN IF NOT EXISTS attachments TEXT`
}

const EMPTY_STRUCTURE = { attendees: { meetingOwners: [], agendaOwners: [], attendees: [] }, topics: [], decisions: [], actionItems: [], openQuestions: [] }

function rowToMinute(row) {
     let structure = EMPTY_STRUCTURE
     if (row.structure) {
          try { structure = JSON.parse(row.structure) } catch { /* ignore */ }
     }
     return {
          id: String(row.id),
          projectTitle: row.project_title ?? '',
          title: row.title,
          content: row.content,
          structure,
          ownerId: row.owner_id,
          ownerName: row.owner_name,
          visibility: row.visibility,
          meetingDate: row.meeting_date ?? null,
          tags: typeof row.tags === 'string' ? JSON.parse(row.tags) : row.tags,
          folderId: row.folder_id ? String(row.folder_id) : null,
          attachments: (() => { try { return JSON.parse(row.attachments || '[]') } catch { return [] } })(),
          createdAt: row.created_at,
          updatedAt: row.updated_at,
     }
}

export async function getAllMinutes() {
     await ensureTable()
     const sql = getDb()
     const rows = await sql`SELECT * FROM minutes ORDER BY created_at DESC`
     return rows.map(rowToMinute)
}

export async function getMinuteById(id) {
     await ensureTable()
     const sql = getDb()
     const rows = await sql`SELECT * FROM minutes WHERE id = ${id}`
     return rows[0] ? rowToMinute(rows[0]) : null
}

export async function createMinute({ title, projectTitle = '', content, structure = null, ownerId, ownerName, visibility = 'private', meetingDate = null, tags = [], folderId = null, attachments = [] }) {
     await ensureTable()
     const sql = getDb()
     const now = new Date().toISOString()
     const rows = await sql`
    INSERT INTO minutes (title, project_title, content, structure, owner_id, owner_name, visibility, meeting_date, tags, folder_id, attachments, created_at, updated_at)
    VALUES (${title}, ${projectTitle}, ${content}, ${JSON.stringify(structure ?? {})}, ${ownerId}, ${ownerName}, ${visibility}, ${meetingDate}, ${JSON.stringify(tags)}, ${folderId ?? null}, ${JSON.stringify(attachments)}, ${now}, ${now})
    RETURNING *
  `
     return rowToMinute(rows[0])
}

export async function updateMinute(id, updates) {
     const existing = await getMinuteById(id)
     if (!existing) return null

     const sql = getDb()
     const merged = {
          title: updates.title ?? existing.title,
          projectTitle: updates.projectTitle !== undefined ? updates.projectTitle : existing.projectTitle,
          content: updates.content ?? existing.content,
          structure: updates.structure !== undefined ? updates.structure : existing.structure,
          visibility: updates.visibility ?? existing.visibility,
          meetingDate: updates.meetingDate !== undefined ? updates.meetingDate : existing.meetingDate,
          tags: updates.tags ?? existing.tags,
          folderId: updates.folderId !== undefined ? updates.folderId : existing.folderId,
          attachments: updates.attachments !== undefined ? updates.attachments : existing.attachments,
          updatedAt: new Date().toISOString(),
     }

     const rows = await sql`
    UPDATE minutes
    SET title = ${merged.title}, project_title = ${merged.projectTitle}, content = ${merged.content},
        structure = ${JSON.stringify(merged.structure ?? {})}, visibility = ${merged.visibility},
        meeting_date = ${merged.meetingDate}, tags = ${JSON.stringify(merged.tags)},
        folder_id = ${merged.folderId ?? null}, attachments = ${JSON.stringify(merged.attachments ?? [])},
        updated_at = ${merged.updatedAt}
    WHERE id = ${id}
    RETURNING *
  `
     return rows[0] ? rowToMinute(rows[0]) : null
}

export async function deleteMinute(id) {
     const sql = getDb()
     const rows = await sql`DELETE FROM minutes WHERE id = ${id} RETURNING id`
     return rows.length > 0
}

export async function getAllTags() {
     await ensureTable()
     const sql = getDb()
     const rows = await sql`SELECT tags FROM minutes`
     const tagSet = new Set()
     for (const row of rows) {
          const tags = typeof row.tags === 'string' ? JSON.parse(row.tags) : row.tags
          for (const tag of tags) {
               tagSet.add(tag)
          }
     }
     return Array.from(tagSet).sort()
}
