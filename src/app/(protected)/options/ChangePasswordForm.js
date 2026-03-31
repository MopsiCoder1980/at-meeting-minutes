'use client'

import { useActionState, useEffect, useRef } from 'react'
import { changePasswordAction } from '@/lib/authActions'
import styles from './page.module.css'

export default function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState(changePasswordAction, null)
  const formRef = useRef(null)

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset()
    }
  }, [state])

  return (
    <div className={styles.formSection}>
      <h3 className={styles.formTitle}>Passwort ändern</h3>
      <form ref={formRef} action={formAction} className={styles.form}>
        <label className={styles.label}>
          Aktuelles Passwort
          <input name="currentPassword" type="password" className={styles.inputBlock} required autoComplete="current-password" />
        </label>
        <label className={styles.label}>
          Neues Passwort
          <input name="newPassword" type="password" className={styles.inputBlock} required autoComplete="new-password" />
        </label>
        <label className={styles.label}>
          Neues Passwort bestätigen
          <input name="confirmPassword" type="password" className={styles.inputBlock} required autoComplete="new-password" />
        </label>
        {state?.error && <p className={styles.error}>{state.error}</p>}
        {state?.success && <p className={styles.success}>Passwort erfolgreich geändert.</p>}
        <button type="submit" disabled={pending} className={styles.submitBtnNarrow}>
          {pending ? 'Speichern…' : 'Speichern'}
        </button>
      </form>
    </div>
  )
}
