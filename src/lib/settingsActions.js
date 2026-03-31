'use server'

import { revalidatePath } from 'next/cache'
import { getAuthUser } from './auth'
import { setSetting } from './settings'

export async function savePageSizeAction(prevState, formData) {
  const authUser = await getAuthUser()
  if (authUser?.role !== 'admin') return { error: 'Keine Berechtigung.' }

  const raw = formData.get('pageSize')?.toString()
  const n = parseInt(raw, 10)
  if (!Number.isFinite(n) || n < 1 || n > 200) {
    return { error: 'Bitte eine Zahl zwischen 1 und 200 eingeben.' }
  }

  await setSetting('pageSize', n)
  revalidatePath('/dashboard')
  revalidatePath('/options')
  return { success: true }
}
