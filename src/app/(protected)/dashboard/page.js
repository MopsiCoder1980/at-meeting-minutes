import { getAuthUser } from '@/lib/auth'
import { getAllMinutes } from '@/lib/store'
import { getFoldersForUser } from '@/lib/folders'
import { getPageSize } from '@/lib/settings'
import { getTranslations } from 'next-intl/server'
import DraggableMinutesList from '@/components/DraggableMinutesList'
import Pagination from '@/components/Pagination'
import SortSelect from '@/components/SortSelect'
import MineToggle from '@/components/MineToggle'
import CalendarButton from '@/components/CalendarButton'
import DateFilterBadge from '@/components/DateFilterBadge'
import styles from './page.module.css'

function toDateKey(isoString) {
     if (!isoString) return null
     const d = new Date(isoString)
     return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default async function DashboardPage({ searchParams }) {
     const { sort = 'date-desc', mine, folder, date, page } = await searchParams
     const onlyMine = mine === '1'
     const currentPage = Math.max(1, parseInt(page ?? '1', 10) || 1)

     const [authUser, allMinutes, folders, pageSize, t] = await Promise.all([
          getAuthUser(),
          getAllMinutes(),
          getFoldersForUser(),
          getPageSize(),
          getTranslations('dashboard'),
     ])

     const activeFolder = folders.find(f => f.id === folder) ?? null

     const visibleMinutes = allMinutes.filter(m => {
          if (folder && m.folderId !== folder) return false
          if (date && toDateKey(m.meetingDate ?? m.createdAt) !== date) return false
          if (onlyMine) return m.ownerId === authUser.userId
          if (authUser.role === 'admin') return true
          if (m.ownerId === authUser.userId) return true
          if (m.visibility === 'shared') return true
          return false
     })

     visibleMinutes.sort((a, b) => {
          const da = new Date(a.meetingDate ?? a.createdAt)
          const db = new Date(b.meetingDate ?? b.createdAt)
          return sort === 'date-asc' ? da - db : db - da
     })

     const totalPages = Math.max(1, Math.ceil(visibleMinutes.length / pageSize))
     const safePage = Math.min(currentPage, totalPages)
     const pageMinutes = visibleMinutes.slice((safePage - 1) * pageSize, safePage * pageSize)

     const allVisibleForCalendar = allMinutes.filter(m => {
          if (authUser.role === 'admin') return true
          if (m.ownerId === authUser.userId) return true
          return m.visibility === 'shared'
     })
     const minuteDates = [...new Set(allVisibleForCalendar.map(m => toDateKey(m.meetingDate ?? m.createdAt)).filter(Boolean))]

     return (
          <div className={styles.container}>
               <div className={styles.header}>
                    <h1>{activeFolder ? activeFolder.name : t('overview')}</h1>
                    <p className={styles.role}>
                         {t('loggedInAs')} <strong>{authUser.fullName}</strong>
                         {authUser.role === 'admin' && <span className={styles.adminBadge}>{t('adminBadge')}</span>}
                    </p>
               </div>
               <div className={styles.toolbar}>
                    <MineToggle active={onlyMine} />
                    <SortSelect current={sort} />
                    <CalendarButton minuteDates={minuteDates} />
               </div>
               {date && <DateFilterBadge date={date} />}
               <DraggableMinutesList minutes={pageMinutes} folders={folders} />
               <Pagination currentPage={safePage} totalPages={totalPages} />
          </div>
     )
}
