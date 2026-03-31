'use client'

import { useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TextAlign from '@tiptap/extension-text-align'
import { Table, TableRow, TableHeader, TableCell } from '@tiptap/extension-table'
import {
  Bold, Italic, Strikethrough,
  AlignLeft, AlignCenter, AlignRight,
  List, ListOrdered,
  Table as TableIcon, Minus,
  Undo, Redo,
} from 'lucide-react'
import styles from './RichTextEditor.module.css'

function Btn({ onClick, active, disabled, title, children }) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={active ?? false}
      disabled={disabled ?? false}
      className={`${styles.btn} ${active ? styles.active : ''}`}
      onMouseDown={(e) => { e.preventDefault(); onClick() }}
    >
      {children}
    </button>
  )
}

function Sep() {
  return <div className={styles.sep} aria-hidden="true" />
}

export default function RichTextEditor({ initialContent, name }) {
  const hiddenRef = useRef(null)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: initialContent || '',
    editorProps: {
      attributes: { class: styles.content, spellcheck: 'true' },
    },
    onUpdate({ editor }) {
      if (hiddenRef.current) {
        const html = editor.getHTML()
        hiddenRef.current.value = html === '<p></p>' ? '' : html
      }
    },
    immediatelyRender: false,
  })

  const initialHtml = initialContent && initialContent !== '<p></p>' ? initialContent : ''

  if (!editor) return null

  const e = editor

  return (
    <div className={styles.wrapper}>
      <input
        ref={hiddenRef}
        type="hidden"
        name={name ?? 'content'}
        defaultValue={initialHtml}
      />

      <div className={styles.toolbar} role="toolbar" aria-label="Formatierungsleiste">
        {/* Undo / Redo */}
        <div className={styles.group}>
          <Btn title="Rückgängig (Strg+Z)" disabled={!e.can().undo()} onClick={() => e.chain().focus().undo().run()}>
            <Undo size={15} strokeWidth={2} />
          </Btn>
          <Btn title="Wiederholen (Strg+Y)" disabled={!e.can().redo()} onClick={() => e.chain().focus().redo().run()}>
            <Redo size={15} strokeWidth={2} />
          </Btn>
        </div>

        <Sep />

        {/* Format */}
        <div className={styles.group}>
          <Btn title="Fett (Strg+B)" active={e.isActive('bold')} onClick={() => e.chain().focus().toggleBold().run()}>
            <Bold size={15} strokeWidth={2.5} />
          </Btn>
          <Btn title="Kursiv (Strg+I)" active={e.isActive('italic')} onClick={() => e.chain().focus().toggleItalic().run()}>
            <Italic size={15} strokeWidth={2} />
          </Btn>
          <Btn title="Durchgestrichen" active={e.isActive('strike')} onClick={() => e.chain().focus().toggleStrike().run()}>
            <Strikethrough size={15} strokeWidth={2} />
          </Btn>
        </div>

        <Sep />

        {/* Ausrichtung */}
        <div className={styles.group}>
          <Btn title="Links ausrichten" active={e.isActive({ textAlign: 'left' })} onClick={() => e.chain().focus().setTextAlign('left').run()}>
            <AlignLeft size={15} strokeWidth={2} />
          </Btn>
          <Btn title="Zentrieren" active={e.isActive({ textAlign: 'center' })} onClick={() => e.chain().focus().setTextAlign('center').run()}>
            <AlignCenter size={15} strokeWidth={2} />
          </Btn>
          <Btn title="Rechts ausrichten" active={e.isActive({ textAlign: 'right' })} onClick={() => e.chain().focus().setTextAlign('right').run()}>
            <AlignRight size={15} strokeWidth={2} />
          </Btn>
        </div>

        <Sep />

        {/* Listen */}
        <div className={styles.group}>
          <Btn title="Aufzählung" active={e.isActive('bulletList')} onClick={() => e.chain().focus().toggleBulletList().run()}>
            <List size={15} strokeWidth={2} />
          </Btn>
          <Btn title="Nummerierte Liste" active={e.isActive('orderedList')} onClick={() => e.chain().focus().toggleOrderedList().run()}>
            <ListOrdered size={15} strokeWidth={2} />
          </Btn>
        </div>

        <Sep />

        {/* Einfügen */}
        <div className={styles.group}>
          <Btn title="Tabelle einfügen" onClick={() => e.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}>
            <TableIcon size={15} strokeWidth={2} />
          </Btn>
          <Btn title="Trennlinie einfügen" onClick={() => e.chain().focus().setHorizontalRule().run()}>
            <Minus size={15} strokeWidth={2} />
          </Btn>
        </div>
      </div>

      <EditorContent editor={editor} className={styles.editorWrap} />
    </div>
  )
}
