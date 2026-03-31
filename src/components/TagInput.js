'use client'

import { useState, useRef } from 'react'
import styles from './TagInput.module.css'

export default function TagInput({ name, defaultValue = [], suggestions = [] }) {
  const [tags, setTags] = useState(defaultValue)
  const [input, setInput] = useState('')
  const inputRef = useRef(null)

  function addTag(raw) {
    const tag = raw.trim().toLowerCase()
    if (tag && !tags.includes(tag)) {
      setTags(prev => [...prev, tag])
    }
    setInput('')
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(input)
    } else if (e.key === 'Backspace' && input === '' && tags.length > 0) {
      setTags(prev => prev.slice(0, -1))
    }
  }

  function removeTag(tag) {
    setTags(prev => prev.filter(t => t !== tag))
  }

  return (
    <div className={styles.wrapper} onClick={() => inputRef.current?.focus()}>
      {tags.map(tag => (
        <span key={tag} className={styles.pill}>
          {tag}
          <button
            type="button"
            className={styles.remove}
            onClick={e => { e.stopPropagation(); removeTag(tag) }}
            aria-label={`Tag "${tag}" entfernen`}
          >
            ×
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        type="text"
        list="tag-suggestions"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => { if (input.trim()) addTag(input) }}
        className={styles.input}
        placeholder={tags.length === 0 ? 'Tag eingeben, Enter oder Komma zum Bestätigen' : ''}
      />
      <datalist id="tag-suggestions">
        {suggestions
          .filter(s => !tags.includes(s))
          .map(s => <option key={s} value={s} />)
        }
      </datalist>
      <input type="hidden" name={name} value={JSON.stringify(tags)} />
    </div>
  )
}
