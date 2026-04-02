import { getAuthUser, canEdit, canDelete, canView } from '@/lib/auth'
import { getMinuteById } from '@/lib/store'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import DeleteButton from '@/components/DeleteButton'
import HtmlRenderer from '@/components/HtmlRenderer'
import styles from './page.module.css'

export default async function MinutePage({ params }) {
     const { id } = await params

     const authUser = await getAuthUser()
     const minute = await getMinuteById(id)

     if (!minute || !canView(authUser, minute)) {
          notFound()
     }

     return (
          <article className={styles.container}>
               <div className={styles.header}>
                    <div>
                         <h1>{minute.title}</h1>
                         <div className={styles.meta}>
                              <span>{minute.ownerName}</span>
                              <span>·</span>
                              <span>{new Date(minute.meetingDate ?? minute.createdAt).toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'short' })}</span>
                              <span>·</span>
                              <span className={`${styles.badge} ${minute.visibility === 'shared' ? styles.shared : styles.private}`}>
                                   {minute.visibility === 'shared' ? 'Geteilt' : 'Privat'}
                              </span>
                         </div>
                         {minute.tags?.length > 0 && (
                              <div className={styles.tags}>
                                   {minute.tags.map(tag => (
                                        <span key={tag} className={styles.tag}>{tag}</span>
                                   ))}
                              </div>
                         )}
                    </div>
                    <div className={styles.actions}>
                         {canEdit(authUser, minute) && (
                              <Link href={`/minutes/${id}/edit`} className={styles.editBtn}>
                                   Bearbeiten
                              </Link>
                         )}
                         {canDelete(authUser, minute) && <DeleteButton id={id} />}
                    </div>
               </div>

               <div className={styles.content}>
                    <HtmlRenderer content={minute.content} />
               </div>

               <div className={styles.footer}>
                    <Link href="/dashboard">← Zurück zur Übersicht</Link>
                    {minute.updatedAt !== minute.createdAt && (
                         <span className={styles.updated}>
                              Zuletzt bearbeitet: {new Date(minute.updatedAt).toLocaleDateString('de-DE')}
                         </span>
                    )}
               </div>
          </article>
     )
}
