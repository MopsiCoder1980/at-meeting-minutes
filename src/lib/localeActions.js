'use server'

import { revalidatePath } from 'next/cache'
import { revalidateTag } from 'next/cache'
import { cookies } from 'next/headers'
import { getAuthUser } from './auth'
import { createLocale, deleteLocale, setDefaultLocale, getAllLocales } from './locales'
import { setUserLocale } from './users'
import { getTranslations } from 'next-intl/server'

export async function createLocaleAction(prevState, formData) {
     const authUser = await getAuthUser()
     const t = await getTranslations('error')
     if (authUser?.role !== 'admin') return { error: t('noPermission') }

     const code = formData.get('code')?.toString().trim().toLowerCase()
     const label = formData.get('label')?.toString().trim()

     if (!code || !label) return { error: t('allRequired') }
     if (!/^[a-z]{2}(-[A-Z]{2})?$/.test(code)) return { error: 'Ungültiger Sprachcode (z.B. "en" oder "en-US").' }

     try {
          await createLocale({ code, label })
          revalidatePath('/options')
          return { success: true }
     } catch (e) {
          if (e.message?.includes('unique') || e.code === '23505') {
               return { error: `Sprache "${code}" existiert bereits.` }
          }
          return { error: 'Fehler beim Anlegen der Sprache.' }
     }
}

export async function deleteLocaleAction(code) {
     const authUser = await getAuthUser()
     const t = await getTranslations('error')
     if (authUser?.role !== 'admin') return { error: t('noPermission') }

     await deleteLocale(code)
     revalidateTag('ui-strings')
     revalidatePath('/options')
}

export async function setDefaultLocaleAction(code) {
     const authUser = await getAuthUser()
     const t = await getTranslations('error')
     if (authUser?.role !== 'admin') return { error: t('noPermission') }

     await setDefaultLocale(code)
     revalidateTag('ui-strings')
     revalidatePath('/options')
}

export async function switchLocaleAction(locale) {
     const authUser = await getAuthUser()
     if (authUser) {
          await setUserLocale(authUser.userId, locale)
     }
     // Also set cookie as fallback (e.g. sign-in page before auth)
     const cookieStore = await cookies()
     cookieStore.set('locale', locale, {
          path: '/',
          maxAge: 60 * 60 * 24 * 365,
          sameSite: 'lax',
     })
}
