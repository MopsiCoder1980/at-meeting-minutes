'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import styles from './MineToggle.module.css'

export default function MineToggle({ active }) {
     const router = useRouter()
     const pathname = usePathname()
     const searchParams = useSearchParams()

     function handleClick() {
          const params = new URLSearchParams(searchParams)
          if (active) {
               params.delete('mine')
          } else {
               params.set('mine', '1')
          }
          router.push(`${pathname}?${params.toString()}`)
     }

     return (
          <button
               onClick={handleClick}
               className={`${styles.toggle} ${active ? styles.active : ''}`}
               aria-pressed={active}
          >
               Nur meine
          </button>
     )
}
