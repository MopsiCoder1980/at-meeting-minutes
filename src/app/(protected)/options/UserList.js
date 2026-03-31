'use client'

import { useTransition } from 'react'
import { deleteUserAction } from '@/lib/authActions'
import styles from './page.module.css'

export default function UserList({ users, currentUserId }) {
  const [pending, startTransition] = useTransition()

  function handleDelete(id) {
    if (!confirm('Benutzer wirklich löschen?')) return
    startTransition(() => deleteUserAction(id))
  }

  if (users.length === 0) {
    return <p className={styles.hint}>Noch keine Benutzer angelegt.</p>
  }

  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th>Benutzername</th>
          <th>Rolle</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {users.map(user => (
          <tr key={user.id}>
            <td>{user.username}</td>
            <td>{user.role}</td>
            <td>
              {user.id !== currentUserId && (
                <button
                  onClick={() => handleDelete(user.id)}
                  disabled={pending}
                  className={styles.deleteBtn}
                >
                  Löschen
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
