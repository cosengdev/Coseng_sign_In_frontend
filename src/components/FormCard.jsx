import { useNavigate } from 'react-router-dom'
import styles from './FormCard.module.css'

export default function FormCard({ title, subtitle, backTo, children }) {
  const navigate = useNavigate()

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        {backTo && (
          <button className={styles.back} onClick={() => navigate(backTo)} aria-label="Go back">
            <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        <div>
          <h2 className={styles.title}>{title}</h2>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
      </div>
      <div className={styles.body}>{children}</div>
    </div>
  )
}
