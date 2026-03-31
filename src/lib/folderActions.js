'use server'

import { revalidatePath } from 'next/cache'
import { getAuthUser } from './auth'
import { createFolder, deleteFolder, moveMinuteToFolder } from './folders'

export async function createFolderAction(prevState, formData) {
  const authUser = await getAuthUser()
  if (!authUser) return { error: 'Nicht angemeldet.' }

  const name = formData.get('name')?.toString().trim()
  if (!name) return { error: 'Name ist erforderlich.' }

  await createFolder({ name, ownerId: authUser.userId })
  revalidatePath('/', 'layout')
  return { success: true }
}

export async function renameFolderAction(id, name) {
  const authUser = await getAuthUser()
  if (!authUser) return { error: 'Nicht angemeldet.' }

  const trimmed = name?.trim()
  if (!trimmed) return { error: 'Name ist erforderlich.' }

  const sql = (await import('@neondatabase/serverless')).neon(process.env.DATABASE_URL)
  await sql`UPDATE folders SET name = ${trimmed} WHERE id = ${id}`
  revalidatePath('/', 'layout')
  return { success: true }
}

export async function deleteFolderAction(id) {
  const authUser = await getAuthUser()
  if (!authUser) return { error: 'Nicht angemeldet.' }

  await deleteFolder(id)
  revalidatePath('/', 'layout')
  return { success: true }
}

export async function moveMinuteToFolderAction(minuteId, folderId) {
  const authUser = await getAuthUser()
  if (!authUser) return { error: 'Nicht angemeldet.' }

  await moveMinuteToFolder(minuteId, folderId)
  revalidatePath('/dashboard')
  return { success: true }
}
