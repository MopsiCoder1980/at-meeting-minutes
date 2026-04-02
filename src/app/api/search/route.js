import { getAuthUser } from '@/lib/auth'
import { neon } from '@neondatabase/serverless'

export async function GET(request) {
     const authUser = await getAuthUser()
     if (!authUser) {
          return Response.json({ results: [] }, { status: 401 })
     }

     const { searchParams } = new URL(request.url)
     const q = searchParams.get('q')?.trim()
     if (!q || q.length < 2) {
          return Response.json({ results: [] })
     }

     const sql = neon(process.env.DATABASE_URL)
     const term = `%${q}%`

     let rows
     if (authUser.role === 'admin') {
          rows = await sql`
      SELECT id, title, visibility, meeting_date, tags, owner_name
      FROM minutes
      WHERE title ILIKE ${term}
         OR content ILIKE ${term}
         OR tags ILIKE ${term}
         OR owner_name ILIKE ${term}
      ORDER BY created_at DESC
      LIMIT 10
    `
     } else {
          rows = await sql`
      SELECT id, title, visibility, meeting_date, tags, owner_name
      FROM minutes
      WHERE (title ILIKE ${term} OR content ILIKE ${term} OR tags ILIKE ${term} OR owner_name ILIKE ${term})
        AND (owner_id = ${authUser.userId} OR visibility = 'shared')
      ORDER BY created_at DESC
      LIMIT 10
    `
     }

     const results = rows.map(row => ({
          id: String(row.id),
          title: row.title,
          visibility: row.visibility,
          meetingDate: row.meeting_date ?? null,
          tags: typeof row.tags === 'string' ? JSON.parse(row.tags) : row.tags,
          ownerName: row.owner_name,
     }))

     return Response.json({ results })
}
