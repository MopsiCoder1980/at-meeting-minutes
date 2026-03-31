import { getAuthUser, canEdit } from '@/lib/auth'
import { getMinuteById, getAllTags } from '@/lib/store'
import { notFound, redirect } from 'next/navigation'
import { updateMinuteAction } from '@/lib/actions'
import { getFoldersForUser } from '@/lib/folders'
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
  const [allTags, folders] = await Promise.all([
    getAllTags(),
    getFoldersForUser(),
  ])

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Meeting bearbeiten</h1>
        <Link href={`/minutes/${id}`}>Abbrechen</Link>
      </div>
      <MinuteForm action={boundAction} defaultValues={minute} allTags={allTags} folders={folders} />
    </div>
  )
}
