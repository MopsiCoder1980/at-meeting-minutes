'use server'

import sanitizeHtml from 'sanitize-html'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getAuthUser, canEdit, canDelete } from './auth'
import { createMinute, updateMinute, deleteMinute, getMinuteById } from './store'
import { getTranslations } from 'next-intl/server'
import { writeFile, mkdir, rm } from 'fs/promises'
import path from 'path'

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads')
const ALLOWED_TYPES = [
     'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
     'application/pdf',
     'application/msword',
     'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
     'application/vnd.ms-excel',
     'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
     'application/vnd.ms-powerpoint',
     'application/vnd.openxmlformats-officedocument.presentationml.presentation',
]

function sanitizeFilename(name) {
     return name.replace(/[^a-zA-Z0-9._\-]/g, '_').replace(/\.{2,}/g, '_')
}

async function handleFileUploads(formData, minuteId, existingAttachments = []) {
     const files = formData.getAll('attachments').filter(f => f instanceof File && f.size > 0)
     const keptRaw = formData.get('attachmentsKept')
     const kept = keptRaw ? JSON.parse(keptRaw) : existingAttachments

     const keptUrls = new Set(kept.map(a => a.url))
     const removed = existingAttachments.filter(a => !keptUrls.has(a.url))
     await Promise.all(removed.map(async (a) => {
          try {
               const filePath = path.join(process.cwd(), 'public', a.url.replace(/^\//, ''))
               await rm(filePath, { force: true })
          } catch { /* ignore */ }
     }))

     if (files.length === 0) return kept

     const dir = path.join(UPLOAD_DIR, String(minuteId))
     await mkdir(dir, { recursive: true })

     const newAttachments = await Promise.all(files.map(async (file) => {
          if (!ALLOWED_TYPES.includes(file.type)) return null
          const safeName = sanitizeFilename(file.name)
          const unique = `${Date.now()}_${safeName}`
          const buffer = Buffer.from(await file.arrayBuffer())
          await writeFile(path.join(dir, unique), buffer)
          return { name: file.name, url: `/uploads/${minuteId}/${unique}`, size: file.size, type: file.type }
     }))

     return [...kept, ...newAttachments.filter(Boolean)]
}

async function cleanupUploads(minuteId) {
     try { await rm(path.join(UPLOAD_DIR, String(minuteId)), { recursive: true, force: true }) } catch { /* ignore */ }
}

const ALLOWED_HTML = {
     allowedTags: [
          'p', 'br', 'strong', 'em', 's', 'u',
          'h1', 'h2', 'h3',
          'ul', 'ol', 'li',
          'table', 'thead', 'tbody', 'tr', 'th', 'td',
          'hr', 'div', 'span',
     ],
     allowedAttributes: {
          '*': ['style'],
          'th': ['colspan', 'rowspan'],
          'td': ['colspan', 'rowspan'],
     },
     allowedStyles: {
          '*': { 'text-align': [/^(left|center|right|justify)$/] },
     },
}

function sanitize(html) { return sanitizeHtml(html ?? '', ALLOWED_HTML) }

function parseStructure(formData) {
     try { return JSON.parse(formData.get('structure')?.toString() || '{}') } catch { return {} }
}

export async function createMinuteAction(prevState, formData) {
     const authUser = await getAuthUser()
     if (!authUser) redirect('/sign-in')

     const projectTitle = formData.get('projectTitle')?.toString().trim()
     const title = formData.get('title')?.toString().trim()

     if (!projectTitle || !title) {
          const t = await getTranslations('error')
          return { error: t('minuteRequired') }
     }

     const content = sanitize(formData.get('content')?.toString())
     const structure = parseStructure(formData)
     const visibility = formData.get('visibility')?.toString() ?? 'private'
     const meetingDate = formData.get('meetingDate')?.toString() || null
     const tags = JSON.parse(formData.get('tags')?.toString() || '[]')
     const folderRaw = formData.get('folderId')?.toString()
     const folderId = folderRaw === '' ? null : (folderRaw ?? null)

     const minute = await createMinute({
          title, projectTitle, content, structure,
          ownerId: authUser.userId, ownerName: authUser.fullName,
          visibility, meetingDate, tags, folderId,
     })

     const attachments = await handleFileUploads(formData, minute.id, [])
     if (attachments.length > 0) {
          await updateMinute(minute.id, { attachments })
     }

     revalidatePath('/dashboard')
     redirect(`/minutes/${minute.id}`)
}

export async function updateMinuteAction(id, prevState, formData) {
     const authUser = await getAuthUser()
     if (!authUser) redirect('/sign-in')

     const minute = await getMinuteById(id)
     const t = await getTranslations('error')

     if (!minute) return { error: t('notFound') }
     if (!canEdit(authUser, minute)) return { error: t('noPermission') }

     const projectTitle = formData.get('projectTitle')?.toString().trim()
     const title = formData.get('title')?.toString().trim()

     if (!projectTitle || !title) return { error: t('minuteRequired') }

     const content = sanitize(formData.get('content')?.toString())
     const structure = parseStructure(formData)
     const visibility = formData.get('visibility')?.toString()
     const meetingDate = formData.get('meetingDate')?.toString() || null
     const tags = JSON.parse(formData.get('tags')?.toString() || '[]')
     const folderRaw = formData.get('folderId')?.toString()
     const folderId = folderRaw === '' ? null : (folderRaw ?? undefined)

     const attachments = await handleFileUploads(formData, id, minute.attachments ?? [])
     await updateMinute(id, { title, projectTitle, content, structure, visibility, meetingDate, tags, folderId, attachments })
     revalidatePath(`/minutes/${id}`)
     revalidatePath('/dashboard')
     redirect(`/minutes/${id}`)
}

export async function deleteMinuteAction(id) {
     const authUser = await getAuthUser()
     if (!authUser) redirect('/sign-in')

     const minute = await getMinuteById(id)
     const t = await getTranslations('error')

     if (!minute) return { error: t('notFound') }
     if (!canDelete(authUser, minute)) return { error: t('noPermission') }

     await deleteMinute(id)
     await cleanupUploads(id)
     revalidatePath('/dashboard')
     redirect('/dashboard')
}
