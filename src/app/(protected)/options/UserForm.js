'use client'

import { useActionState, useEffect, useRef } from 'react'
import { createUserAction } from '@/lib/authActions'
import { useTranslations } from 'next-intl'
import styles from './page.module.css'

export default function UserForm() {
     const [state, formAction, pending] = useActionState(createUserAction, null)
     const formRef = useRef(null)
     const t = useTranslations('users')

     useEffect(() => { if (state?.success) formRef.current?.reset() }, [state])

     return (
          <div className={styles.formSection}>
               <h3 className={styles.formTitle}>{t('createTitle')}</h3>
               <form ref={formRef} action={formAction} className={styles.form}>
                    <div className={styles.formRow}>
                         <input name="username" type="text" placeholder={t('username')} className={styles.input} required autoComplete="off" />
                         <input name="password" type="password" placeholder={t('password')} className={styles.input} required autoComplete="new-password" />
                         <select name="role" className={styles.select}>
                              <option value="user">user</option>
                              <option value="admin">admin</option>
                         </select>
                         <button type="submit" disabled={pending} className={styles.submitBtn}>
                              {pending ? t('creating') : t('create')}
                         </button>
                    </div>
                    {state?.error && <p className={styles.error}>{state.error}</p>}
                    {state?.success && <p className={styles.success}>{t('created')}</p>}
               </form>
          </div>
     )
}
