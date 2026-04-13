import { getAuthUser, canView } from '@/lib/auth'
import { getMinuteById } from '@/lib/store'
import { readFile } from 'fs/promises'
import path from 'path'

export const dynamic = 'force-dynamic'

const UPLOAD_DIR = process.env.UPLOAD_DIR ?? path.join(process.cwd(), 'uploads')

const MIME_TYPES = {
     jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png',
     gif: 'image/gif', webp: 'image/webp', svg: 'image/svg+xml',
     pdf: 'application/pdf',
     doc: 'application/msword',
     docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
     xls: 'application/vnd.ms-excel',
     xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
     ppt: 'application/vnd.ms-powerpoint',
     pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
}

function getMime(filename) {
     const ext = filename.split('.').pop()?.toLowerCase() ?? ''
     return MIME_TYPES[ext] ?? 'application/octet-stream'
}

export async function GET(request, { params }) {
     const segments = (await params).path

     if (!segments || segments.length < 2) {
          return new Response('Not found', { status: 404 })
     }

     const [minuteId, ...rest] = segments
     const filename = rest.join('/')

     // Prevent path traversal before any auth check
     const filePath = path.join(UPLOAD_DIR, minuteId, filename)
     const resolved = path.resolve(filePath)
     const base = path.resolve(UPLOAD_DIR)
     if (!resolved.startsWith(base + path.sep) && resolved !== base) {
          return new Response('Not found', { status: 404 })
     }

     const [authUser, minute] = await Promise.all([
          getAuthUser(),
          getMinuteById(minuteId),
     ])

     if (!minute || !canView(authUser, minute)) {
          return new Response('Not found', { status: 404 })
     }

     try {
          const buffer = await readFile(resolved)
          const mimeType = getMime(filename)

          return new Response(buffer, {
               headers: {
                    'Content-Type': mimeType,
                    'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
                    'Cache-Control': 'private, no-cache',
               },
          })
     } catch {
          return new Response('Not found', { status: 404 })
     }
}
