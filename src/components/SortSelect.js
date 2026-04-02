'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import styles from './SortSelect.module.css'

const SORT_OPTIONS = [
     { value: 'date-desc', label: 'Datum absteigend' },
     { value: 'date-asc', label: 'Datum aufsteigend' },
]

export default function SortSelect({ current }) {
     const router = useRouter()
     const pathname = usePathname()
     const searchParams = useSearchParams()

     function handleChange(e) {
          const params = new URLSearchParams(searchParams)
          params.set('sort', e.target.value)
          router.push(`${pathname}?${params.toString()}`)
     }

     return (
          <select
               value={current}
               onChange={handleChange}
               className={styles.select}
               aria-label="Sortierung"
          >
               {SORT_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
               ))}
          </select>
     )
}
