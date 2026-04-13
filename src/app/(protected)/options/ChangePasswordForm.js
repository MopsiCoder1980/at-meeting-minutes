'use client'

import { useActionState, useEffect, useRef } from 'react'
import { changePasswordAction } from '@/lib/authActions'
import { useTranslations } from 'next-intl'
import styles from './page.module.css'

export default function ChangePasswordForm() {
     const [state, formAction, pending] = useActionState(changePasswordAction, null)
     const formRef = useRef(null)
     const t = useTranslations('password')

     useEffect(() => { if (state?.success) formRef.current?.reset() }, [state])

     return (
          <div className={styles.formSection}>
               <h3 className={styles.formTitle}>{t('formTitle')}</h3>
               <form ref={formRef} action={formAction} className={styles.form}>
                    <label className={styles.label}>{t('current')}<input name="currentPassword" type="password" className={styles.inputBlock} required autoComplete="current-password" /></label>
                    <label className={styles.label}>{t('new')}<input name="newPassword" type="password" className={styles.inputBlock} required autoComplete="new-password" /></label>
                    <label className={styles.label}>{t('confirm')}<input name="confirmPassword" type="password" className={styles.inputBlock} required autoComplete="new-password" /></label>
                    {state?.error && <p className={styles.error}>{state.error}</p>}
                    {state?.success && <p className={styles.success}>{t('success')}</p>}
                    <button type="submit" disabled={pending} className={styles.submitBtnNarrow}>
                         {pending ? t('saving') : t('save')}
                    </button>
               </form>
          </div>
     )
}
