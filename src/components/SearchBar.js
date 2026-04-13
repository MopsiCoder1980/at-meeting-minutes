'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import styles from './SearchBar.module.css'

export default function SearchBar() {
     const [query, setQuery] = useState('')
     const [results, setResults] = useState([])
     const [open, setOpen] = useState(false)
     const [loading, setLoading] = useState(false)
     const [activeIndex, setActiveIndex] = useState(-1)
     const containerRef = useRef(null)
     const debounceRef = useRef(null)
     const router = useRouter()
     const t = useTranslations('search')

     useEffect(() => {
          clearTimeout(debounceRef.current)
          if (query.length < 2) { setResults([]); setOpen(false); return }
          debounceRef.current = setTimeout(async () => {
               setLoading(true)
               try {
                    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
                    const data = await res.json()
                    setResults(data.results ?? [])
                    setOpen(true)
                    setActiveIndex(-1)
               } finally { setLoading(false) }
          }, 250)
          return () => clearTimeout(debounceRef.current)
     }, [query])

     useEffect(() => {
          function onClickOutside(e) {
               if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false)
          }
          document.addEventListener('mousedown', onClickOutside)
          return () => document.removeEventListener('mousedown', onClickOutside)
     }, [])

     function navigate(id) { setOpen(false); setQuery(''); router.push(`/minutes/${id}`) }

     function onKeyDown(e) {
          if (!open || results.length === 0) return
          if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex(i => Math.min(i + 1, results.length - 1)) }
          else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIndex(i => Math.max(i - 1, 0)) }
          else if (e.key === 'Enter' && activeIndex >= 0) { e.preventDefault(); navigate(results[activeIndex].id) }
          else if (e.key === 'Escape') setOpen(false)
     }

     return (
          <div className={styles.wrapper} ref={containerRef}>
               <input
                    className={styles.input}
                    type="search"
                    placeholder={t('placeholder')}
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onKeyDown={onKeyDown}
                    onFocus={() => results.length > 0 && setOpen(true)}
                    aria-label={t('ariaLabel')}
                    aria-autocomplete="list"
                    aria-expanded={open}
               />
               {loading && <span className={styles.spinner} aria-hidden="true" />}
               {open && results.length > 0 && (
                    <ul className={styles.dropdown} role="listbox">
                         {results.map((r, i) => (
                              <li
                                   key={r.id}
                                   className={`${styles.item} ${i === activeIndex ? styles.active : ''}`}
                                   role="option"
                                   aria-selected={i === activeIndex}
                                   onMouseEnter={() => setActiveIndex(i)}
                                   onMouseDown={() => navigate(r.id)}
                              >
                                   <span className={styles.itemTitle}>{r.title}</span>
                                   <div className={styles.itemMeta}>
                                        {r.ownerName && <span>{r.ownerName}</span>}
                                        {r.meetingDate && <span>{new Date(r.meetingDate).toLocaleDateString(undefined, { dateStyle: 'short' })}</span>}
                                        {r.tags?.length > 0 && <span className={styles.tags}>{r.tags.slice(0, 3).join(', ')}</span>}
                                        <span className={`${styles.badge} ${r.visibility === 'shared' ? styles.shared : styles.private}`}>
                                             {r.visibility === 'shared' ? t('shared') : t('private')}
                                        </span>
                                   </div>
                              </li>
                         ))}
                    </ul>
               )}
               {open && results.length === 0 && !loading && query.length >= 2 && (
                    <div className={styles.empty}>{t('noResults')}</div>
               )}
          </div>
     )
}
