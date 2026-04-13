import { getAuthUser } from '@/lib/auth'
import { getFoldersForUser } from '@/lib/folders'
import { getTranslations } from 'next-intl/server'
import FolderList from './FolderList'
import SidebarShell from './SidebarShell'
import styles from './Sidebar.module.css'

export default async function Sidebar() {
     const authUser = await getAuthUser()
     if (!authUser) return null

     const [folders, t] = await Promise.all([getFoldersForUser(), getTranslations('sidebar')])

     return (
          <SidebarShell>
               <div className={styles.sidebarHeader}>
                    <span className={styles.sidebarTitle}>{t('title')}</span>
               </div>
               <FolderList folders={folders} />
          </SidebarShell>
     )
}
