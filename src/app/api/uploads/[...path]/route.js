import { getAuthUser, canView } from '@/lib/auth'
import { getMinuteById } from '@/lib/store'
import { readFile } from 'fs/promises'
import path from 'path'
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
     // segments[0] = minuteId, segments[1] = filename
     if (!segments || segments.length < 2) {
          return new Response('Not found', { status: 404 })
     }

     const [minuteId, ...rest] = segments
     const filename = rest.join('/')

     const [authUser, minute] = await Promise.all([getAuthUser(), getMinuteById(minuteId)])
     if (!minute || !canView(authUser, minute)) {
          return new Response('Not found', { status: 404 })
     }

     // Verify the requested file is actually an attachment of this minute
     const urlPath = `/api/uploads/${minuteId}/${filename}`
     const isKnown = minute.attachments?.some(a => a.url === urlPath)
     if (!isKnown) {
          return new Response('Not found', { status: 404 })
     }

     try {
          const filePath = path.join(UPLOAD_DIR, minuteId, filename)
          // Prevent path traversal
          const resolved = path.resolve(filePath)
          const base = path.resolve(path.join(UPLOAD_DIR, minuteId))
          if (!resolved.startsWith(base)) {
               return new Response('Not found', { status: 404 })
          }

          const buffer = await readFile(resolved)
          const mimeType = getMime(filename)

          return new Response(buffer, {
               headers: { 'Content-Type': mimeType },
          })
     } catch {
          return new Response('Not found', { status: 404 })
     }
}
