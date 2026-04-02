'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import CalendarOverlay from './CalendarOverlay'
import styles from './CalendarButton.module.css'

export default function CalendarButton({ minuteDates }) {
     const [open, setOpen] = useState(false)
     const router = useRouter()
     const searchParams = useSearchParams()

     function handleApply(dateKey) {
          const params = new URLSearchParams(searchParams)
          params.set('date', dateKey)
          router.push(`/dashboard?${params.toString()}`)
     }

     return (
          <>
               <button className={styles.btn} onClick={() => setOpen(true)} title="Kalender anzeigen">
                    📅 Kalender
               </button>
               {open && (
                    <CalendarOverlay
                         minuteDates={minuteDates}
                         onClose={() => setOpen(false)}
                         onApply={handleApply}
                    />
               )}
          </>
     )
}
