import { getAuthUser, canEdit, canDelete, canView } from '@/lib/auth'
import { getMinuteById } from '@/lib/store'
import { getTranslations, getLocale } from 'next-intl/server'
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

     const [authUser, minute, t, locale] = await Promise.all([
          getAuthUser(),
          getMinuteById(id),
          getTranslations('minute'),
          getLocale(),
     ])

     if (!minute || !canView(authUser, minute)) notFound()

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
                              <span>{new Date(minute.meetingDate ?? minute.createdAt).toLocaleString(locale, { dateStyle: 'short', timeStyle: 'short' })}</span>
                              <span>·</span>
                              <span className={`${styles.badge} ${minute.visibility === 'shared' ? styles.shared : styles.private}`}>
                                   {minute.visibility === 'shared' ? t('shared') : t('private')}
                              </span>
                         </div>
                         {minute.tags?.length > 0 && (
                              <div className={styles.tags}>
                                   {minute.tags.map(tag => <span key={tag} className={styles.tag}>{tag}</span>)}
                              </div>
                         )}
                    </div>
                    <div className={styles.actions}>
                         {canEdit(authUser, minute) && <Link href={`/minutes/${id}/edit`} className={styles.editBtn}>{t('edit')}</Link>}
                         {canDelete(authUser, minute) && <DeleteButton id={id} />}
                    </div>
               </div>

               <Section title={t('sectionAttendees')}>
                    <div className={styles.attendees}>
                         <div><p className={styles.attendeeGroup}>{t('meetingOwners')}</p><BulletList items={att.meetingOwners} /></div>
                         <div><p className={styles.attendeeGroup}>{t('agendaOwners')}</p><BulletList items={att.agendaOwners} /></div>
                         <div><p className={styles.attendeeGroup}>{t('attendees')}</p><BulletList items={att.attendees} /></div>
                    </div>
               </Section>

               <Section title={t('sectionTopics')}><BulletList items={s.topics} /></Section>
               <Section title={t('sectionDecisions')}><BulletList items={s.decisions} /></Section>

               <Section title={t('sectionActionItems')}>
                    {s.actionItems?.length ? (
                         <table className={styles.table}>
                              <thead><tr><th>{t('actionTask')}</th><th>{t('actionResponsible')}</th><th>{t('actionDeadline')}</th></tr></thead>
                              <tbody>
                                   {s.actionItems.map((item, i) => (
                                        <tr key={i}>
                                             <td>{item.task}</td>
                                             <td>{item.personInCharge}</td>
                                             <td>{item.deadline ? new Date(item.deadline).toLocaleDateString(locale) : '—'}</td>
                                        </tr>
                                   ))}
                              </tbody>
                         </table>
                    ) : <p className={styles.empty}>—</p>}
               </Section>

               <Section title={t('sectionOpenQuestions')}><BulletList items={s.openQuestions} /></Section>

               {minute.content && (
                    <Section title={t('sectionNotes')}>
                         <div className={styles.content}><HtmlRenderer content={minute.content} /></div>
                    </Section>
               )}

               {minute.attachments?.length > 0 && (
                    <Section title={t('sectionAttachments')}>
                         <ul className={styles.attachmentList}>
                              {minute.attachments.map((att, i) => (
                                   <li key={i} className={styles.attachmentItem}>
                                        <a href={att.url} download={att.name} className={styles.attachmentLink}>
                                             {att.name}
                                        </a>
                                        <span className={styles.attachmentMeta}>
                                             {att.type?.split('/')[1]?.toUpperCase()} · {att.size ? `${Math.round(att.size / 1024)} KB` : ''}
                                        </span>
                                   </li>
                              ))}
                         </ul>
                    </Section>
               )}

               <div className={styles.footer}>
                    <Link href="/dashboard">{t('back')}</Link>
                    {minute.updatedAt !== minute.createdAt && (
                         <span className={styles.updated}>{t('lastEdited')} {new Date(minute.updatedAt).toLocaleDateString(locale)}</span>
                    )}
               </div>
          </article>
     )
}
