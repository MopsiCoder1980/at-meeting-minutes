'use client'

import { useTransition, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { moveMinuteToFolderAction } from '@/lib/folderActions'
import styles from './MoveToFolderOverlay.module.css'

export default function MoveToFolderOverlay({ minuteId, minuteTitle, folders, currentFolderId, onClose }) {
     const [isPending, startTransition] = useTransition()
     const t = useTranslations('moveOverlay')

     useEffect(() => {
          function onKey(e) {
               if (e.key === 'Escape') onClose()
          }
          document.addEventListener('keydown', onKey)
          return () => document.removeEventListener('keydown', onKey)
     }, [onClose])

     function move(folderId) {
          startTransition(async () => {
               await moveMinuteToFolderAction(minuteId, folderId)
               onClose()
          })
     }

     return (
          <div className={styles.backdrop} onMouseDown={onClose}>
               <div className={styles.modal} onMouseDown={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={t('title')}>
                    <div className={styles.header}>
                         <h2 className={styles.title}>{t('title')}</h2>
                         <button className={styles.closeBtn} onClick={onClose} aria-label={t('close')}>×</button>
                    </div>
                    <p className={styles.subtitle} title={minuteTitle}>{minuteTitle}</p>
                    <ul className={styles.list}>
                         <li>
                              <button
                                   className={`${styles.option} ${!currentFolderId ? styles.current : ''}`}
                                   onClick={() => move(null)}
                                   disabled={isPending}
                              >
                                   <span className={styles.icon}>📋</span>
                                   <span>{t('noFolder')}</span>
                                   {!currentFolderId && <span className={styles.check}>✓</span>}
                              </button>
                         </li>
                         {folders.map(folder => (
                              <li key={folder.id}>
                                   <button
                                        className={`${styles.option} ${currentFolderId === folder.id ? styles.current : ''}`}
                                        onClick={() => move(folder.id)}
                                        disabled={isPending}
                                   >
                                        <span className={styles.icon}>📁</span>
                                        <span>{folder.name}</span>
                                        {currentFolderId === folder.id && <span className={styles.check}>✓</span>}
                                   </button>
                              </li>
                         ))}
                    </ul>
                    {folders.length === 0 && (
                         <p className={styles.empty}>{t('noFolders')}</p>
                    )}
               </div>
          </div>
     )
}
