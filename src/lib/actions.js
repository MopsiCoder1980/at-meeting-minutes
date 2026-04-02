'use server'

import sanitizeHtml from 'sanitize-html'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getAuthUser, canEdit, canDelete } from './auth'
import { createMinute, updateMinute, deleteMinute, getMinuteById } from './store'

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
          '*': {
               'text-align': [/^(left|center|right|justify)$/],
          },
     },
}

function sanitize(html) {
     return sanitizeHtml(html ?? '', ALLOWED_HTML)
}

export async function createMinuteAction(prevState, formData) {
     const authUser = await getAuthUser()
     if (!authUser) redirect('/sign-in')

     const title = formData.get('title')?.toString().trim()
     const content = sanitize(formData.get('content')?.toString())
     const visibility = formData.get('visibility')?.toString() ?? 'private'
     const meetingDate = formData.get('meetingDate')?.toString() || null
     const tags = JSON.parse(formData.get('tags')?.toString() || '[]')

     if (!title || !content) {
          return { error: 'Titel und Inhalt sind Pflichtfelder.' }
     }

     const folderRaw = formData.get('folderId')?.toString()
     const folderId = folderRaw === '' ? null : (folderRaw ?? null)

     const minute = await createMinute({
          title,
          content,
          ownerId: authUser.userId,
          ownerName: authUser.fullName,
          visibility,
          meetingDate,
          tags,
          folderId,
     })

     revalidatePath('/dashboard')
     redirect(`/minutes/${minute.id}`)
}

export async function updateMinuteAction(id, prevState, formData) {
     const authUser = await getAuthUser()
     if (!authUser) redirect('/sign-in')

     const minute = await getMinuteById(id)
     if (!minute) return { error: 'Nicht gefunden.' }
     if (!canEdit(authUser, minute)) return { error: 'Keine Berechtigung.' }

     const title = formData.get('title')?.toString().trim()
     const content = sanitize(formData.get('content')?.toString())
     const visibility = formData.get('visibility')?.toString()
     const meetingDate = formData.get('meetingDate')?.toString() || null
     const tags = JSON.parse(formData.get('tags')?.toString() || '[]')

     if (!title || !content) {
          return { error: 'Titel und Inhalt sind Pflichtfelder.' }
     }

     const folderRaw = formData.get('folderId')?.toString()
     const folderId = folderRaw === '' ? null : (folderRaw ?? undefined)

     await updateMinute(id, { title, content, visibility, meetingDate, tags, folderId })
     revalidatePath(`/minutes/${id}`)
     revalidatePath('/dashboard')
     redirect(`/minutes/${id}`)
}

export async function deleteMinuteAction(id) {
     const authUser = await getAuthUser()
     if (!authUser) redirect('/sign-in')

     const minute = await getMinuteById(id)
     if (!minute) return { error: 'Nicht gefunden.' }
     if (!canDelete(authUser, minute)) return { error: 'Keine Berechtigung.' }

     await deleteMinute(id)
     revalidatePath('/dashboard')
     redirect('/dashboard')
}
