'use client'

import { useActionState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { saveStringsAction } from '@/lib/uiStringsActions'
import { STRING_GROUPS } from '@/lib/uiStringsData'
import { useTranslations } from 'next-intl'
import styles from './StringsForm.module.css'

export default function StringsForm({ currentStrings, locales, activeLocale }) {
     const t = useTranslations('options')
     const [state, formAction, pending] = useActionState(saveStringsAction, null)
     const router = useRouter()
     const searchParams = useSearchParams()

     function handleLocaleChange(e) {
          const params = new URLSearchParams(searchParams)
          params.set('editLocale', e.target.value)
          router.push(`/options?${params.toString()}`)
     }

     return (
          <div className={styles.wrapper}>
               {/* Locale selector */}
               <div className={styles.localeSelector}>
                    <label className={styles.localeSelectorLabel}>{t('stringsLocale')}:</label>
                    <select value={activeLocale} onChange={handleLocaleChange} className={styles.localeSelect}>
                         {locales.map(l => (
                              <option key={l.code} value={l.code}>{l.label} ({l.code})</option>
                         ))}
                    </select>
               </div>

               <form action={formAction}>
                    {/* Hidden: which locale we're saving */}
                    <input type="hidden" name="_locale" value={activeLocale} />

                    {STRING_GROUPS.map(group => (
                         <details key={group.label} className={styles.group}>
                              <summary className={styles.groupTitle}>{group.label}</summary>
                              <div className={styles.fields}>
                                   {group.keys.map(key => (
                                        <div key={key} className={styles.field}>
                                             <label className={styles.label} htmlFor={`str-${key}`}>
                                                  <code className={styles.key}>{key}</code>
                                             </label>
                                             <input
                                                  id={`str-${key}`}
                                                  name={key}
                                                  type="text"
                                                  defaultValue={currentStrings[key] ?? ''}
                                                  className={styles.input}
                                             />
                                        </div>
                                   ))}
                              </div>
                         </details>
                    ))}

                    <div className={styles.footer}>
                         {state?.error && <p className={styles.error}>{state.error}</p>}
                         {state?.success && <p className={styles.success}>{t('stringsSaved')}</p>}
                         <button type="submit" disabled={pending} className={styles.submitBtn}>
                              {pending ? t('stringsSaving') : t('stringsSubmit')}
                         </button>
                    </div>
               </form>
          </div>
     )
}
