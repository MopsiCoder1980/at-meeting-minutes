'use server'

import { revalidatePath } from 'next/cache'
import { getAuthUser } from './auth'
import { setSetting } from './settings'
import { getTranslations } from 'next-intl/server'

export async function savePageSizeAction(prevState, formData) {
     const authUser = await getAuthUser()
     const t = await getTranslations('error')

     if (authUser?.role !== 'admin') return { error: t('noPermission') }

     const raw = formData.get('pageSize')?.toString()
     const n = parseInt(raw, 10)
     if (!Number.isFinite(n) || n < 1 || n > 200) return { error: t('pageSizeRange') }

     await setSetting('pageSize', n)
     revalidatePath('/dashboard')
     revalidatePath('/options')
     return { success: true }
}
