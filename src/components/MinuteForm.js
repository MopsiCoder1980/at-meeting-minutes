'use client'

import { useActionState } from 'react'
import RichTextEditor from './RichTextEditor'
import DateTimePicker from './DateTimePicker'
import TagInput from './TagInput'
import styles from './MinuteForm.module.css'

export default function MinuteForm({ action, defaultValues, allTags = [], folders }) {
  const [state, formAction, pending] = useActionState(action, null)

  return (
    <form action={formAction} className={styles.form}>
      {state?.error && <p className={styles.error}>{state.error}</p>}

      <div className={styles.field}>
        <label htmlFor="title">Titel</label>
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

      <div className={styles.field}>
        <label htmlFor="content">Inhalt</label>
        <RichTextEditor
          name="content"
          initialContent={defaultValues?.content ?? ''}
        />
      </div>

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

      <button type="submit" disabled={pending} className={styles.submit}>
        {pending ? 'Wird gespeichert...' : 'Speichern'}
      </button>
    </form>
  )
}
