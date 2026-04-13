import { getAuthUser } from '@/lib/auth'
import { getAllUsers } from '@/lib/users'
import { getPageSize } from '@/lib/settings'
import { getStringsFlat } from '@/lib/uiStrings'
import { getAllLocales, getDefaultLocale } from '@/lib/locales'
import { getTranslations } from 'next-intl/server'
import { redirect } from 'next/navigation'
import ChangePasswordForm from './ChangePasswordForm'
import PageSizeForm from './PageSizeForm'
import UserForm from './UserForm'
import UserList from './UserList'
import StringsForm from './StringsForm'
import LanguageForm from './LanguageForm'
import OptionsTabs from './OptionsTabs'
import styles from './page.module.css'

export default async function OptionsPage({ searchParams }) {
     const authUser = await getAuthUser()
     if (!authUser) redirect('/sign-in')

     const { editLocale } = await searchParams

     const [users, pageSize, locales, t, defaultLocale] = await Promise.all([
          authUser.role === 'admin' ? getAllUsers() : Promise.resolve(null),
          authUser.role === 'admin' ? getPageSize() : Promise.resolve(null),
          authUser.role === 'admin' ? getAllLocales() : Promise.resolve([]),
          getTranslations('options'),
          getDefaultLocale(),
     ])

     const activeLocale = (editLocale && locales.find(l => l.code === editLocale))
          ? editLocale
          : defaultLocale

     const currentStrings = authUser.role === 'admin'
          ? await getStringsFlat(activeLocale)
          : null

     if (authUser.role !== 'admin') {
          return (
               <div className={styles.container}>
                    <h1>{t('title')}</h1>
                    <section>
                         <h2 className={styles.sectionTitle}>{t('sectionPassword')}</h2>
                         <ChangePasswordForm />
                    </section>
               </div>
          )
     }

     const tabs = [
          {
               key: 'users',
               labelKey: 'tabUsers',
               content: (
                    <>
                         <section>
                              <h2 className={styles.sectionTitle}>{t('sectionPassword')}</h2>
                              <ChangePasswordForm />
                         </section>
                         <section>
                              <h2 className={styles.sectionTitle}>{t('sectionUsers')}</h2>
                              <UserList users={users} currentUserId={authUser.userId} />
                              <UserForm />
                         </section>
                    </>
               ),
          },
          {
               key: 'display',
               labelKey: 'tabDisplay',
               content: (
                    <section>
                         <h2 className={styles.sectionTitle}>{t('sectionDisplay')}</h2>
                         <PageSizeForm currentPageSize={pageSize} />
                    </section>
               ),
          },
          {
               key: 'language',
               labelKey: 'tabLanguage',
               content: (
                    <>
                         <section>
                              <h2 className={styles.sectionTitle}>{t('sectionLanguages')}</h2>
                              <LanguageForm locales={locales} />
                         </section>
                         <section>
                              <h2 className={styles.sectionTitle}>{t('sectionStrings')}</h2>
                              <StringsForm
                                   currentStrings={currentStrings}
                                   locales={locales}
                                   activeLocale={activeLocale}
                              />
                         </section>
                    </>
               ),
          },
     ]

     return (
          <div className={styles.container}>
               <h1>{t('title')}</h1>
               <OptionsTabs tabs={tabs} />
          </div>
     )
}
