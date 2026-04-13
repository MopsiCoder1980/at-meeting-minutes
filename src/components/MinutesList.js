import Link from 'next/link'
import { getTranslations, getLocale } from 'next-intl/server'
import styles from './MinutesList.module.css'

export default async function MinutesList({ minutes }) {
  const [tList, tMinute, locale] = await Promise.all([
    getTranslations('minutesList'),
    getTranslations('minute'),
    getLocale(),
  ])

  if (minutes.length === 0) {
    return (
      <div className={styles.empty}>
        <p>{tList('empty')}</p>
        <Link href="/minutes/new">{tList('createFirst')}</Link>
      </div>
    )
  }

  return (
    <ul className={styles.list}>
      {minutes.map(m => (
        <li key={m.id} className={styles.item}>
          <Link href={`/minutes/${m.id}`} className={styles.title}>
            {m.title}
          </Link>
          <div className={styles.meta}>
            <div className={styles.metaLeft}>
              <span className={`${styles.badge} ${m.visibility === 'shared' ? styles.shared : styles.private}`}>
                {m.visibility === 'shared' ? tMinute('shared') : tMinute('private')}
              </span>
              <span className={styles.author}>{m.ownerName}</span>
              <span className={styles.date}>
                {new Date(m.meetingDate ?? m.createdAt).toLocaleString(locale, { dateStyle: 'short', timeStyle: 'short' })}
              </span>
            </div>
            {m.tags?.length > 0 && (
              <div className={styles.tags}>
                {m.tags.map(tag => (
                  <span key={tag} className={styles.tag}>{tag}</span>
                ))}
              </div>
            )}
          </div>
        </li>
      ))}
    </ul>
  )
}
