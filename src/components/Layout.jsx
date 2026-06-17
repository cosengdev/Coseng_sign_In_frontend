import styles from './Layout.module.css'
import { useClock } from '../hooks/useClock'

export default function Layout({ children }) {
  const { time, date } = useClock()

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <div className={styles.logo}>
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <div>
            <div className={styles.orgName}>COSENG Limited</div>
            <div className={styles.orgSub}>Access &amp; Attendance System</div>
          </div>
        </div>
        <div className={styles.clock}>{time}</div>
      </header>

      <main className={styles.main}>
        {children}
      </main>
    </div>
  )
}
