'use client'

import { useTransition } from 'react'
import { deleteUserAction } from '@/lib/authActions'
import { useTranslations } from 'next-intl'
import styles from './page.module.css'

export default function UserList({ users, currentUserId }) {
     const [pending, startTransition] = useTransition()
     const t = useTranslations('users')

     function handleDelete(id) {
          if (!confirm(t('confirmDelete'))) return
          startTransition(() => deleteUserAction(id))
     }

     if (users.length === 0) return <p className={styles.hint}>{t('none')}</p>

     return (
          <table className={styles.table}>
               <thead><tr><th>{t('colUsername')}</th><th>{t('colRole')}</th><th></th></tr></thead>
               <tbody>
                    {users.map(user => (
                         <tr key={user.id}>
                              <td>{user.username}</td>
                              <td>{user.role}</td>
                              <td>
                                   {user.id !== currentUserId && (
                                        <button onClick={() => handleDelete(user.id)} disabled={pending} className={styles.deleteBtn}>
                                             {t('delete')}
                                        </button>
                                   )}
                              </td>
                         </tr>
                    ))}
               </tbody>
          </table>
     )
}
