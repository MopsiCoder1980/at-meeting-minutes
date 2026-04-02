import 'server-only'
import { neon } from '@neondatabase/serverless'

function getDb() {
     if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set')
     return neon(process.env.DATABASE_URL)
}

async function ensureUsersTable() {
     const sql = getDb()
     await sql`
    CREATE TABLE IF NOT EXISTS users (
      id            SERIAL PRIMARY KEY,
      username      TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role          TEXT NOT NULL DEFAULT 'user',
      created_at    TEXT NOT NULL
    )
  `
}

export async function getUserByUsername(username) {
     await ensureUsersTable()
     const sql = getDb()
     const rows = await sql`SELECT * FROM users WHERE username = ${username}`
     return rows[0] ?? null
}

export async function getAllUsers() {
     await ensureUsersTable()
     const sql = getDb()
     const rows = await sql`SELECT id, username, role, created_at FROM users ORDER BY created_at DESC`
     return rows.map(r => ({ id: String(r.id), username: r.username, role: r.role, createdAt: r.created_at }))
}

export async function createUser({ username, passwordHash, role = 'user' }) {
     await ensureUsersTable()
     const sql = getDb()
     const now = new Date().toISOString()
     const rows = await sql`
    INSERT INTO users (username, password_hash, role, created_at)
    VALUES (${username}, ${passwordHash}, ${role}, ${now})
    RETURNING id, username, role, created_at
  `
     return rows[0]
}

export async function updatePasswordHash(id, passwordHash) {
     const sql = getDb()
     await sql`UPDATE users SET password_hash = ${passwordHash} WHERE id = ${id}`
}

export async function deleteUser(id) {
     const sql = getDb()
     await sql`DELETE FROM users WHERE id = ${id}`
}
