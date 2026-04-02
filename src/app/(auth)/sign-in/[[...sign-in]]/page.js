'use client'

import { useActionState } from 'react'
import { loginAction } from '@/lib/authActions'
import styles from './page.module.css'

export default function SignInPage() {
     const [state, formAction, pending] = useActionState(loginAction, null)

     return (
          <main className={styles.container}>
               <div className={styles.card}>
                    <h1 className={styles.title}>Meeting Minutes</h1>
                    <form action={formAction} className={styles.form}>
                         <label className={styles.label}>
                              Benutzername
                              <input name="username" type="text" className={styles.input} required autoFocus autoComplete="username" />
                         </label>
                         <label className={styles.label}>
                              Passwort
                              <input name="password" type="password" className={styles.input} required autoComplete="current-password" />
                         </label>
                         {state?.error && <p className={styles.error}>{state.error}</p>}
                         <button type="submit" disabled={pending} className={styles.btn}>
                              {pending ? 'Anmelden…' : 'Anmelden'}
                         </button>
                    </form>
               </div>
          </main>
     )
}
