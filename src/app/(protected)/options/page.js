import { getAuthUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import styles from './page.module.css'

export default async function OptionsPage() {
  const authUser = await getAuthUser()

  if (authUser?.role !== 'admin') redirect('/dashboard')

  return (
    <div className={styles.container}>
      <h1>Optionen</h1>
      <p className={styles.hint}>Hier werden App-Optionen konfiguriert.</p>
    </div>
  )
}
