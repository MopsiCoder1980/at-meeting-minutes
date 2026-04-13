'use client'

import { useActionState, useTransition } from 'react'
import { createLocaleAction, deleteLocaleAction, setDefaultLocaleAction } from '@/lib/localeActions'
import { useTranslations } from 'next-intl'
import styles from './page.module.css'
import langStyles from './LanguageForm.module.css'

export default function LanguageForm({ locales }) {
     const [state, formAction, pending] = useActionState(createLocaleAction, null)
     const [, startTransition] = useTransition()
     const t = useTranslations('languages')

     function handleDelete(code) {
          if (!confirm(t('confirmDelete', { code }))) return
          startTransition(() => deleteLocaleAction(code))
     }

     function handleSetDefault(code) {
          startTransition(() => setDefaultLocaleAction(code))
     }

     return (
          <div className={styles.formSection}>
               {/* Existing languages */}
               <table className={styles.table}>
                    <thead>
                         <tr>
                              <th>{t('code')}</th>
                              <th>{t('label')}</th>
                              <th>{t('default')}</th>
                              <th></th>
                         </tr>
                    </thead>
                    <tbody>
                         {locales.map(l => (
                              <tr key={l.code}>
                                   <td><code>{l.code}</code></td>
                                   <td>{l.label}</td>
                                   <td>
                                        {l.is_default
                                             ? <span className={langStyles.defaultBadge}>{t('isDefault')}</span>
                                             : <button className={langStyles.setDefaultBtn} onClick={() => handleSetDefault(l.code)}>{t('setDefault')}</button>
                                        }
                                   </td>
                                   <td>
                                        {!l.is_default && (
                                             <button className={styles.deleteBtn} onClick={() => handleDelete(l.code)}>{t('delete')}</button>
                                        )}
                                   </td>
                              </tr>
                         ))}
                    </tbody>
               </table>

               {/* Add new language */}
               <h3 className={`${styles.formTitle} ${langStyles.addTitle}`}>{t('addTitle')}</h3>
               <form action={formAction} className={styles.form}>
                    <div className={styles.formRow}>
                         <input name="code" type="text" placeholder={t('codePlaceholder')} className={styles.input} required pattern="[a-z]{2}(-[A-Z]{2})?" title='z.B. "en" oder "en-US"' />
                         <input name="label" type="text" placeholder={t('labelPlaceholder')} className={styles.input} required />
                         <button type="submit" disabled={pending} className={styles.submitBtn}>
                              {pending ? t('adding') : t('add')}
                         </button>
                    </div>
                    {state?.error && <p className={styles.error}>{state.error}</p>}
                    {state?.success && <p className={styles.success}>{t('added')}</p>}
               </form>
          </div>
     )
}
