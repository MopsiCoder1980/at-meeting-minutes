'use client'

import { useState } from 'react'
import ReactDatePicker, { registerLocale } from 'react-datepicker'
import { de } from 'date-fns/locale/de'
import 'react-datepicker/dist/react-datepicker.css'
import styles from './DateTimePicker.module.css'

registerLocale('de', de)

export default function DateTimePicker({ name, defaultValue }) {
  const [selected, setSelected] = useState(
    defaultValue ? new Date(defaultValue) : null
  )

  return (
    <div className={styles.wrapper}>
      <ReactDatePicker
        selected={selected}
        onChange={setSelected}
        locale="de"
        dateFormat="dd.MM.yyyy HH:mm"
        showTimeSelect
        timeFormat="HH:mm"
        timeIntervals={15}
        timeCaption="Uhrzeit"
        placeholderText="TT.MM.JJJJ HH:MM"
        className={styles.input}
        calendarClassName={styles.calendar}
        isClearable
        showWeekNumbers
      />
      <input
        type="hidden"
        name={name}
        value={selected ? selected.toISOString() : ''}
      />
    </div>
  )
}
