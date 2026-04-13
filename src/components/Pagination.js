'use client'

import { useSearchParams, usePathname, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import styles from './Pagination.module.css'

function buildPages(current, total) {
     if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1)
     const winStart = Math.max(2, current - 1)
     const winEnd = Math.min(total - 1, current + 1)
     const pages = [1]
     if (winStart > 2) pages.push('...')
     for (let i = winStart; i <= winEnd; i++) pages.push(i)
     if (winEnd < total - 1) pages.push('...')
     pages.push(total)
     return pages
}

export default function Pagination({ currentPage, totalPages }) {
     const searchParams = useSearchParams()
     const pathname = usePathname()
     const router = useRouter()
     const t = useTranslations('pagination')

     if (totalPages <= 1) return null

     function go(page) {
          const params = new URLSearchParams(searchParams.toString())
          params.set('page', String(page))
          router.push(`${pathname}?${params.toString()}`)
     }

     const pages = buildPages(currentPage, totalPages)

     return (
          <nav className={styles.nav} aria-label={t('nav')}>
               <button className={styles.btn} onClick={() => go(currentPage - 1)} disabled={currentPage <= 1} aria-label={t('prevAriaLabel')}>
                    {t('prev')}
               </button>
               <div className={styles.pages}>
                    {pages.map((p, i) =>
                         p === '...'
                              ? <span key={`ellipsis-${i}`} className={styles.ellipsis}>…</span>
                              : <button key={p} className={`${styles.page} ${p === currentPage ? styles.active : ''}`} onClick={() => go(p)} aria-current={p === currentPage ? 'page' : undefined}>{p}</button>
                    )}
               </div>
               <button className={styles.btn} onClick={() => go(currentPage + 1)} disabled={currentPage >= totalPages} aria-label={t('nextAriaLabel')}>
                    {t('next')}
               </button>
          </nav>
     )
}
