'use client'

import { useState, useEffect } from 'react'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import styles from './CalendarOverlay.module.css'

function toDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export default function CalendarOverlay({ minuteDates, onClose, onApply }) {
  const [selected, setSelected] = useState(null)

  const markedDays = new Set(minuteDates)

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  function handleDayClick(date) {
    const key = toDateKey(date)
    if (!markedDays.has(key)) return
    setSelected(key === selected ? null : key)
  }

  function handleApply() {
    if (selected) {
      onApply(selected)
      onClose()
    }
  }

  function tileClassName({ date, view }) {
    if (view !== 'month') return null
    const key = toDateKey(date)
    const classes = []
    if (markedDays.has(key)) classes.push(styles.tileMarked)
    if (key === selected) classes.push(styles.tileSelected)
    return classes.join(' ') || null
  }

  function tileContent({ date, view }) {
    if (view !== 'month') return null
    const key = toDateKey(date)
    if (!markedDays.has(key)) return null
    return <span className={styles.dot} />
  }

  return (
    <div className={styles.backdrop} onMouseDown={onClose}>
      <div
        className={styles.modal}
        onMouseDown={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Kalender"
      >
        <div className={styles.header}>
          <span className={styles.title}>Kalender</span>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Schließen">×</button>
        </div>

        <Calendar
          locale="de-DE"
          onClickDay={handleDayClick}
          tileClassName={tileClassName}
          tileContent={tileContent}
          className={styles.calendar}
        />

        <div className={styles.footer}>
          <span className={styles.hint}>
            {selected
              ? `Ausgewählt: ${new Date(selected + 'T00:00:00').toLocaleDateString('de-DE', { dateStyle: 'long' })}`
              : 'Tag mit Meeting anklicken'}
          </span>
          <button
            className={styles.applyBtn}
            onClick={handleApply}
            disabled={!selected}
          >
            Anzeigen
          </button>
        </div>
      </div>
    </div>
  )
}
