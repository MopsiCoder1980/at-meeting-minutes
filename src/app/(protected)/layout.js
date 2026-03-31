import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import NavBar from '@/components/NavBar'
import Sidebar from '@/components/Sidebar'
import styles from './layout.module.css'

export default async function ProtectedLayout({ children }) {
  const { userId } = await auth()

  if (!userId) {
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
