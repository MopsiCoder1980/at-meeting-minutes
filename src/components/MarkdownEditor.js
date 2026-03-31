'use client'

import { useRef } from 'react'
import {
  Bold,
  Italic,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Table,
  Minus,
} from 'lucide-react'
import styles from './MarkdownEditor.module.css'

const TABLE_TEMPLATE = `\n| Spalte 1 | Spalte 2 | Spalte 3 |\n| --- | --- | --- |\n| Zelle | Zelle | Zelle |\n`

const TOOLBAR = [
  {
    group: 'format',
    items: [
      { icon: Bold,          title: 'Fett (Strg+B)',    wrap: ['**', '**'], placeholder: 'fetter Text' },
      { icon: Italic,        title: 'Kursiv (Strg+I)',  wrap: ['*', '*'],   placeholder: 'kursiver Text' },
      { icon: Strikethrough, title: 'Durchgestrichen',  wrap: ['~~', '~~'], placeholder: 'Text' },
    ],
  },
  {
    group: 'align',
    items: [
      { icon: AlignLeft,   title: 'Links',     align: 'left' },
      { icon: AlignCenter, title: 'Zentriert', align: 'center' },
      { icon: AlignRight,  title: 'Rechts',    align: 'right' },
    ],
  },
  {
    group: 'list',
    items: [
      { icon: List,         title: 'Aufzählung',        list: 'bullet' },
      { icon: ListOrdered,  title: 'Nummerierte Liste', list: 'ordered' },
    ],
  },
  {
    group: 'insert',
    items: [
      { icon: Table, title: 'Tabelle einfügen', insert: TABLE_TEMPLATE },
      { icon: Minus, title: 'Trennlinie',       insert: '\n---\n' },
    ],
  },
]

function applyWrap(value, start, end, open, close, placeholder) {
  const selected = value.slice(start, end) || placeholder
  const newValue = value.slice(0, start) + open + selected + close + value.slice(end)
  return { newValue, selStart: start + open.length, selEnd: start + open.length + selected.length }
}

function applyAlign(value, start, end, dir) {
  if (dir === 'left') return { newValue: value, selStart: start, selEnd: end }
  const selected = value.slice(start, end) || 'Text'
  const block = `<div style="text-align:${dir}">\n\n${selected}\n\n</div>`
  const newValue = value.slice(0, start) + block + value.slice(end)
  return { newValue, selStart: start, selEnd: start + block.length }
}

function applyList(value, start, end, type) {
  const before = value.slice(0, start)
  const selected = value.slice(start, end)
  const lines = (selected || 'Element').split('\n')
  const prefixed = type === 'bullet'
    ? lines.map(l => `- ${l}`).join('\n')
    : lines.map((l, i) => `${i + 1}. ${l}`).join('\n')
  const newValue = before + prefixed + value.slice(end)
  return { newValue, selStart: start, selEnd: start + prefixed.length }
}

function applyInsert(value, start, text) {
  const newValue = value.slice(0, start) + text + value.slice(start)
  const pos = start + text.length
  return { newValue, selStart: pos, selEnd: pos }
}

export default function MarkdownEditor({ value, onChange, placeholder }) {
  const taRef = useRef(null)

  function handleAction(item) {
    const ta = taRef.current
    if (!ta) return
    const start = ta.selectionStart
    const end = ta.selectionEnd
    let result

    if (item.wrap) {
      result = applyWrap(value, start, end, item.wrap[0], item.wrap[1], item.placeholder)
    } else if (item.align !== undefined) {
      result = applyAlign(value, start, end, item.align)
    } else if (item.list) {
      result = applyList(value, start, end, item.list)
    } else if (item.insert !== undefined) {
      result = applyInsert(value, start, item.insert)
    } else {
      return
    }

    onChange(result.newValue)
    requestAnimationFrame(() => {
      ta.focus()
      ta.setSelectionRange(result.selStart, result.selEnd)
    })
  }

  function handleKeyDown(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
      e.preventDefault()
      handleAction({ wrap: ['**', '**'], placeholder: 'fetter Text' })
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
      e.preventDefault()
      handleAction({ wrap: ['*', '*'], placeholder: 'kursiver Text' })
    }
  }

  return (
    <div className={styles.editor}>
      <div className={styles.toolbar} role="toolbar" aria-label="Formatierungsleiste">
        {TOOLBAR.map((group, gi) => (
          <div key={group.group} className={styles.group}>
            {group.items.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.title}
                  type="button"
                  title={item.title}
                  aria-label={item.title}
                  className={styles.btn}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    handleAction(item)
                  }}
                >
                  <Icon size={15} strokeWidth={2} />
                </button>
              )
            })}
          </div>
        ))}
      </div>

      <textarea
        ref={taRef}
        name="content"
        id="content"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={14}
        required
        placeholder={placeholder}
        className={styles.textarea}
        spellCheck
      />
    </div>
  )
}
