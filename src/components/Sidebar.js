import { getAuthUser } from '@/lib/auth'
import { getFoldersForUser } from '@/lib/folders'
import FolderList from './FolderList'
import SidebarShell from './SidebarShell'
import styles from './Sidebar.module.css'

export default async function Sidebar() {
  const authUser = await getAuthUser()
  if (!authUser) return null

  const folders = await getFoldersForUser()

  return (
    <SidebarShell>
      <div className={styles.sidebarHeader}>
        <span className={styles.sidebarTitle}>Ordner</span>
      </div>
      <FolderList folders={folders} />
    </SidebarShell>
  )
}
