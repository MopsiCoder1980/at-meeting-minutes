'use server'

import sanitizeHtml from 'sanitize-html'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getAuthUser, canEdit, canDelete } from './auth'
import { createMinute, updateMinute, deleteMinute, getMinuteById } from './store'
import { getTranslations } from 'next-intl/server'

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

     await updateMinute(id, { title, projectTitle, content, structure, visibility, meetingDate, tags, folderId })
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
     revalidatePath('/dashboard')
     redirect('/dashboard')
}
