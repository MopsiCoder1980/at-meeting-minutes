'use client'

import { deleteMinuteAction } from '@/lib/actions'
import styles from './DeleteButton.module.css'

export default function DeleteButton({ id }) {
  const action = deleteMinuteAction.bind(null, id)

  return (
    <form action={action} onSubmit={e => {
      if (!confirm('Meeting wirklich löschen?')) e.preventDefault()
    }}>
      <button type="submit" className={styles.btn}>
        Löschen
      </button>
    </form>
  )
}
