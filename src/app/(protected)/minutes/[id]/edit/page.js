import { getAuthUser, canEdit } from '@/lib/auth'
import { getMinuteById, getAllTags } from '@/lib/store'
import { notFound, redirect } from 'next/navigation'
import { updateMinuteAction } from '@/lib/actions'
import { getFoldersForUser } from '@/lib/folders'
import { getAllUsers } from '@/lib/users'
import { getTranslations } from 'next-intl/server'
import MinuteForm from '@/components/MinuteForm'
import Link from 'next/link'
import styles from './page.module.css'

export default async function EditMinutePage({ params }) {
     const { id } = await params
     const authUser = await getAuthUser()
     const minute = await getMinuteById(id)
     if (!minute) notFound()
     if (!canEdit(authUser, minute)) redirect('/dashboard')

     const boundAction = updateMinuteAction.bind(null, id)
     const [allTags, folders, allUsers, t] = await Promise.all([
          getAllTags(), getFoldersForUser(), getAllUsers(), getTranslations('form'),
     ])

     return (
          <div className={styles.container}>
               <div className={styles.header}>
                    <h1>{t('editMeeting')}</h1>
                    <Link href={`/minutes/${id}`}>{t('cancel')}</Link>
               </div>
               <MinuteForm action={boundAction} defaultValues={minute} allTags={allTags} folders={folders} allUsers={allUsers} />
          </div>
     )
}
