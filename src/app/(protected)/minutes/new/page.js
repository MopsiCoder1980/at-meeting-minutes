import { createMinuteAction } from '@/lib/actions'
import { getAllTags } from '@/lib/store'
import { getFoldersForUser } from '@/lib/folders'
import { getAuthUser } from '@/lib/auth'
import MinuteForm from '@/components/MinuteForm'
import styles from './page.module.css'

export default async function NewMinutePage() {
  const authUser = await getAuthUser()
  const [allTags, folders] = await Promise.all([
    getAllTags(),
    getFoldersForUser(authUser.userId, authUser.role),
  ])

  return (
    <div className={styles.container}>
      <h1>Neues Meeting</h1>
      <MinuteForm action={createMinuteAction} allTags={allTags} folders={folders} />
    </div>
  )
}
