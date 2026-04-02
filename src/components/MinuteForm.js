'use client'

import { useActionState, useState, useCallback } from 'react'
import RichTextEditor from './RichTextEditor'
import DateTimePicker from './DateTimePicker'
import TagInput from './TagInput'
import styles from './MinuteForm.module.css'

function ListField({ label, items, onChange }) {
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
               <button type="button" className={styles.addBtn} onClick={add}>+ Hinzufügen</button>
          </div>
     )
}

function UserListField({ label, items, onChange, usernames }) {
     const available = usernames.filter(u => !items.includes(u))

     function add(username) {
          if (username) onChange([...items, username])
     }
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
                         <option value="">+ User hinzufügen…</option>
                         {available.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
               )}
          </div>
     )
}

function ActionItemsField({ items, onChange, usernames }) {
     function add() { onChange([...items, { task: '', personInCharge: '', deadline: '' }]) }
     function remove(i) { onChange(items.filter((_, idx) => idx !== i)) }
     function update(i, key, val) { onChange(items.map((v, idx) => idx === i ? { ...v, [key]: val } : v)) }

     return (
          <div className={styles.listField}>
               {items.map((item, i) => (
                    <div key={i} className={styles.actionRow}>
                         <input type="text" placeholder="Aufgabe" value={item.task} onChange={e => update(i, 'task', e.target.value)} className={styles.actionTask} />
                         <select value={item.personInCharge} onChange={e => update(i, 'personInCharge', e.target.value)} className={styles.actionPerson}>
                              <option value="">— Person —</option>
                              {usernames.map(u => <option key={u} value={u}>{u}</option>)}
                         </select>
                         <input type="date" value={item.deadline} onChange={e => update(i, 'deadline', e.target.value)} className={styles.actionDeadline} />
                         <button type="button" className={styles.removeBtn} onClick={() => remove(i)}>×</button>
                    </div>
               ))}
               <button type="button" className={styles.addBtn} onClick={add}>+ Hinzufügen</button>
          </div>
     )
}

export default function MinuteForm({ action, defaultValues, allTags = [], folders, allUsers = [] }) {
     const usernames = allUsers.map(u => u.username)
     const [state, formAction, pending] = useActionState(action, null)

     const def = defaultValues?.structure ?? {}
     const defAttendees = def.attendees ?? { meetingOwners: [], agendaOwners: [], attendees: [] }

     const [meetingOwners, setMeetingOwners] = useState(defAttendees.meetingOwners ?? [])
     const [agendaOwners, setAgendaOwners] = useState(defAttendees.agendaOwners ?? [])
     const [attendees, setAttendees] = useState(defAttendees.attendees ?? [])
     const [topics, setTopics] = useState(def.topics ?? [])
     const [decisions, setDecisions] = useState(def.decisions ?? [])
     const [actionItems, setActionItems] = useState(def.actionItems ?? [])
     const [openQuestions, setOpenQuestions] = useState(def.openQuestions ?? [])

     const structure = JSON.stringify({
          attendees: { meetingOwners, agendaOwners, attendees },
          topics,
          decisions,
          actionItems,
          openQuestions,
     })

     return (
          <form action={formAction} className={styles.form}>
               {state?.error && <p className={styles.error}>{state.error}</p>}

               <div className={styles.field}>
                    <label htmlFor="projectTitle">Projekttitel</label>
                    <input
                         id="projectTitle"
                         name="projectTitle"
                         type="text"
                         defaultValue={defaultValues?.projectTitle ?? ''}
                         required
                         placeholder="Projekttitel"
                    />
               </div>

               <div className={styles.field}>
                    <label htmlFor="title">Meeting-Titel</label>
                    <input
                         id="title"
                         name="title"
                         type="text"
                         defaultValue={defaultValues?.title ?? ''}
                         required
                         placeholder="Meeting-Titel"
                    />
               </div>

               <div className={styles.field}>
                    <label>Datum &amp; Uhrzeit</label>
                    <DateTimePicker name="meetingDate" defaultValue={defaultValues?.meetingDate ?? ''} />
               </div>

               <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>Teilnehmer</h3>
                    <UserListField label="Meeting Owner(s)" items={meetingOwners} onChange={setMeetingOwners} usernames={usernames} />
                    <UserListField label="Agenda Owner(s)" items={agendaOwners} onChange={setAgendaOwners} usernames={usernames} />
                    <UserListField label="Teilnehmer" items={attendees} onChange={setAttendees} usernames={usernames} />
               </div>

               <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>Themen</h3>
                    <ListField label="" items={topics} onChange={setTopics} />
               </div>

               <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>Entscheidungen</h3>
                    <ListField label="" items={decisions} onChange={setDecisions} />
               </div>

               <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>Action Items</h3>
                    <div className={styles.actionHeader}>
                         <span>Aufgabe</span><span>Verantwortlich</span><span>Deadline</span>
                    </div>
                    <ActionItemsField items={actionItems} onChange={setActionItems} usernames={usernames} />
               </div>

               <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>Offene Fragen</h3>
                    <ListField label="" items={openQuestions} onChange={setOpenQuestions} />
               </div>

               <input type="hidden" name="structure" value={structure} />

               <div className={styles.field}>
                    <label>Tags</label>
                    <TagInput name="tags" defaultValue={defaultValues?.tags ?? []} suggestions={allTags} />
               </div>

               <div className={styles.field}>
                    <label htmlFor="visibility">Sichtbarkeit</label>
                    <select id="visibility" name="visibility" defaultValue={defaultValues?.visibility ?? 'private'}>
                         <option value="private">Privat (nur ich)</option>
                         <option value="shared">Geteilt (alle Benutzer)</option>
                    </select>
               </div>

               {folders && (
                    <div className={styles.field}>
                         <label htmlFor="folderId">Ordner</label>
                         <select id="folderId" name="folderId" defaultValue={defaultValues?.folderId ?? ''}>
                              <option value="">— Kein Ordner —</option>
                              {folders.map(f => (
                                   <option key={f.id} value={f.id}>{f.name}</option>
                              ))}
                         </select>
                    </div>
               )}

               <div className={styles.field}>
                    <label>Notizen</label>
                    <RichTextEditor
                         name="content"
                         initialContent={defaultValues?.content ?? ''}
                    />
               </div>

               <button type="submit" disabled={pending} className={styles.submit}>
                    {pending ? 'Wird gespeichert...' : 'Speichern'}
               </button>
          </form>
     )
}
