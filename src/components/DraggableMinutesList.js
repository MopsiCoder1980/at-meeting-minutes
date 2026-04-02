'use client'

import { useState } from 'react'
import Link from 'next/link'
import MoveToFolderOverlay from './MoveToFolderOverlay'
import styles from './MinutesList.module.css'
import dragStyles from './DraggableMinutesList.module.css'

const folderMap = (folders) => Object.fromEntries(folders.map(f => [f.id, f.name]))

export default function DraggableMinutesList({ minutes, folders }) {
     const [overlay, setOverlay] = useState(null) // { minuteId, minuteTitle, currentFolderId }
     const [dragging, setDragging] = useState(null)
     const folderNames = folderMap(folders)

     if (minutes.length === 0) {
          return (
               <div className={styles.empty}>
                    <p>Noch keine Meeting Minutes vorhanden.</p>
                    <Link href="/minutes/new">Erstes Meeting anlegen</Link>
               </div>
          )
     }

     return (
          <>
               <ul className={styles.list}>
                    {minutes.map(m => (
                         <li
                              key={m.id}
                              className={`${styles.item} ${dragging === m.id ? dragStyles.dragging : ''}`}
                              draggable
                              onDragStart={e => {
                                   e.dataTransfer.setData('minuteId', m.id)
                                   e.dataTransfer.effectAllowed = 'move'
                                   setDragging(m.id)
                              }}
                              onDragEnd={() => setDragging(null)}
                         >
                              <div className={dragStyles.itemTop}>
                                   <span className={dragStyles.dragHandle} title="Ziehen zum Verschieben">⠿</span>
                                   <Link href={`/minutes/${m.id}`} className={styles.title}>
                                        {m.title}
                                   </Link>
                                   <span className={dragStyles.folderLabel}>
                                        {m.folderId && folderNames[m.folderId] ? `📁 ${folderNames[m.folderId]}` : 'nicht zugewiesen'}
                                   </span>
                              </div>
                              <div className={styles.meta}>
                                   <div className={styles.metaLeft}>
                                        <span className={`${styles.badge} ${m.visibility === 'shared' ? styles.shared : styles.private}`}>
                                             {m.visibility === 'shared' ? 'Geteilt' : 'Privat'}
                                        </span>
                                        <span className={styles.author}>{m.ownerName}</span>
                                        <span className={styles.date}>
                                             {new Date(m.meetingDate ?? m.createdAt).toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'short' })}
                                        </span>
                                   </div>
                                   <div className={dragStyles.metaRight}>
                                        {m.tags?.length > 0 && (
                                             <div className={styles.tags}>
                                                  {m.tags.map(tag => (
                                                       <span key={tag} className={styles.tag}>{tag}</span>
                                                  ))}
                                             </div>
                                        )}
                                        <button
                                             className={dragStyles.moveBtn}
                                             onClick={() => setOverlay({ minuteId: m.id, minuteTitle: m.title, currentFolderId: m.folderId })}
                                             title="Verschieben nach"
                                        >
                                             Verschieben nach
                                        </button>
                                   </div>
                              </div>
                         </li>
                    ))}
               </ul>

               {overlay && (
                    <MoveToFolderOverlay
                         minuteId={overlay.minuteId}
                         minuteTitle={overlay.minuteTitle}
                         folders={folders}
                         currentFolderId={overlay.currentFolderId}
                         onClose={() => setOverlay(null)}
                    />
               )}
          </>
     )
}
