import Link from 'next/link'
import { getAuthUser } from '@/lib/auth'
import { getAllLocales } from '@/lib/locales'
import { getTranslations } from 'next-intl/server'
import SearchBar from './SearchBar'
import LogoutButton from './LogoutButton'
import LocaleSwitcher from './LocaleSwitcher'
import styles from './NavBar.module.css'

export default async function NavBar() {
     const [authUser, t, locales] = await Promise.all([
          getAuthUser(),
          getTranslations('nav'),
          getAllLocales(),
     ])

     return (
          <nav className={styles.nav}>
               <Link href="/dashboard" className={styles.brand}>
                    {t('brand')}
               </Link>
               <div className={styles.search}>
                    <SearchBar />
               </div>
               <div className={styles.actions}>
                    <Link href="/minutes/new" className={styles.newBtn}>{t('new')}</Link>
                    <Link href="/options" className={styles.optionsBtn}>{t('options')}</Link>
                    <LocaleSwitcher locales={locales} />
                    <LogoutButton />
               </div>
          </nav>
     )
}
