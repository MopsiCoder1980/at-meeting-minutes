import Link from 'next/link'
import { getAuthUser } from '@/lib/auth'
import SearchBar from './SearchBar'
import LogoutButton from './LogoutButton'
import styles from './NavBar.module.css'

export default async function NavBar() {
     const authUser = await getAuthUser()

     return (
          <nav className={styles.nav}>
               <Link href="/dashboard" className={styles.brand}>
                    Meeting Minutes
               </Link>
               <div className={styles.search}>
                    <SearchBar />
               </div>
               <div className={styles.actions}>
                    <Link href="/minutes/new" className={styles.newBtn}>
                         + Neu
                    </Link>
                    <Link href="/options" className={styles.optionsBtn}>
                         Optionen
                    </Link>
                    <LogoutButton />
               </div>
          </nav>
     )
}
