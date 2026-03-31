import { redirect } from 'next/navigation'
import { getAuthUser } from '@/lib/auth'
import NavBar from '@/components/NavBar'
import Sidebar from '@/components/Sidebar'
import styles from './layout.module.css'

export default async function ProtectedLayout({ children }) {
  const authUser = await getAuthUser()

  if (!authUser) {
    redirect('/sign-in')
  }

  return (
    <div className={styles.wrapper}>
      <NavBar />
      <div className={styles.body}>
        <Sidebar />
        <main className={styles.main}>{children}</main>
      </div>
    </div>
  )
}
