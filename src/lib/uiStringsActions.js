'use server'

import { revalidateTag } from 'next/cache'
import { getAuthUser } from './auth'
import { setStrings } from './uiStrings'
import { DEFAULT_STRINGS } from './uiStringsData'
import { getTranslations } from 'next-intl/server'

export async function saveStringsAction(prevState, formData) {
     const authUser = await getAuthUser()
     if (authUser?.role !== 'admin') {
          const t = await getTranslations('error')
          return { error: t('noPermission') }
     }

     const locale = formData.get('_locale')?.toString()
     if (!locale) return { error: 'Locale fehlt.' }

     const updates = {}
     for (const key of Object.keys(DEFAULT_STRINGS)) {
          const value = formData.get(key)
          if (value !== null) updates[key] = value.toString()
     }

     await setStrings(locale, updates)
     revalidateTag(`ui-strings-${locale}`)
     return { success: true }
}
