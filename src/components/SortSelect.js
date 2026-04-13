'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import styles from './SortSelect.module.css'

export default function SortSelect({ current }) {
     const router = useRouter()
     const pathname = usePathname()
     const searchParams = useSearchParams()
     const t = useTranslations('sort')

     const SORT_OPTIONS = [
          { value: 'date-desc', label: t('dateDesc') },
          { value: 'date-asc', label: t('dateAsc') },
     ]

     function handleChange(e) {
          const params = new URLSearchParams(searchParams)
          params.set('sort', e.target.value)
          router.push(`${pathname}?${params.toString()}`)
     }

     return (
          <select value={current} onChange={handleChange} className={styles.select} aria-label={t('ariaLabel')}>
               {SORT_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
               ))}
          </select>
     )
}
