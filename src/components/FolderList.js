'use client'

import { usePathname, useSearchParams, useRouter } from 'next/navigation'
import { useActionState, useTransition, useRef, useState } from 'react'
import { createFolderAction, deleteFolderAction, moveMinuteToFolderAction, renameFolderAction } from '@/lib/folderActions'
import styles from './Sidebar.module.css'

export default function FolderList({ folders }) {
     const pathname = usePathname()
     const searchParams = useSearchParams()
     const router = useRouter()
     const activeFolder = searchParams.get('folder')

     const [creating, setCreating] = useState(false)
     const [confirmDelete, setConfirmDelete] = useState(null) // { id, name }
     const [renaming, setRenaming] = useState(null) // folder id being renamed
     const [renameValue, setRenameValue] = useState('')
     const [dragOver, setDragOver] = useState(null) // folder id being dragged over
     const [, startTransition] = useTransition()
     const inputRef = useRef(null)

     function startRename(folder, e) {
          e.stopPropagation()
          setRenaming(folder.id)
          setRenameValue(folder.name)
     }

     function submitRename(id) {
          if (renameValue.trim()) {
               startTransition(() => renameFolderAction(id, renameValue.trim()))
          }
          setRenaming(null)
     }

     const [state, formAction] = useActionState(
          async (prev, formData) => {
               const result = await createFolderAction(prev, formData)
               if (result?.success) setCreating(false)
               return result
          },
          null
     )

     function navigateTo(folderId) {
          const params = new URLSearchParams(searchParams)
          if (folderId) {
               params.set('folder', folderId)
          } else {
               params.delete('folder')
          }
          router.push(`/dashboard?${params.toString()}`)
     }

     function onDragOver(e, folderId) {
          e.preventDefault()
          setDragOver(folderId)
     }

     function onDragLeave() {
          setDragOver(null)
     }

     function onDrop(e, folderId) {
          e.preventDefault()
          setDragOver(null)
          const minuteId = e.dataTransfer.getData('minuteId')
          if (!minuteId) return
          startTransition(() => moveMinuteToFolderAction(minuteId, folderId))
     }

     function onDropToRoot(e) {
          e.preventDefault()
          setDragOver('root')
          const minuteId = e.dataTransfer.getData('minuteId')
          if (!minuteId) return
          startTransition(() => moveMinuteToFolderAction(minuteId, null))
          setDragOver(null)
     }

     return (
          <div className={styles.folderList}>
               <button
                    className={`${styles.folderItem} ${!activeFolder ? styles.active : ''} ${dragOver === 'root' ? styles.dragOver : ''}`}
                    onClick={() => navigateTo(null)}
                    onDragOver={e => { e.preventDefault(); setDragOver('root') }}
                    onDragLeave={onDragLeave}
                    onDrop={onDropToRoot}
               >
                    <span className={styles.folderIcon}>📋</span>
                    <span className={styles.folderName}>Alle Meetings</span>
               </button>

               {folders.map(folder => (
                    <div
                         key={folder.id}
                         className={`${styles.folderItem} ${activeFolder === folder.id ? styles.active : ''} ${dragOver === folder.id ? styles.dragOver : ''}`}
                         onDragOver={e => onDragOver(e, folder.id)}
                         onDragLeave={onDragLeave}
                         onDrop={e => onDrop(e, folder.id)}
                    >
                         {renaming === folder.id ? (
                              <input
                                   className={styles.renameInput}
                                   value={renameValue}
                                   autoFocus
                                   onChange={e => setRenameValue(e.target.value)}
                                   onBlur={() => submitRename(folder.id)}
                                   onKeyDown={e => {
                                        if (e.key === 'Enter') submitRename(folder.id)
                                        if (e.key === 'Escape') setRenaming(null)
                                   }}
                                   onClick={e => e.stopPropagation()}
                              />
                         ) : (
                              <>
                                   <button
                                        className={styles.folderItemInner}
                                        onClick={() => navigateTo(folder.id)}
                                   >
                                        <span className={styles.folderIcon}>📁</span>
                                        <span className={styles.folderName}>{folder.name}</span>
                                   </button>
                                   <button
                                        className={styles.renameBtn}
                                        title="Umbenennen"
                                        onClick={e => startRename(folder, e)}
                                        aria-label={`Ordner ${folder.name} umbenennen`}
                                   >
                                        ✎
                                   </button>
                                   <button
                                        className={styles.deleteFolder}
                                        title="Ordner löschen"
                                        onClick={e => { e.stopPropagation(); setConfirmDelete({ id: folder.id, name: folder.name }) }}
                                        aria-label={`Ordner ${folder.name} löschen`}
                                   >
                                        ×
                                   </button>
                              </>
                         )}
                    </div>
               ))}

               {creating ? (
                    <form action={formAction} className={styles.createForm}>
                         <input
                              ref={inputRef}
                              name="name"
                              autoFocus
                              placeholder="Ordnername…"
                              className={styles.createInput}
                              onKeyDown={e => e.key === 'Escape' && setCreating(false)}
                         />
                         <button type="submit" className={styles.createSubmit}>✓</button>
                         <button type="button" className={styles.createCancel} onClick={() => setCreating(false)}>×</button>
                    </form>
               ) : (
                    <button className={styles.addFolderBtn} onClick={() => setCreating(true)}>
                         + Ordner
                    </button>
               )}
               {state?.error && <p className={styles.error}>{state.error}</p>}

               {confirmDelete && (
                    <div className={styles.confirmBackdrop} onMouseDown={() => setConfirmDelete(null)}>
                         <div className={styles.confirmModal} onMouseDown={e => e.stopPropagation()} role="dialog" aria-modal="true">
                              <p className={styles.confirmText}>
                                   Ordner <strong>„{confirmDelete.name}"</strong> löschen?
                              </p>
                              <p className={styles.confirmSub}>Enthaltene Meeting Minutes werden keinem Ordner mehr zugeordnet.</p>
                              <div className={styles.confirmActions}>
                                   <button
                                        className={styles.confirmCancel}
                                        onClick={() => setConfirmDelete(null)}
                                   >
                                        Abbrechen
                                   </button>
                                   <button
                                        className={styles.confirmDelete}
                                        onClick={() => {
                                             startTransition(() => deleteFolderAction(confirmDelete.id))
                                             setConfirmDelete(null)
                                        }}
                                   >
                                        Löschen
                                   </button>
                              </div>
                         </div>
                    </div>
               )}
          </div>
     )
}
