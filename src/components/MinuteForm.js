'use client'

import { useActionState, useState } from 'react'
import { useTranslations } from 'next-intl'
import RichTextEditor from './RichTextEditor'
import DateTimePicker from './DateTimePicker'
import TagInput from './TagInput'
import styles from './MinuteForm.module.css'

function ListField({ label, items, onChange, addLabel }) {
     function add() { onChange([...items, '']) }
     function remove(i) { onChange(items.filter((_, idx) => idx !== i)) }
     function update(i, val) { onChange(items.map((v, idx) => idx === i ? val : v)) }
     return (
          <div className={styles.listField}>
               <span className={styles.listLabel}>{label}</span>
               {items.map((v, i) => (
                    <div key={i} className={styles.listRow}>
                         <input type="text" value={v} onChange={e => update(i, e.target.value)} />
                         <button type="button" className={styles.removeBtn} onClick={() => remove(i)}>×</button>
                    </div>
               ))}
               <button type="button" className={styles.addBtn} onClick={add}>{addLabel}</button>
          </div>
     )
}

function UserListField({ label, items, onChange, usernames, addUserLabel }) {
     const available = usernames.filter(u => !items.includes(u))
     function add(username) { if (username) onChange([...items, username]) }
     function remove(i) { onChange(items.filter((_, idx) => idx !== i)) }
     return (
          <div className={styles.listField}>
               <span className={styles.listLabel}>{label}</span>
               {items.map((v, i) => (
                    <div key={i} className={styles.listRow}>
                         <span className={styles.userChip}>{v}</span>
                         <button type="button" className={styles.removeBtn} onClick={() => remove(i)}>×</button>
                    </div>
               ))}
               {available.length > 0 && (
                    <select className={styles.userSelect} value="" onChange={e => add(e.target.value)}>
                         <option value="">{addUserLabel}</option>
                         {available.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
               )}
          </div>
     )
}

function ActionItemsField({ items, onChange, usernames, t }) {
     function add() { onChange([...items, { task: '', personInCharge: '', deadline: '' }]) }
     function remove(i) { onChange(items.filter((_, idx) => idx !== i)) }
     function update(i, key, val) { onChange(items.map((v, idx) => idx === i ? { ...v, [key]: val } : v)) }
     return (
          <div className={styles.listField}>
               {items.map((item, i) => (
                    <div key={i} className={styles.actionRow}>
                         <input type="text" placeholder={t('task')} value={item.task} onChange={e => update(i, 'task', e.target.value)} className={styles.actionTask} />
                         <select value={item.personInCharge} onChange={e => update(i, 'personInCharge', e.target.value)} className={styles.actionPerson}>
                              <option value="">{t('person')}</option>
                              {usernames.map(u => <option key={u} value={u}>{u}</option>)}
                         </select>
                         <input type="date" value={item.deadline} onChange={e => update(i, 'deadline', e.target.value)} className={styles.actionDeadline} />
                         <button type="button" className={styles.removeBtn} onClick={() => remove(i)}>×</button>
                    </div>
               ))}
               <button type="button" className={styles.addBtn} onClick={add}>{t('addItem')}</button>
          </div>
     )
}

export default function MinuteForm({ action, defaultValues, allTags = [], folders, allUsers = [] }) {
     const usernames = allUsers.map(u => u.username)
     const [state, formAction, pending] = useActionState(action, null)
     const t = useTranslations('form')

     const def = defaultValues?.structure ?? {}
     const defAtt = def.attendees ?? { meetingOwners: [], agendaOwners: [], attendees: [] }

     const [meetingOwners, setMeetingOwners] = useState(defAtt.meetingOwners ?? [])
     const [agendaOwners, setAgendaOwners] = useState(defAtt.agendaOwners ?? [])
     const [attendees, setAttendees] = useState(defAtt.attendees ?? [])
     const [topics, setTopics] = useState(def.topics ?? [])
     const [decisions, setDecisions] = useState(def.decisions ?? [])
     const [actionItems, setActionItems] = useState(def.actionItems ?? [])
     const [openQuestions, setOpenQuestions] = useState(def.openQuestions ?? [])

     const structure = JSON.stringify({
          attendees: { meetingOwners, agendaOwners, attendees },
          topics, decisions, actionItems, openQuestions,
     })

     return (
          <form action={formAction} className={styles.form}>
               {state?.error && <p className={styles.error}>{state.error}</p>}

               <div className={styles.field}>
                    <label htmlFor="projectTitle">{t('projectTitle')}</label>
                    <input id="projectTitle" name="projectTitle" type="text" defaultValue={defaultValues?.projectTitle ?? ''} required placeholder={t('projectTitle')} />
               </div>

               <div className={styles.field}>
                    <label htmlFor="title">{t('title')}</label>
                    <input id="title" name="title" type="text" defaultValue={defaultValues?.title ?? ''} required placeholder={t('title')} />
               </div>

               <div className={styles.field}>
                    <label>{t('dateTime')}</label>
                    <DateTimePicker name="meetingDate" defaultValue={defaultValues?.meetingDate ?? ''} />
               </div>

               <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>{t('attendees')}</h3>
                    <UserListField label={t('meetingOwners')} items={meetingOwners} onChange={setMeetingOwners} usernames={usernames} addUserLabel={t('addUser')} />
                    <UserListField label={t('agendaOwners')} items={agendaOwners} onChange={setAgendaOwners} usernames={usernames} addUserLabel={t('addUser')} />
                    <UserListField label={t('attendees')} items={attendees} onChange={setAttendees} usernames={usernames} addUserLabel={t('addUser')} />
               </div>

               <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>{t('topics')}</h3>
                    <ListField label="" items={topics} onChange={setTopics} addLabel={t('addItem')} />
               </div>

               <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>{t('decisions')}</h3>
                    <ListField label="" items={decisions} onChange={setDecisions} addLabel={t('addItem')} />
               </div>

               <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>{t('actionItems')}</h3>
                    <div className={styles.actionHeader}>
                         <span>{t('task')}</span><span>{t('responsible')}</span><span>{t('deadline')}</span>
                    </div>
                    <ActionItemsField items={actionItems} onChange={setActionItems} usernames={usernames} t={t} />
               </div>

               <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>{t('openQuestions')}</h3>
                    <ListField label="" items={openQuestions} onChange={setOpenQuestions} addLabel={t('addItem')} />
               </div>

               <input type="hidden" name="structure" value={structure} />

               <div className={styles.field}>
                    <label>{t('tags')}</label>
                    <TagInput name="tags" defaultValue={defaultValues?.tags ?? []} suggestions={allTags} />
               </div>

               <div className={styles.field}>
                    <label htmlFor="visibility">{t('visibility')}</label>
                    <select id="visibility" name="visibility" defaultValue={defaultValues?.visibility ?? 'private'}>
                         <option value="private">{t('private')}</option>
                         <option value="shared">{t('shared')}</option>
                    </select>
               </div>

               {folders && (
                    <div className={styles.field}>
                         <label htmlFor="folderId">{t('folder')}</label>
                         <select id="folderId" name="folderId" defaultValue={defaultValues?.folderId ?? ''}>
                              <option value="">{t('noFolder')}</option>
                              {folders.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                         </select>
                    </div>
               )}

               <div className={styles.field}>
                    <label>{t('notes')}</label>
                    <RichTextEditor name="content" initialContent={defaultValues?.content ?? ''} />
               </div>

               <button type="submit" disabled={pending} className={styles.submit}>
                    {pending ? t('saving') : t('save')}
               </button>
          </form>
     )
}
