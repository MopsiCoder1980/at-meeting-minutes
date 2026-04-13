'use client'

import { useActionState } from 'react'
import { savePageSizeAction } from '@/lib/settingsActions'
import { useTranslations } from 'next-intl'
import styles from './page.module.css'

export default function PageSizeForm({ currentPageSize }) {
     const [state, formAction, pending] = useActionState(savePageSizeAction, null)
     const t = useTranslations('pageSize')

     return (
          <div className={styles.formSection}>
               <h3 className={styles.formTitle}>{t('label')}</h3>
               <form action={formAction} className={styles.form}>
                    <div className={styles.formRow}>
                         <input name="pageSize" type="number" min="1" max="200" defaultValue={currentPageSize} className={styles.inputNarrow} required />
                         <button type="submit" disabled={pending} className={styles.submitBtn}>
                              {pending ? t('saving') : t('save')}
                         </button>
                    </div>
                    {state?.error && <p className={styles.error}>{state.error}</p>}
                    {state?.success && <p className={styles.success}>{t('saved')}</p>}
               </form>
          </div>
     )
}
