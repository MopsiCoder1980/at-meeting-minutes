'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import styles from './DateFilterBadge.module.css'

export default function DateFilterBadge({ date }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const label = new Date(date + 'T00:00:00').toLocaleDateString('de-DE', { dateStyle: 'long' })

  function clear() {
    const params = new URLSearchParams(searchParams)
    params.delete('date')
    router.push(`/dashboard?${params.toString()}`)
  }

  return (
    <div className={styles.badge}>
      <span>📅 {label}</span>
      <button onClick={clear} className={styles.clearBtn} aria-label="Datumsfilter entfernen">×</button>
    </div>
  )
}
