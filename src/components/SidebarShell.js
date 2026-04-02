'use client'

import { useRef, useState, useCallback } from 'react'
import styles from './Sidebar.module.css'

const DEFAULT_WIDTH = 220
const MIN_WIDTH = 140
const MAX_WIDTH = 480

export default function SidebarShell({ children }) {
     const [width, setWidth] = useState(DEFAULT_WIDTH)
     const dragging = useRef(false)
     const startX = useRef(0)
     const startWidth = useRef(0)

     const onMouseDown = useCallback((e) => {
          e.preventDefault()
          dragging.current = true
          startX.current = e.clientX
          startWidth.current = width

          function onMouseMove(e) {
               if (!dragging.current) return
               const delta = e.clientX - startX.current
               const next = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startWidth.current + delta))
               setWidth(next)
          }

          function onMouseUp() {
               dragging.current = false
               document.removeEventListener('mousemove', onMouseMove)
               document.removeEventListener('mouseup', onMouseUp)
               document.body.style.cursor = ''
               document.body.style.userSelect = ''
          }

          document.addEventListener('mousemove', onMouseMove)
          document.addEventListener('mouseup', onMouseUp)
          document.body.style.cursor = 'col-resize'
          document.body.style.userSelect = 'none'
     }, [width])

     return (
          <aside className={styles.sidebar} style={{ width }}>
               <div className={styles.inner}>
                    {children}
               </div>
               <div className={styles.resizeHandle} onMouseDown={onMouseDown} />
          </aside>
     )
}
