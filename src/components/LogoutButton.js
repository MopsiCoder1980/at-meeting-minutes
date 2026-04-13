'use client'

import { logoutAction } from '@/lib/authActions'
import { useTranslations } from 'next-intl'
import styles from './NavBar.module.css'

export default function LogoutButton() {
     const t = useTranslations('nav')

     return (
          <form action={logoutAction}>
               <button type="submit" className={styles.logoutBtn}>
                    {t('logout')}
               </button>
          </form>
     )
}
