import { getAuthUser } from '@/lib/auth'
import { getAllUsers } from '@/lib/users'
import { getPageSize } from '@/lib/settings'
import { redirect } from 'next/navigation'
import ChangePasswordForm from './ChangePasswordForm'
import PageSizeForm from './PageSizeForm'
import UserForm from './UserForm'
import UserList from './UserList'
import styles from './page.module.css'

export default async function OptionsPage() {
     const authUser = await getAuthUser()
     if (!authUser) redirect('/sign-in')

     const [users, pageSize] = await Promise.all([
          authUser.role === 'admin' ? getAllUsers() : Promise.resolve(null),
          authUser.role === 'admin' ? getPageSize() : Promise.resolve(null),
     ])

     return (
          <div className={styles.container}>
               <h1>Optionen</h1>

               <section>
                    <h2 className={styles.sectionTitle}>Passwort</h2>
                    <ChangePasswordForm />
               </section>

               {authUser.role === 'admin' && (
                    <>
                         <section>
                              <h2 className={styles.sectionTitle}>Anzeige</h2>
                              <PageSizeForm currentPageSize={pageSize} />
                         </section>

                         <section>
                              <h2 className={styles.sectionTitle}>Benutzerverwaltung</h2>
                              <UserList users={users} currentUserId={authUser.userId} />
                              <UserForm />
                         </section>
                    </>
               )}
          </div>
     )
}
