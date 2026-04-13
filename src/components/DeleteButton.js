'use client'

import { deleteMinuteAction } from '@/lib/actions'
import { useTranslations } from 'next-intl'
import styles from './DeleteButton.module.css'

export default function DeleteButton({ id }) {
     const t = useTranslations('minute')
     const action = deleteMinuteAction.bind(null, id)

     return (
          <form action={action} onSubmit={e => {
               if (!confirm(t('confirmDelete'))) e.preventDefault()
          }}>
               <button type="submit" className={styles.btn}>
                    {t('delete')}
               </button>
          </form>
     )
}
