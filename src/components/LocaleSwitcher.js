'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { switchLocaleAction } from '@/lib/localeActions'
import styles from './LocaleSwitcher.module.css'

export default function LocaleSwitcher({ locales }) {
     const locale = useLocale()
     const [pending, startTransition] = useTransition()
     const router = useRouter()

     if (!locales || locales.length <= 1) return null

     function handleChange(e) {
          const next = e.target.value
          startTransition(async () => {
               await switchLocaleAction(next)
               router.refresh()
          })
     }

     return (
          <select
               value={locale}
               onChange={handleChange}
               disabled={pending}
               className={styles.select}
               aria-label="Sprache wählen"
          >
               {locales.map(l => (
                    <option key={l.code} value={l.code}>{l.label}</option>
               ))}
          </select>
     )
}
