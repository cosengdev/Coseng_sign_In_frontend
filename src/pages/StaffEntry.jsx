import { useNavigate } from 'react-router-dom'
import FormCard from '../components/FormCard'
import styles from './StaffEntry.module.css'

export default function StaffEntry() {
  const navigate = useNavigate()

  return (
    <FormCard title="Staff Access" subtitle="Select your access level" backTo="/">
      <p className={styles.hint}>Are you an admin or a regular staff member?</p>
      <div className={styles.options}>
        <button className={`${styles.optionCard} ${styles.admin}`} onClick={() => navigate('/admin/login')}>
          <div className={styles.iconWrap}>
            <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
          </div>
          <div>
            <h3>Admin</h3>
            <p>View dashboard &amp; attendance logs</p>
          </div>
        </button>

        <button className={`${styles.optionCard} ${styles.staff}`} onClick={() => navigate('/staff/badge')}>
          <div className={styles.iconWrap}>
            <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </div>
          <div>
            <h3>Non-Admin</h3>
            <p>Sign in or sign out</p>
          </div>
        </button>
      </div>
    </FormCard>
  )
}
