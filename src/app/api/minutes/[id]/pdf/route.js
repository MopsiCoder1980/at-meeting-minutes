import { getAuthUser, canView } from '@/lib/auth'
import { getMinuteById } from '@/lib/store'
import { getStringsFlat } from '@/lib/uiStrings'
import { getLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { readFile } from 'fs/promises'
import path from 'path'
import sanitizeHtml from 'sanitize-html'
import { parseDocument, DomUtils } from 'htmlparser2'
import {
     Document, Page, Text, View, Image, StyleSheet, renderToBuffer, Font,
} from '@react-pdf/renderer'
import { PDFDocument } from 'pdf-lib'
import React from 'react'

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

function stripHtml(html) {
     return sanitizeHtml(html ?? '', { allowedTags: [], allowedAttributes: {} }).trim()
}

// ── HTML → react-pdf renderer ────────────────────────────────────────────────

const htmlStyles = StyleSheet.create({
     p: { marginBottom: 6, fontSize: 10, lineHeight: 1.6, color: '#374151' },
     h1: { fontSize: 16, fontFamily: 'Helvetica-Bold', marginBottom: 6, marginTop: 10, color: '#111827' },
     h2: { fontSize: 14, fontFamily: 'Helvetica-Bold', marginBottom: 5, marginTop: 8, color: '#111827' },
     h3: { fontSize: 12, fontFamily: 'Helvetica-Bold', marginBottom: 4, marginTop: 6, color: '#111827' },
     h4: { fontSize: 11, fontFamily: 'Helvetica-Bold', marginBottom: 4, marginTop: 6, color: '#374151' },
     ul: { marginBottom: 6, paddingLeft: 0 },
     ol: { marginBottom: 6, paddingLeft: 0 },
     li: { flexDirection: 'row', marginBottom: 3 },
     liBullet: { width: 14, fontSize: 10, color: '#374151' },
     liContent: { flex: 1, fontSize: 10, lineHeight: 1.5, color: '#374151' },
     strong: { fontFamily: 'Helvetica-Bold' },
     em: { fontFamily: 'Helvetica-Oblique' },
     blockquote: { marginLeft: 10, paddingLeft: 8, borderLeft: '3 solid #d1d5db', color: '#6b7280', marginBottom: 6 },
     pre: { fontFamily: 'Courier', fontSize: 9, backgroundColor: '#f3f4f6', padding: 8, marginBottom: 6, color: '#111827' },
     code: { fontFamily: 'Courier', fontSize: 9, backgroundColor: '#f3f4f6', color: '#111827' },
     hr: { borderBottom: '1 solid #e5e7eb', marginVertical: 8 },
     table: { marginBottom: 8 },
     tableHeaderRow: { flexDirection: 'row', backgroundColor: '#f9fafb', borderBottom: '1 solid #e5e7eb' },
     tableRow: { flexDirection: 'row', borderBottom: '1 solid #f3f4f6' },
     tableCell: { flex: 1, fontSize: 9, paddingVertical: 4, paddingHorizontal: 6, color: '#374151' },
     tableCellHead: { flex: 1, fontSize: 9, fontFamily: 'Helvetica-Bold', paddingVertical: 4, paddingHorizontal: 6, color: '#111827' },
})

function getTextContent(node) {
     if (!node) return ''
     if (node.type === 'text') return node.data ?? ''
     if (node.children) return node.children.map(getTextContent).join('')
     return ''
}

function collectInlineSpans(nodes, accStyle = {}) {
     const spans = []
     for (const node of nodes ?? []) {
          if (node.type === 'text') {
               const text = node.data ?? ''
               if (text) spans.push({ text, style: accStyle })
          } else if (node.type === 'tag') {
               const tag = node.name?.toLowerCase()
               if (tag === 'br') { spans.push({ text: '\n', style: accStyle }); continue }
               let childStyle = { ...accStyle }
               if (tag === 'strong' || tag === 'b') {
                    childStyle.fontFamily = accStyle.fontFamily === 'Helvetica-Oblique' ? 'Helvetica-BoldOblique' : 'Helvetica-Bold'
               } else if (tag === 'em' || tag === 'i') {
                    childStyle.fontFamily = accStyle.fontFamily === 'Helvetica-Bold' ? 'Helvetica-BoldOblique' : 'Helvetica-Oblique'
               } else if (tag === 's' || tag === 'strike' || tag === 'del') {
                    childStyle.textDecoration = 'line-through'
               } else if (tag === 'code') {
                    childStyle.fontFamily = 'Courier'
                    childStyle.fontSize = 9
               }
               spans.push(...collectInlineSpans(node.children, childStyle))
          }
     }
     return spans
}

function renderInlineNodes(nodes, parentStyle = {}) {
     const spans = collectInlineSpans(nodes, parentStyle)
     if (!spans.length) return null
     return spans.map((span, i) => <Text key={i} style={span.style}>{span.text}</Text>)
}

function renderHtmlNodes(nodes, depth = 0) {
     if (!nodes?.length) return null
     return nodes.map((node, i) => {
          if (node.type === 'text') {
               const text = (node.data ?? '').replace(/\s+/g, ' ')
               if (!text.trim()) return null
               return <Text key={i} style={htmlStyles.p}>{text}</Text>
          }
          if (node.type !== 'tag') return null
          const tag = node.name?.toLowerCase()

          if (tag === 'p') {
               const children = node.children ?? []
               // Check if purely text/inline
               return (
                    <View key={i} style={htmlStyles.p}>
                         <Text>{renderInlineNodes(children, {})}</Text>
                    </View>
               )
          }

          if (tag === 'h1') return <Text key={i} style={htmlStyles.h1}>{getTextContent(node)}</Text>
          if (tag === 'h2') return <Text key={i} style={htmlStyles.h2}>{getTextContent(node)}</Text>
          if (tag === 'h3') return <Text key={i} style={htmlStyles.h3}>{getTextContent(node)}</Text>
          if (['h4', 'h5', 'h6'].includes(tag)) return <Text key={i} style={htmlStyles.h4}>{getTextContent(node)}</Text>

          if (tag === 'ul' || tag === 'ol') {
               const items = (node.children ?? []).filter(c => c.type === 'tag' && c.name === 'li')
               return (
                    <View key={i} style={tag === 'ul' ? htmlStyles.ul : htmlStyles.ol}>
                         {items.map((li, j) => {
                              const bullet = tag === 'ol' ? `${j + 1}.` : '•'
                              const hasNestedList = (li.children ?? []).some(c => c.type === 'tag' && (c.name === 'ul' || c.name === 'ol'))
                              const inlineChildren = (li.children ?? []).filter(c => !(c.type === 'tag' && (c.name === 'ul' || c.name === 'ol')))
                              const nestedLists = (li.children ?? []).filter(c => c.type === 'tag' && (c.name === 'ul' || c.name === 'ol'))
                              return (
                                   <View key={j}>
                                        <View style={[htmlStyles.li, depth > 0 ? { paddingLeft: 12 } : {}]}>
                                             <Text style={htmlStyles.liBullet}>{bullet}</Text>
                                             <View style={htmlStyles.liContent}>
                                                  <Text>{renderInlineNodes(inlineChildren, {})}</Text>
                                             </View>
                                        </View>
                                        {hasNestedList && (
                                             <View style={{ paddingLeft: 14 }}>
                                                  {renderHtmlNodes(nestedLists, depth + 1)}
                                             </View>
                                        )}
                                   </View>
                              )
                         })}
                    </View>
               )
          }

          if (tag === 'blockquote') {
               return (
                    <View key={i} style={htmlStyles.blockquote}>
                         {renderHtmlNodes(node.children, depth)}
                    </View>
               )
          }

          if (tag === 'pre') {
               return <Text key={i} style={htmlStyles.pre}>{getTextContent(node)}</Text>
          }

          if (tag === 'hr') {
               return <View key={i} style={htmlStyles.hr} />
          }

          if (tag === 'br') {
               return <Text key={i}>{'\n'}</Text>
          }

          if (tag === 'table') {
               const rows = []
               function collectRows(n) {
                    if (!n.children) return
                    for (const c of n.children) {
                         if (c.type === 'tag' && c.name === 'tr') rows.push(c)
                         else collectRows(c)
                    }
               }
               collectRows(node)

               return (
                    <View key={i} style={htmlStyles.table}>
                         {rows.map((row, ri) => {
                              const cells = (row.children ?? []).filter(c => c.type === 'tag' && (c.name === 'td' || c.name === 'th'))
                              const isHeader = cells.some(c => c.name === 'th')
                              return (
                                   <View key={ri} style={isHeader ? htmlStyles.tableHeaderRow : htmlStyles.tableRow}>
                                        {cells.map((cell, ci) => (
                                             <Text key={ci} style={isHeader ? htmlStyles.tableCellHead : htmlStyles.tableCell}>
                                                  {getTextContent(cell)}
                                             </Text>
                                        ))}
                                   </View>
                              )
                         })}
                    </View>
               )
          }

          // strong/em/code at block level — wrap in a paragraph
          if (['strong', 'b', 'em', 'i', 'code'].includes(tag)) {
               return (
                    <View key={i} style={htmlStyles.p}>
                         <Text>{renderInlineNodes([node], {})}</Text>
                    </View>
               )
          }

          // div, section, article, etc. — recurse
          if (node.children?.length) {
               return <View key={i}>{renderHtmlNodes(node.children, depth)}</View>
          }

          return null
     }).filter(Boolean)
}

function HtmlContent({ html }) {
     if (!html?.trim()) return null
     const clean = sanitizeHtml(html, {
          allowedTags: ['p', 'br', 'strong', 'b', 'em', 'i', 's', 'strike', 'del', 'ul', 'ol', 'li',
               'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'pre', 'code',
               'table', 'thead', 'tbody', 'tr', 'th', 'td', 'hr', 'div', 'span'],
          allowedAttributes: {},
     })
     const dom = parseDocument(clean)
     return <View>{renderHtmlNodes(dom.children)}</View>
}

function formatDate(dateStr, locale) {
     if (!dateStr) return '—'
     try { return new Date(dateStr).toLocaleString(locale, { dateStyle: 'medium', timeStyle: 'short' }) } catch { return dateStr }
}

function formatFileSize(bytes) {
     if (!bytes) return ''
     if (bytes < 1024) return `${bytes} B`
     if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
     return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const styles = StyleSheet.create({
     page: { fontFamily: 'Helvetica', fontSize: 10, padding: 40, color: '#111827', lineHeight: 1.5 },
     projectTitle: { fontSize: 9, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
     title: { fontSize: 18, fontFamily: 'Helvetica-Bold', marginBottom: 4 },
     meta: { fontSize: 9, color: '#6b7280', marginBottom: 16 },
     sectionTitle: { fontSize: 12, fontFamily: 'Helvetica-Bold', borderBottom: '1 solid #e5e7eb', paddingBottom: 4, marginBottom: 8, marginTop: 16 },
     bulletRow: { marginBottom: 3 },
     attendeeGroup: { fontSize: 8, color: '#6b7280', fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', marginBottom: 3, marginTop: 6 },
     attendeeSection: { flexDirection: 'row', gap: 24, flexWrap: 'wrap', marginBottom: 4 },
     attendeeCol: { flex: 1, minWidth: 120 },
     table: { marginTop: 4 },
     tableHeader: { flexDirection: 'row', backgroundColor: '#f9fafb', borderBottom: '1 solid #e5e7eb', paddingVertical: 5, paddingHorizontal: 6 },
     tableRow: { flexDirection: 'row', borderBottom: '1 solid #f3f4f6', paddingVertical: 5, paddingHorizontal: 6 },
     tableCell: { flex: 1, fontSize: 9 },
     tableCellHead: { flex: 1, fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#374151' },
     notes: { fontSize: 10, lineHeight: 1.6, color: '#374151' },
     image: { maxWidth: '100%', maxHeight: 300, marginBottom: 8, objectFit: 'contain' },
     imageCaption: { fontSize: 8, color: '#9ca3af', marginBottom: 12 },
     attachmentRow: { flexDirection: 'row', padding: '6 8', backgroundColor: '#f9fafb', borderRadius: 4, marginBottom: 4, alignItems: 'center' },
     attachmentName: { flex: 1, fontSize: 9 },
     attachmentMeta: { fontSize: 8, color: '#9ca3af' },
     emptyText: { color: '#9ca3af', fontStyle: 'italic' },
     tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 6 },
     tag: { fontSize: 8, backgroundColor: '#f3f4f6', border: '1 solid #d1d5db', borderRadius: 10, paddingVertical: 2, paddingHorizontal: 6, color: '#374151' },
})

function BulletList({ items }) {
     if (!items?.length) return <Text style={styles.emptyText}>—</Text>
     return items.map((item, i) => (
          <View key={i} style={styles.bulletRow}>
               <Text>{item}</Text>
          </View>
     ))
}

function MinutePDF({ minute, imageDataMap, strings, locale }) {
     const s = minute.structure ?? {}
     const att = s.attendees ?? {}
     const imageAttachments = (minute.attachments ?? []).filter(a => IMAGE_TYPES.includes(a.type))
     const otherAttachments = (minute.attachments ?? []).filter(a => !IMAGE_TYPES.includes(a.type))

     return (
          <Document>
               <Page size="A4" style={styles.page}>
                    {minute.projectTitle && <Text style={styles.projectTitle}>{minute.projectTitle}</Text>}
                    <Text style={styles.title}>{minute.title}</Text>
                    <Text style={styles.meta}>
                         {formatDate(minute.meetingDate ?? minute.createdAt, locale)}
                         {minute.ownerName ? `  ·  ${minute.ownerName}` : ''}
                    </Text>
                    {minute.tags?.length > 0 && (
                         <View style={styles.tags}>
                              {minute.tags.map((tag, i) => <Text key={i} style={styles.tag}>{tag}</Text>)}
                         </View>
                    )}

                    {/* Attendees */}
                    {(att.meetingOwners?.length > 0 || att.agendaOwners?.length > 0 || att.attendees?.length > 0) && (
                         <>
                              <Text style={styles.sectionTitle}>{strings['minute.sectionAttendees'] ?? 'Teilnehmer'}</Text>
                              <View style={styles.attendeeSection}>
                                   {[
                                        [strings['minute.meetingOwners'] ?? 'Meeting Owner(s)', att.meetingOwners],
                                        [strings['minute.agendaOwners'] ?? 'Agenda Owner(s)', att.agendaOwners],
                                        [strings['minute.attendees'] ?? 'Teilnehmer', att.attendees],
                                   ].filter(([, items]) => items?.length > 0).map(([label, items], i) => (
                                        <View key={i} style={styles.attendeeCol}>
                                             <Text style={styles.attendeeGroup}>{label}</Text>
                                             <BulletList items={items} />
                                        </View>
                                   ))}
                              </View>
                         </>
                    )}

                    {/* Topics */}
                    {s.topics?.length > 0 && (
                         <>
                              <Text style={styles.sectionTitle}>{strings['minute.sectionTopics'] ?? 'Themen'}</Text>
                              <BulletList items={s.topics} />
                         </>
                    )}

                    {/* Decisions */}
                    {s.decisions?.length > 0 && (
                         <>
                              <Text style={styles.sectionTitle}>{strings['minute.sectionDecisions'] ?? 'Entscheidungen'}</Text>
                              <BulletList items={s.decisions} />
                         </>
                    )}

                    {/* Action Items */}
                    {s.actionItems?.length > 0 && (
                         <>
                              <Text style={styles.sectionTitle}>{strings['minute.sectionActionItems'] ?? 'Action Items'}</Text>
                              <View style={styles.table}>
                                   <View style={styles.tableHeader}>
                                        <Text style={styles.tableCellHead}>{strings['minute.actionTask'] ?? 'Aufgabe'}</Text>
                                        <Text style={styles.tableCellHead}>{strings['minute.actionResponsible'] ?? 'Verantwortlich'}</Text>
                                        <Text style={styles.tableCellHead}>{strings['minute.actionDeadline'] ?? 'Deadline'}</Text>
                                   </View>
                                   {s.actionItems.map((item, i) => (
                                        <View key={i} style={styles.tableRow}>
                                             <Text style={styles.tableCell}>{item.task}</Text>
                                             <Text style={styles.tableCell}>{item.personInCharge || '—'}</Text>
                                             <Text style={styles.tableCell}>{item.deadline ? new Date(item.deadline).toLocaleDateString(locale) : '—'}</Text>
                                        </View>
                                   ))}
                              </View>
                         </>
                    )}

                    {/* Open Questions */}
                    {s.openQuestions?.length > 0 && (
                         <>
                              <Text style={styles.sectionTitle}>{strings['minute.sectionOpenQuestions'] ?? 'Offene Fragen'}</Text>
                              <BulletList items={s.openQuestions} />
                         </>
                    )}

                    {/* Notes */}
                    {minute.content?.trim() && (
                         <>
                              <Text style={styles.sectionTitle}>{strings['minute.sectionNotes'] ?? 'Notizen'}</Text>
                              <HtmlContent html={minute.content} />
                         </>
                    )}

                    {/* Image Attachments */}
                    {imageAttachments.length > 0 && (
                         <>
                              <Text style={styles.sectionTitle}>{strings['minute.sectionAttachments'] ?? 'Dateianhänge'}</Text>
                              {imageAttachments.map((a, i) => {
                                   const data = imageDataMap[a.url]
                                   if (!data) return null
                                   return (
                                        <View key={i}>
                                             <Image style={styles.image} src={data} />
                                             <Text style={styles.imageCaption}>{a.name}</Text>
                                        </View>
                                   )
                              })}
                         </>
                    )}

                    {/* Non-image attachments list */}
                    {otherAttachments.length > 0 && (
                         <>
                              {imageAttachments.length === 0 && (
                                   <Text style={styles.sectionTitle}>{strings['minute.sectionAttachments'] ?? 'Dateianhänge'}</Text>
                              )}
                              {otherAttachments.map((a, i) => (
                                   <View key={i} style={styles.attachmentRow}>
                                        <Text style={styles.attachmentName}>{a.name}</Text>
                                        <Text style={styles.attachmentMeta}>
                                             {a.type?.split('/')[1]?.toUpperCase()} · {formatFileSize(a.size)} · {strings['minute.attachedToPdf'] ?? 'Als Anhang beigefügt'}
                                        </Text>
                                   </View>
                              ))}
                         </>
                    )}
               </Page>
          </Document>
     )
}

const UPLOAD_DIR = process.env.UPLOAD_DIR ?? path.join(process.cwd(), 'uploads')

async function loadImageData(att) {
     try {
          const filePath = path.join(UPLOAD_DIR, att.url.replace(/^\/api\/uploads\//, ''))
          const buffer = await readFile(filePath)
          const base64 = buffer.toString('base64')
          const mime = att.type === 'image/jpeg' ? 'image/jpeg' : att.type === 'image/png' ? 'image/png' : 'image/jpeg'
          return `data:${mime};base64,${base64}`
     } catch { return null }
}

export async function GET(request, { params }) {
     const { id } = await params

     const [authUser, minute] = await Promise.all([getAuthUser(), getMinuteById(id)])
     if (!minute || !canView(authUser, minute)) return notFound()

     const locale = await getLocale()
     const strings = await getStringsFlat(locale)

     const imageAttachments = (minute.attachments ?? []).filter(a => IMAGE_TYPES.includes(a.type))
     const otherAttachments = (minute.attachments ?? []).filter(a => !IMAGE_TYPES.includes(a.type))

     // Load image data as base64
     const imageDataEntries = await Promise.all(
          imageAttachments.map(async a => [a.url, await loadImageData(a)])
     )
     const imageDataMap = Object.fromEntries(imageDataEntries.filter(([, v]) => v !== null))

     // Generate base PDF with react-pdf
     const pdfBuffer = await renderToBuffer(
          <MinutePDF minute={minute} imageDataMap={imageDataMap} strings={strings} locale={locale} />
     )

     // Embed non-image files as PDF attachments via pdf-lib
     let finalBuffer = pdfBuffer
     if (otherAttachments.length > 0) {
          const pdfDoc = await PDFDocument.load(pdfBuffer)
          await Promise.all(otherAttachments.map(async (att) => {
               try {
                    const filePath = path.join(UPLOAD_DIR, att.url.replace(/^\/api\/uploads\//, ''))
                    const fileBuffer = await readFile(filePath)
                    await pdfDoc.attach(fileBuffer, att.name, {
                         mimeType: att.type ?? 'application/octet-stream',
                         description: att.name,
                         creationDate: new Date(),
                         modificationDate: new Date(),
                    })
               } catch { /* skip missing files */ }
          }))
          finalBuffer = await pdfDoc.save()
     }

     const filename = `${minute.projectTitle ? minute.projectTitle + ' - ' : ''}${minute.title}.pdf`
          .replace(/[<>:"/\\|?*]/g, '_')

     return new Response(finalBuffer, {
          headers: {
               'Content-Type': 'application/pdf',
               'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
          },
     })
}
