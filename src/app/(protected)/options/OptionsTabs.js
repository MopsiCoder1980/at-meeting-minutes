'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import styles from './OptionsTabs.module.css'

export default function OptionsTabs({ tabs }) {
     const t = useTranslations('options')
     const [active, setActive] = useState(0)

     return (
          <div className={styles.wrapper}>
               <div className={styles.tabBar} role="tablist">
                    {tabs.map((tab, i) => (
                         <button
                              key={tab.key}
                              role="tab"
                              aria-selected={active === i}
                              className={`${styles.tab} ${active === i ? styles.tabActive : ''}`}
                              onClick={() => setActive(i)}
                         >
                              {t(tab.labelKey)}
                         </button>
                    ))}
               </div>

               {tabs.map((tab, i) => (
                    <div
                         key={tab.key}
                         role="tabpanel"
                         hidden={active !== i}
                         className={styles.panel}
                    >
                         {tab.content}
                    </div>
               ))}
          </div>
     )
}
