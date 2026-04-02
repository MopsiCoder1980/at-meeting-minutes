import { getAuthUser, canEdit, canDelete, canView } from '@/lib/auth'
import { getMinuteById } from '@/lib/store'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import DeleteButton from '@/components/DeleteButton'
import HtmlRenderer from '@/components/HtmlRenderer'
import styles from './page.module.css'

function Section({ title, children }) {
     return (
          <div className={styles.section}>
               <h2 className={styles.sectionTitle}>{title}</h2>
               {children}
          </div>
     )
}

function BulletList({ items }) {
     if (!items?.length) return <p className={styles.empty}>—</p>
     return <ul className={styles.list}>{items.map((item, i) => <li key={i}>{item}</li>)}</ul>
}

export default async function MinutePage({ params }) {
     const { id } = await params

     const authUser = await getAuthUser()
     const minute = await getMinuteById(id)

     if (!minute || !canView(authUser, minute)) {
          notFound()
     }

     const s = minute.structure ?? {}
     const att = s.attendees ?? {}

     return (
          <article className={styles.container}>
               <div className={styles.header}>
                    <div>
                         {minute.projectTitle && <p className={styles.projectTitle}>{minute.projectTitle}</p>}
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

               <Section title="Teilnehmer">
                    <div className={styles.attendees}>
                         <div>
                              <p className={styles.attendeeGroup}>Meeting Owner(s)</p>
                              <BulletList items={att.meetingOwners} />
                         </div>
                         <div>
                              <p className={styles.attendeeGroup}>Agenda Owner(s)</p>
                              <BulletList items={att.agendaOwners} />
                         </div>
                         <div>
                              <p className={styles.attendeeGroup}>Teilnehmer</p>
                              <BulletList items={att.attendees} />
                         </div>
                    </div>
               </Section>

               <Section title="Themen">
                    <BulletList items={s.topics} />
               </Section>

               <Section title="Entscheidungen">
                    <BulletList items={s.decisions} />
               </Section>

               <Section title="Action Items">
                    {s.actionItems?.length ? (
                         <table className={styles.table}>
                              <thead>
                                   <tr><th>Aufgabe</th><th>Verantwortlich</th><th>Deadline</th></tr>
                              </thead>
                              <tbody>
                                   {s.actionItems.map((item, i) => (
                                        <tr key={i}>
                                             <td>{item.task}</td>
                                             <td>{item.personInCharge}</td>
                                             <td>{item.deadline ? new Date(item.deadline).toLocaleDateString('de-DE') : '—'}</td>
                                        </tr>
                                   ))}
                              </tbody>
                         </table>
                    ) : <p className={styles.empty}>—</p>}
               </Section>

               <Section title="Offene Fragen">
                    <BulletList items={s.openQuestions} />
               </Section>

               {minute.content && (
                    <Section title="Notizen">
                         <div className={styles.content}>
                              <HtmlRenderer content={minute.content} />
                         </div>
                    </Section>
               )}

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
