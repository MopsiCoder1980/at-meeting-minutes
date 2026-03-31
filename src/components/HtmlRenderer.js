import styles from './HtmlRenderer.module.css'

export default function HtmlRenderer({ content }) {
  return (
    <div
      className={styles.prose}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  )
}
