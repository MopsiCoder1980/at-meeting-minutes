import { getAuthUser, canView } from '@/lib/auth'
import { getMinuteById } from '@/lib/store'
import { getStringsFlat } from '@/lib/uiStrings'
import { getLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { readFile } from 'fs/promises'
import path from 'path'
import sanitizeHtml from 'sanitize-html'
import {
     Document, Page, Text, View, Image, StyleSheet, renderToBuffer, Font,
} from '@react-pdf/renderer'
import { PDFDocument } from 'pdf-lib'
import React from 'react'

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

function stripHtml(html) {
     return sanitizeHtml(html ?? '', { allowedTags: [], allowedAttributes: {} }).trim()
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
     const notesText = stripHtml(minute.content)
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
                    {notesText && (
                         <>
                              <Text style={styles.sectionTitle}>{strings['minute.sectionNotes'] ?? 'Notizen'}</Text>
                              <Text style={styles.notes}>{notesText}</Text>
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
