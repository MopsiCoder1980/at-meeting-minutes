'use client'

import { logoutAction } from '@/lib/authActions'
import styles from './NavBar.module.css'

export default function LogoutButton() {
  return (
    <form action={logoutAction}>
      <button type="submit" className={styles.logoutBtn}>
        Abmelden
      </button>
    </form>
  )
}
