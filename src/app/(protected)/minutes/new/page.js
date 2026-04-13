import { createMinuteAction } from '@/lib/actions'
import { getAllTags } from '@/lib/store'
import { getFoldersForUser } from '@/lib/folders'
import { getAuthUser } from '@/lib/auth'
import { getAllUsers } from '@/lib/users'
import { getTranslations } from 'next-intl/server'
import MinuteForm from '@/components/MinuteForm'
import styles from './page.module.css'

export default async function NewMinutePage() {
     const [allTags, folders, allUsers, t] = await Promise.all([
          getAllTags(), getFoldersForUser(), getAllUsers(), getTranslations('form'),
     ])

     return (
          <div className={styles.container}>
               <h1>{t('newMeeting')}</h1>
               <MinuteForm action={createMinuteAction} allTags={allTags} folders={folders} allUsers={allUsers} />
          </div>
     )
}
