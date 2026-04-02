import { createMinuteAction } from '@/lib/actions'
import { getAllTags } from '@/lib/store'
import { getFoldersForUser } from '@/lib/folders'
import { getAuthUser } from '@/lib/auth'
import { getAllUsers } from '@/lib/users'
import MinuteForm from '@/components/MinuteForm'
import styles from './page.module.css'

export default async function NewMinutePage() {
     const authUser = await getAuthUser()
     const [allTags, folders, allUsers] = await Promise.all([
          getAllTags(),
          getFoldersForUser(),
          getAllUsers(),
     ])

     return (
          <div className={styles.container}>
               <h1>Neues Meeting</h1>
               <MinuteForm action={createMinuteAction} allTags={allTags} folders={folders} allUsers={allUsers} />
          </div>
     )
}