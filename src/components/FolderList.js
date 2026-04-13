'use client'

import { usePathname, useSearchParams, useRouter } from 'next/navigation'
import { useActionState, useTransition, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { createFolderAction, deleteFolderAction, moveMinuteToFolderAction, renameFolderAction } from '@/lib/folderActions'
import styles from './Sidebar.module.css'

export default function FolderList({ folders }) {
     const pathname = usePathname()
     const searchParams = useSearchParams()
     const router = useRouter()
     const activeFolder = searchParams.get('folder')
     const t = useTranslations('folder')

     const [creating, setCreating] = useState(false)
     const [confirmDelete, setConfirmDelete] = useState(null)
     const [renaming, setRenaming] = useState(null)
     const [renameValue, setRenameValue] = useState('')
     const [dragOver, setDragOver] = useState(null)
     const [, startTransition] = useTransition()
     const inputRef = useRef(null)

     function startRename(folder, e) {
          e.stopPropagation()
          setRenaming(folder.id)
          setRenameValue(folder.name)
     }

     function submitRename(id) {
          if (renameValue.trim()) startTransition(() => renameFolderAction(id, renameValue.trim()))
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
          if (folderId) { params.set('folder', folderId) } else { params.delete('folder') }
          router.push(`/dashboard?${params.toString()}`)
     }

     function onDragOver(e, folderId) { e.preventDefault(); setDragOver(folderId) }
     function onDragLeave() { setDragOver(null) }
     function onDrop(e, folderId) {
          e.preventDefault(); setDragOver(null)
          const minuteId = e.dataTransfer.getData('minuteId')
          if (!minuteId) return
          startTransition(() => moveMinuteToFolderAction(minuteId, folderId))
     }
     function onDropToRoot(e) {
          e.preventDefault(); setDragOver('root')
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
                    <span className={styles.folderName}>{t('all')}</span>
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
                                   onKeyDown={e => { if (e.key === 'Enter') submitRename(folder.id); if (e.key === 'Escape') setRenaming(null) }}
                                   onClick={e => e.stopPropagation()}
                              />
                         ) : (
                              <>
                                   <button className={styles.folderItemInner} onClick={() => navigateTo(folder.id)}>
                                        <span className={styles.folderIcon}>📁</span>
                                        <span className={styles.folderName}>{folder.name}</span>
                                   </button>
                                   <button className={styles.renameBtn} title={t('rename')} onClick={e => startRename(folder, e)} aria-label={`${t('rename')}: ${folder.name}`}>✎</button>
                                   <button className={styles.deleteFolder} title={t('delete')} onClick={e => { e.stopPropagation(); setConfirmDelete({ id: folder.id, name: folder.name }) }} aria-label={`${t('delete')}: ${folder.name}`}>×</button>
                              </>
                         )}
                    </div>
               ))}

               {creating ? (
                    <form action={formAction} className={styles.createForm}>
                         <input ref={inputRef} name="name" autoFocus placeholder={t('namePlaceholder')} className={styles.createInput} onKeyDown={e => e.key === 'Escape' && setCreating(false)} />
                         <button type="submit" className={styles.createSubmit}>✓</button>
                         <button type="button" className={styles.createCancel} onClick={() => setCreating(false)}>×</button>
                    </form>
               ) : (
                    <button className={styles.addFolderBtn} onClick={() => setCreating(true)}>{t('add')}</button>
               )}
               {state?.error && <p className={styles.error}>{state.error}</p>}

               {confirmDelete && (
                    <div className={styles.confirmBackdrop} onMouseDown={() => setConfirmDelete(null)}>
                         <div className={styles.confirmModal} onMouseDown={e => e.stopPropagation()} role="dialog" aria-modal="true">
                              <p className={styles.confirmText}>
                                   <strong>„{confirmDelete.name}"</strong> {t('confirmDeleteSuffix')}
                              </p>
                              <p className={styles.confirmSub}>{t('confirmSub')}</p>
                              <div className={styles.confirmActions}>
                                   <button className={styles.confirmCancel} onClick={() => setConfirmDelete(null)}>{t('cancel')}</button>
                                   <button className={styles.confirmDelete} onClick={() => { startTransition(() => deleteFolderAction(confirmDelete.id)); setConfirmDelete(null) }}>{t('confirmDeleteBtn')}</button>
                              </div>
                         </div>
                    </div>
               )}
          </div>
     )
}
