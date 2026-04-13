import { getRequestConfig } from 'next-intl/server'
import { cookies } from 'next/headers'
import { getAllLocales, getDefaultLocale } from '@/lib/locales'
import { getMessages } from '@/lib/uiStrings'
import { getAuthUser } from '@/lib/auth'
import { getUserLocale } from '@/lib/users'

export default getRequestConfig(async () => {
     const locales = await getAllLocales()
     const defaultLocale = locales.find(l => l.is_default)?.code ?? (await getDefaultLocale())
     const available = locales.map(l => l.code)

     // 1. Prefer user's saved locale from DB
     let locale = null
     const authUser = await getAuthUser()
     if (authUser) {
          const userLocale = await getUserLocale(authUser.userId)
          if (userLocale && available.includes(userLocale)) {
               locale = userLocale
          }
     }

     // 2. Fall back to cookie (e.g. on sign-in page)
     if (!locale) {
          const cookieStore = await cookies()
          const cookieLocale = cookieStore.get('locale')?.value
          if (cookieLocale && available.includes(cookieLocale)) {
               locale = cookieLocale
          }
     }

     // 3. Fall back to system default
     if (!locale) locale = defaultLocale

     const messages = await getMessages(locale)
     return { locale, messages }
})
